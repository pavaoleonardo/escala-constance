import { Store, Employee, Shift, ScheduleAlert } from './types';

// Parse "HH:MM" to decimal hours (e.g. "10:30" -> 10.5)
export function parseTimeToDecimal(timeStr: string): number {
  if (!timeStr || timeStr === 'FERIAS') return 0;
  const [hrs, mins] = timeStr.split(':').map(Number);
  if (isNaN(hrs) || isNaN(mins)) return 0;
  return hrs + (mins / 60);
}

// Helper: Check if a shift is a rest day (folga or férias)
export function isRestShift(shift?: Shift | null): boolean {
  if (!shift) return true;
  return (
    (shift.start_time === '00:00' && shift.end_time === '00:00') ||
    !shift.start_time ||
    shift.start_time === 'FERIAS'
  );
}

// Format decimal hours to "HH:MM"
export function formatDecimalToTime(decimal: number): string {
  const hrs = Math.floor(decimal);
  const mins = Math.round((decimal - hrs) * 60);
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

// Calculate duration of a shift (work hours)
export function getShiftDuration(start: string, end: string, breakMin: number): number {
  const startDec = parseTimeToDecimal(start);
  const endDec = parseTimeToDecimal(end);
  const elapsed = endDec >= startDec ? (endDec - startDec) : (24 - startDec + endDec);
  return Math.max(0, elapsed - (breakMin / 60));
}

// Calculate total elapsed duration (before breaks)
export function getShiftElapsed(start: string, end: string): number {
  const startDec = parseTimeToDecimal(start);
  const endDec = parseTimeToDecimal(end);
  return endDec >= startDec ? (endDec - startDec) : (24 - startDec + endDec);
}

// Get Monday of the week for a given Date
export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Format Date object to YYYY-MM-DD
export function formatDateString(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Format YYYY-MM-DD to DD/MM
export function formatToDayMonth(dateStr: string): string {
  const [yyyy, mm, dd] = dateStr.split('-');
  return `${dd}/${mm}`;
}

// Format YYYY-MM-DD to DD/MM/YYYY
export function formatToFullDate(dateStr: string): string {
  const [yyyy, mm, dd] = dateStr.split('-');
  return `${dd}/${mm}/${yyyy}`;
}

export const DAY_NAMES_PT = ['Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado', 'Domingo'];
export const DAY_SHORT_NAMES_PT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

// Get array of dates (YYYY-MM-DD strings) for the active week
export function getActiveWeekDates(currentWeekStart: Date): string[] {
  const dates: string[] = [];
  const start = new Date(currentWeekStart);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(formatDateString(d));
  }
  return dates;
}

// De-duplicate shifts: keep only the last shift for each employee_id and date
export function getUniqueShifts(shifts: Shift[]): Shift[] {
  const map = new Map<string, Shift>();
  shifts.forEach(s => {
    const key = `${s.employee_id}_${s.date}`;
    map.set(key, s);
  });
  return Array.from(map.values());
}

// --- Overtime Calculation ---
// Returns the number of overtime hours (> 44h contract) for an employee in the active week.
export interface OvertimeInfo {
  employeeId: string;
  employeeName: string;
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
}

export function calculateOvertime(
  employees: Employee[],
  shifts: Shift[],
  currentWeekStart: Date
): OvertimeInfo[] {
  const uniqueShifts = getUniqueShifts(shifts);
  const weekDates = getActiveWeekDates(currentWeekStart);
  const results: OvertimeInfo[] = [];

  employees.filter(emp => emp.active).forEach(employee => {
    const empShiftsThisWeek = uniqueShifts.filter(
      s => s.employee_id === employee.id && s.store_id === employee.home_store_id && weekDates.includes(s.date)
    );

    let totalHours = 0;
    empShiftsThisWeek.forEach(shift => {
      const isFolga = isRestShift(shift);
      if (isFolga) return;
      totalHours += getShiftDuration(shift.start_time, shift.end_time, shift.break_duration_minutes);
    });

    const contractHours = employee.weekly_hours_contract;
    const overtimeHours = Math.max(0, totalHours - contractHours);
    const regularHours = Math.min(totalHours, contractHours);

    results.push({
      employeeId: employee.id,
      employeeName: employee.name,
      regularHours,
      overtimeHours,
      totalHours,
    });
  });

  return results;
}

// Run validation calculations — ONLY real CLT violations that require manual attention.
// The app auto-handles: overtime (calculated), Sunday rotation (scheduler), coverage (no alerts).
export function runAllValidations(
  stores: Store[],
  employees: Employee[],
  shifts: Shift[],
  currentWeekStart: Date
): ScheduleAlert[] {
  const uniqueShifts = getUniqueShifts(shifts);
  const alerts: ScheduleAlert[] = [];
  const weekDates = getActiveWeekDates(currentWeekStart);

  // --- EMPLOYEE-SPECIFIC CHECKS (only critical CLT violations) ---
  employees
    .filter((emp) => emp.active)
    .forEach((employee) => {
      const empShiftsThisWeek = uniqueShifts.filter(
        (s) => s.employee_id === employee.id && weekDates.includes(s.date),
      );

      const daysWorkedSet = new Set<string>();

      empShiftsThisWeek.forEach((shift) => {
        const isFolga = isRestShift(shift);
        if (isFolga) return;

        const hrs = getShiftDuration(
          shift.start_time,
          shift.end_time,
          shift.break_duration_minutes,
        );
        daysWorkedSet.add(shift.date);

        // A: Daily limits (Max 10h even with overtime — CLT hard limit)
        if (hrs > 10) {
          alerts.push({
            type: 'clt',
            message: `⚠️ <strong>${employee.name}</strong> excede 10h diárias em ${formatToDayMonth(shift.date)} (${hrs.toFixed(1)}h). Limite máximo CLT: 10h.`,
            employeeId: employee.id,
            date: shift.date,
          });
        }

        // B: Break compliance (mandatory by CLT — cannot be overridden by pay)
        const elapsed = getShiftElapsed(shift.start_time, shift.end_time);
        const isSunday = new Date(shift.date + 'T12:00:00').getDay() === 0;
        const minRequiredBreak = isSunday
          ? 15
          : elapsed > 6
            ? 60
            : elapsed >= 4
              ? 15
              : 0;

        if (shift.break_duration_minutes < minRequiredBreak) {
          alerts.push({
            type: 'clt',
            message: `⚠️ <strong>${employee.name}</strong> precisa de intervalo mínimo de ${minRequiredBreak}min em ${formatToDayMonth(shift.date)} (jornada de ${elapsed.toFixed(1)}h, intervalo atual: ${shift.break_duration_minutes}min).`,
            employeeId: employee.id,
            date: shift.date,
          });
        }
      });

      // C: Weekly Rest (DSR) — at least 1 day off per 7-day week (cannot be bought)
      if (daysWorkedSet.size === 7) {
        // Detect if this is a transition week (spans two months, e.g. the first
        // week of July includes the last days of June). In that case, clarify in
        // the alert so the user isn't confused by the partial week.
        const mondayMonth = new Date(currentWeekStart + 'T12:00:00').getMonth();
        const spansTwoMonths = weekDates.some((d) => {
          const m = new Date(d + 'T12:00:00').getMonth();
          return m !== mondayMonth;
        });

        const transitionNote = spansTwoMonths
          ? ' (Semana de transição: inclui dias do mês anterior.)'
          : '';

        alerts.push({
          type: 'clt',
          message: `⚠️ <strong>${employee.name}</strong> não tem Descanso Semanal Remunerado (DSR). É obrigatório pelo menos 1 dia de folga por semana.${transitionNote}`,
          employeeId: employee.id,
        });
      }

      // D: Inter-journey Rest (Min 11h consecutive rest — CLT hard requirement)
      const allEmpShifts = shifts
        .filter((s) => s.employee_id === employee.id)
        .filter((s) => !isRestShift(s))
        .sort(
          (a, b) =>
            new Date(a.date + 'T' + a.start_time).getTime() -
            new Date(b.date + 'T' + b.start_time).getTime(),
        );

      for (let i = 0; i < allEmpShifts.length - 1; i++) {
        const shift1 = allEmpShifts[i];
        const shift2 = allEmpShifts[i + 1];

        const s1End = new Date(shift1.date + 'T' + shift1.end_time);
        if (
          parseTimeToDecimal(shift1.end_time) <
          parseTimeToDecimal(shift1.start_time)
        ) {
          s1End.setDate(s1End.getDate() + 1);
        }

        const s2Start = new Date(shift2.date + 'T' + shift2.start_time);
        const restHours =
          (s2Start.getTime() - s1End.getTime()) / (1000 * 60 * 60);

        const isShiftInActiveWeek =
          weekDates.includes(shift1.date) || weekDates.includes(shift2.date);

        if (restHours < 11 && restHours >= 0 && isShiftInActiveWeek) {
          alerts.push({
            type: 'clt',
            message: `⚠️ <strong>${employee.name}</strong> tem descanso interjornada de apenas ${restHours.toFixed(1)}h entre ${formatToDayMonth(shift1.date)} e ${formatToDayMonth(shift2.date)} (mínimo CLT: 11h).`,
            employeeId: employee.id,
            date: shift2.date,
          });
        }
      }

      // E: If employee worked on Sunday, they must have Monday, Tuesday, or
      // Wednesday off in the FOLLOWING week (compensatory rest after a worked
      // Sunday). The scheduler assigns this rest in the week after the Sunday,
      // so we check the following week's Mon/Tue/Wed — not the same week.
      const sundayDateStr = weekDates[6];

      const sundayShift = empShiftsThisWeek.find(
        (s) => s.date === sundayDateStr,
      );
      const isSundayWorked = sundayShift && !isRestShift(sundayShift);

      if (isSundayWorked) {
        // Following week's Monday/Tuesday/Wednesday
        const nextMonday = new Date(currentWeekStart);
        nextMonday.setDate(nextMonday.getDate() + 7);
        const nextMondayStr = formatDateString(nextMonday);
        const nextTuesdayStr = formatDateString(
          new Date(nextMonday.getTime() + 86400000),
        );
        const nextWednesdayStr = formatDateString(
          new Date(nextMonday.getTime() + 2 * 86400000),
        );

        const mondayShift = uniqueShifts.find(
          (s) => s.employee_id === employee.id && s.date === nextMondayStr,
        );
        const tuesdayShift = uniqueShifts.find(
          (s) => s.employee_id === employee.id && s.date === nextTuesdayStr,
        );
        const wednesdayShift = uniqueShifts.find(
          (s) => s.employee_id === employee.id && s.date === nextWednesdayStr,
        );

        const isMondayOff = isRestShift(mondayShift);
        const isTuesdayOff = isRestShift(tuesdayShift);
        const isWednesdayOff = isRestShift(wednesdayShift);

        if (!isMondayOff && !isTuesdayOff && !isWednesdayOff) {
          alerts.push({
            type: 'clt',
            message: `⚠️ <strong>${employee.name}</strong> trabalhou no domingo (${formatToDayMonth(sundayDateStr)}) e precisa de folga na segunda, terça ou quarta-feira da semana seguinte.`,
            employeeId: employee.id,
            date: sundayDateStr,
          });
        }
      }
    });

  // NO coverage checks — employees can work without a supervisora

  // NO Sunday rotation alerts — the scheduler handles it automatically
  // NO weekly hours alerts — overtime is calculated and paid, not blocked

  return alerts;
}

// Get all weeks of a given month (Monday to Sunday)
// The first week may include the last days of the previous month.
// Each week is an array of 7 elements (YYYY-MM-DD strings).
// Days outside the target month still have their real date string so they can
// be shown in the grid (dimmed) — use isCurrentMonth() to distinguish them.
export function getMonthlyWeeks(year: number, month: number): (string | null)[][] {
  const weeks: (string | null)[][] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Monday (0) to Sunday (6) in our aligned week
  const startDayOfWeek = firstDay.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const startPadding = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const currentDay = new Date(firstDay);
  let currentWeek: (string | null)[] = [];

  // Fill initial days with the ACTUAL previous-month dates
  // so that e.g. June 29 and June 30 appear in the first week of July
  for (let i = startPadding; i >= 1; i--) {
    const prevDate = new Date(year, month, 1 - i);
    currentWeek.push(formatDateString(prevDate));
  }

  while (currentDay <= lastDay) {
    currentWeek.push(formatDateString(currentDay));

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    currentDay.setDate(currentDay.getDate() + 1);
  }

  // Fill remaining days of the last week with null
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

/** Returns true if the date string (YYYY-MM-DD) belongs to the given year/month */
export function isDateInMonth(dateStr: string, year: number, month: number): boolean {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  return dateStr.startsWith(prefix);
}

// Run validation calculations across the entire month
export function runMonthlyValidations(
  stores: Store[],
  employees: Employee[],
  shifts: Shift[],
  year: number,
  month: number
): ScheduleAlert[] {
  const weeks = getMonthlyWeeks(year, month);
  const alerts: ScheduleAlert[] = [];
  const processedWeeks = new Set<string>();

  weeks.forEach(week => {
    // Find the first non-null day of this week to use as a reference to run weekly validations
    const firstNonNullDateStr = week.find(d => d !== null);
    if (!firstNonNullDateStr) return;

    // Standardize to the Monday of that week
    const monday = getMonday(new Date(firstNonNullDateStr + 'T12:00:00'));
    const mondayStr = formatDateString(monday);

    if (processedWeeks.has(mondayStr)) return;
    processedWeeks.add(mondayStr);

    const weekAlerts = runAllValidations(stores, employees, shifts, monday);
    alerts.push(...weekAlerts);
  });

  // F: Check consecutive Sundays off for each active employee
  const uniqueShifts = getUniqueShifts(shifts);
  const sundays: string[] = [];
  weeks.forEach(week => {
    const sunday = week[6];
    if (sunday) sundays.push(sunday);
  });

  employees.filter(emp => emp.active).forEach(employee => {
    for (let i = 0; i < sundays.length - 1; i++) {
      const sun1 = sundays[i];
      const sun2 = sundays[i + 1];

      const shift1 = uniqueShifts.find(s => s.employee_id === employee.id && s.date === sun1);
      const shift2 = uniqueShifts.find(s => s.employee_id === employee.id && s.date === sun2);

      // Skip Sunday compliance alerts if employee is on holiday (Férias) on either Sunday
      const isSun1Ferias = shift1?.start_time === 'FERIAS';
      const isSun2Ferias = shift2?.start_time === 'FERIAS';
      if (isSun1Ferias || isSun2Ferias) continue;

      const isSun1Off = isRestShift(shift1);
      const isSun2Off = isRestShift(shift2);

      if (isSun1Off && isSun2Off) {
        alerts.push({
          type: 'sunday',
          message: `⚠️ <strong>${employee.name}</strong> folgou em domingos consecutivos (${formatToDayMonth(sun1)} e ${formatToDayMonth(sun2)}). É obrigatório trabalhar no domingo seguinte após uma folga de domingo.`,
          employeeId: employee.id,
          date: sun2
        });
      }

      const isSun1Worked = shift1 && !isRestShift(shift1);
      const isSun2Worked = shift2 && !isRestShift(shift2);

      if (isSun1Worked && isSun2Worked) {
        alerts.push({
          type: 'sunday',
          message: `⚠️ <strong>${employee.name}</strong> trabalhou em domingos consecutivos (${formatToDayMonth(sun1)} e ${formatToDayMonth(sun2)}). É obrigatório folgar no domingo seguinte após trabalhar um domingo.`,
          employeeId: employee.id,
          date: sun2
        });
      }
    }
  });

  // De-duplicate alerts
  const seenMessages = new Set<string>();
  return alerts.filter(alert => {
    const key = `${alert.type}_${alert.employeeId}_${alert.date}_${alert.message}`;
    if (seenMessages.has(key)) return false;
    seenMessages.add(key);
    return true;
  });
}
