import { Store, Employee, Shift, ScheduleAlert } from './types';

// Parse "HH:MM" to decimal hours (e.g. "10:30" -> 10.5)
export function parseTimeToDecimal(timeStr: string): number {
  if (!timeStr) return 0;
  const [hrs, mins] = timeStr.split(':').map(Number);
  return hrs + (mins / 60);
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
  const weekDates = getActiveWeekDates(currentWeekStart);
  const results: OvertimeInfo[] = [];

  employees.filter(emp => emp.active).forEach(employee => {
    const empShiftsThisWeek = shifts.filter(
      s => s.employee_id === employee.id && s.store_id === employee.home_store_id && weekDates.includes(s.date)
    );

    let totalHours = 0;
    empShiftsThisWeek.forEach(shift => {
      const isFolga = (shift.start_time === '00:00' && shift.end_time === '00:00') || !shift.start_time;
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
  const alerts: ScheduleAlert[] = [];
  const weekDates = getActiveWeekDates(currentWeekStart);

  // --- EMPLOYEE-SPECIFIC CHECKS (only critical CLT violations) ---
  employees.filter(emp => emp.active).forEach(employee => {
    const empShiftsThisWeek = shifts.filter(
      s => s.employee_id === employee.id && weekDates.includes(s.date)
    );

    const daysWorkedSet = new Set<string>();

    empShiftsThisWeek.forEach(shift => {
      const isFolga = (shift.start_time === '00:00' && shift.end_time === '00:00') || !shift.start_time;
      if (isFolga) return;

      const hrs = getShiftDuration(shift.start_time, shift.end_time, shift.break_duration_minutes);
      daysWorkedSet.add(shift.date);

      // A: Daily limits (Max 10h even with overtime — CLT hard limit)
      if (hrs > 10) {
        alerts.push({
          type: 'clt',
          message: `⚠️ <strong>${employee.name}</strong> excede 10h diárias em ${formatToDayMonth(shift.date)} (${hrs.toFixed(1)}h). Limite máximo CLT: 10h.`,
          employeeId: employee.id,
          date: shift.date
        });
      }

      // B: Break compliance (mandatory by CLT — cannot be overridden by pay)
      const elapsed = getShiftElapsed(shift.start_time, shift.end_time);
      if (elapsed > 6 && shift.break_duration_minutes < 60) {
        alerts.push({
          type: 'clt',
          message: `⚠️ <strong>${employee.name}</strong> precisa de intervalo mínimo de 60min em ${formatToDayMonth(shift.date)} (jornada > 6h, intervalo atual: ${shift.break_duration_minutes}min).`,
          employeeId: employee.id,
          date: shift.date
        });
      } else if (elapsed >= 4 && elapsed <= 6 && shift.break_duration_minutes < 15) {
        alerts.push({
          type: 'clt',
          message: `⚠️ <strong>${employee.name}</strong> precisa de intervalo mínimo de 15min em ${formatToDayMonth(shift.date)} (jornada de 4-6h, intervalo atual: ${shift.break_duration_minutes}min).`,
          employeeId: employee.id,
          date: shift.date
        });
      }
    });

    // C: Weekly Rest (DSR) — at least 1 day off per 7-day week (cannot be bought)
    if (daysWorkedSet.size === 7) {
      alerts.push({
        type: 'clt',
        message: `⚠️ <strong>${employee.name}</strong> não tem Descanso Semanal Remunerado (DSR). É obrigatório pelo menos 1 dia de folga por semana.`,
        employeeId: employee.id
      });
    }

    // D: Inter-journey Rest (Min 11h consecutive rest — CLT hard requirement)
    const allEmpShifts = shifts
      .filter(s => s.employee_id === employee.id)
      .filter(s => !((s.start_time === '00:00' && s.end_time === '00:00') || !s.start_time))
      .sort((a, b) => new Date(a.date + 'T' + a.start_time).getTime() - new Date(b.date + 'T' + b.start_time).getTime());
      
    for (let i = 0; i < allEmpShifts.length - 1; i++) {
      const shift1 = allEmpShifts[i];
      const shift2 = allEmpShifts[i + 1];
      
      const s1End = new Date(shift1.date + 'T' + shift1.end_time);
      if (parseTimeToDecimal(shift1.end_time) < parseTimeToDecimal(shift1.start_time)) {
        s1End.setDate(s1End.getDate() + 1);
      }
      
      const s2Start = new Date(shift2.date + 'T' + shift2.start_time);
      const restHours = (s2Start.getTime() - s1End.getTime()) / (1000 * 60 * 60);
      
      const isShiftInActiveWeek = weekDates.includes(shift1.date) || weekDates.includes(shift2.date);
      
      if (restHours < 11 && restHours >= 0 && isShiftInActiveWeek) {
        alerts.push({
          type: 'clt',
          message: `⚠️ <strong>${employee.name}</strong> tem descanso interjornada de apenas ${restHours.toFixed(1)}h entre ${formatToDayMonth(shift1.date)} e ${formatToDayMonth(shift2.date)} (mínimo CLT: 11h).`,
          employeeId: employee.id,
          date: shift2.date
        });
      }
    }
  });

  // NO coverage checks — employees can work without a supervisora
  // NO Sunday rotation alerts — the scheduler handles it automatically
  // NO weekly hours alerts — overtime is calculated and paid, not blocked

  return alerts;
}
