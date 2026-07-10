import { Employee, Shift } from './types';
import { getActiveWeekDates, formatDateString } from './validation';
import { defaultStores } from './mockData';

/**
 * AI Local Solver — Escala Varejo
 *
 * Business Rules (as defined by store management):
 *
 * SHIFTS (all days):
 *   - Morning       (Manhã):        10:00–16:00
 *   - Intermediate  (Intermediário): 14:00–20:00
 *   - Evening       (Noite):        16:00–22:00
 *   All shifts are 6h. CLT break: 15 min (shift ≤ 6h but ≥ 4h).
 *
 * SUNDAY RULE:
 *   - Each employee rests exactly ONE Sunday per month.
 *   - Their "off Sunday" is determined by their position index mod the number
 *     of Sundays in that month — distributing rest Sundays evenly across the team.
 *
 * WEEKDAY REST DAY:
 *   - Strictly Monday (empIndex even) or Tuesday (empIndex odd).
 *   - No Wednesday or other days.
 *
 * SHIFT TIME CONTINUITY:
 *   - If the employee has existing shifts in the previous 2 months, their shift
 *     time (morning/intermediate/evening) is preserved from the most recent data.
 *   - Falls back to: default_shift field → position rotation.
 */

const SHIFTS = [
  { start: '10:00', end: '16:00' }, // pattern 0 – Morning
  { start: '14:00', end: '20:00' }, // pattern 1 – Intermediate
  { start: '16:00', end: '22:00' }, // pattern 2 – Evening
];

const SUNDAY_SHIFTS = [
  { start: '10:00', end: '18:00' }, // Morning on Sunday (adjusted for 8h window)
  { start: '12:00', end: '20:00' }, // Mid on Sunday (standard)
  { start: '14:00', end: '20:00' }, // Afternoon on Sunday
];

/** Count how many Sundays exist in a given month */
function countSundaysInMonth(year: number, month: number): number {
  const last = new Date(year, month + 1, 0).getDate();
  let count = 0;
  for (let d = 1; d <= last; d++) {
    if (new Date(year, month, d).getDay() === 0) count++;
  }
  return count;
}

/**
 * Return the 0-based index of this Sunday within its month
 * (0 = first Sunday of the month, 1 = second, etc.)
 */
function sundayIndexInMonth(sundayDate: Date): number {
  const year = sundayDate.getFullYear();
  const month = sundayDate.getMonth();
  const dayOfMonth = sundayDate.getDate();
  let idx = 0;
  for (let d = 1; d < dayOfMonth; d++) {
    if (new Date(year, month, d).getDay() === 0) idx++;
  }
  return idx;
}

/**
 * Detect which shift pattern an employee is using based on their most recent shifts.
 * Returns 0 (morning), 1 (intermediate), or 2 (evening).
 */
function detectShiftPattern(employeeId: string, existingShifts: Shift[]): number | null {
  // Look at non-folga shifts for this employee, most recent first
  const empShifts = existingShifts
    .filter(s => {
      if (s.employee_id !== employeeId) return false;
      const isFolga = (s.start_time === '00:00' && s.end_time === '00:00') || !s.start_time;
      const isSunday = new Date(s.date + 'T12:00:00').getDay() === 0;
      return !isFolga && !isSunday;
    })
    .sort((a, b) => b.date.localeCompare(a.date)); // most recent first

  if (empShifts.length === 0) return null;

  const { start_time } = empShifts[0];
  if (start_time === '10:00') return 0;
  if (start_time === '14:00') return 1;
  if (start_time === '16:00') return 2;
  return null;
}

export function generateAISchedule(
  storeId: string,
  employees: Employee[],
  currentWeekStart: Date,
  existingShifts: Shift[] = []
): Omit<Shift, 'id'>[] {
  const weekDates = getActiveWeekDates(currentWeekStart);

  const storeEmployees = employees.filter(
    emp => emp.active && emp.home_store_id === storeId
  );

  if (storeEmployees.length === 0) return [];

  const store = defaultStores.find(s => s.id === storeId);
  const sundayOpen  = store?.operating_hours.sunday.open  || '12:00';
  const sundayClose = store?.operating_hours.sunday.close || '20:00';

  // ── Sunday context for this week ──────────────────────────────────────────
  const sundayDateStr = weekDates[6]; // index 6 = Sunday
  const sundayDate    = new Date(sundayDateStr + 'T12:00:00');

  const thisSundayIdx = sundayIndexInMonth(sundayDate);

  // ── Pass 1: Determine Sunday assignment and whether a weekday rest is needed ──
  // restDayMap: null = no weekday rest (employee rests on Sunday)
  //             0   = Monday off
  //             1   = Tuesday off
  const restDayMap    = new Map<string, number | null>();
  const shiftPattern  = new Map<string, number>();
  const worksSunday   = new Map<string, boolean>();

  // Employees who need a weekday rest (those who worked the previous Sunday)
  // We collect them first so we can split them evenly between Mon and Tue.
  const needsWeekdayRest: string[] = [];

  storeEmployees.forEach((emp, empIndex) => {
    // ── Shift pattern ────────────────────────────────────────────────────────
    let pattern: number;
    const detectedPattern = detectShiftPattern(emp.id, existingShifts);
    if (detectedPattern !== null)                  { pattern = detectedPattern; }
    else if (emp.default_shift === 'morning')       { pattern = 0; }
    else if (emp.default_shift === 'intermediate')  { pattern = 1; }
    else if (emp.default_shift === 'evening')       { pattern = 2; }
    else                                            { pattern = empIndex % 3; }
    shiftPattern.set(emp.id, pattern);

    // ── Sunday assignment ─────────────────────────────────────────────────────
    const prevSunday    = new Date(currentWeekStart);
    prevSunday.setDate(prevSunday.getDate() - 1);
    const prevSundayStr = formatDateString(prevSunday);
    const prevSundayShift = existingShifts.find(
      s => s.employee_id === emp.id && s.date === prevSundayStr
    );

    let worksThisSunday: boolean;
    if (prevSundayShift) {
      const hadOffLastSunday =
        (prevSundayShift.start_time === '00:00' && prevSundayShift.end_time === '00:00') ||
        !prevSundayShift.start_time;
      worksThisSunday = hadOffLastSunday; // rested last → works this; worked last → rests this
    } else {
      // No history: spread evenly (half work, half rest per Sunday)
      worksThisSunday = (thisSundayIdx + empIndex) % 2 === 0;
    }
    worksSunday.set(emp.id, worksThisSunday);

    // ── Weekday rest eligibility ──────────────────────────────────────────────
    // CLT: if the employee WORKED the previous Sunday, they are owed Mon or Tue off.
    // If Sunday was already their rest day this week, no weekday rest is needed.
    const prevSundayWorked = prevSundayShift
      ? !(
          (prevSundayShift.start_time === '00:00' && prevSundayShift.end_time === '00:00') ||
          !prevSundayShift.start_time
        )
      : !worksThisSunday; // no history: if resting this Sunday, assume also worked last Sunday

    if (prevSundayWorked) {
      needsWeekdayRest.push(emp.id);
      restDayMap.set(emp.id, null); // placeholder — assigned below
    } else {
      restDayMap.set(emp.id, null); // no weekday rest (resting on Sunday covers weekly rest)
    }
  });

  // ── Pass 2: Distribute weekday rest evenly between Mon and Tue ───────────────
  // To guarantee the store always has coverage, we alternate strictly:
  // first half of needsWeekdayRest → Monday (0), second half → Tuesday (1).
  // This prevents all employees from sharing the same rest day.
  const half = Math.ceil(needsWeekdayRest.length / 2);
  needsWeekdayRest.forEach((empId, i) => {
    restDayMap.set(empId, i < half ? 0 : 1); // 0 = Mon, 1 = Tue
  });

  // ── Build shifts ──────────────────────────────────────────────────────────
  const generatedShifts: Omit<Shift, 'id'>[] = [];

  storeEmployees.forEach((emp) => {
    const restDay        = restDayMap.get(emp.id) ?? null; // null = no weekday rest
    const pattern        = shiftPattern.get(emp.id) ?? 0;
    const empWorksSunday = worksSunday.get(emp.id) ?? true;

    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      const currentDateStr = weekDates[dayIdx];
      const isSunday       = dayIdx === 6;

      // Skip if employee has a pre-existing Férias shift on this day
      const hasFerias = existingShifts.some(
        s => s.employee_id === emp.id && s.date === currentDateStr && s.start_time === 'FERIAS'
      );
      if (hasFerias) continue;

      // Weekday rest day (Mon or Tue) — only if this employee needs one
      if (!isSunday && restDay !== null && dayIdx === restDay) {
        generatedShifts.push({
          employee_id:            emp.id,
          store_id:               storeId,
          date:                   currentDateStr,
          start_time:             '00:00',
          end_time:               '00:00',
          break_duration_minutes: 0,
          allow_overtime:         false,
        });
        continue;
      }

      // Sunday
      if (isSunday) {
        if (!empWorksSunday) {
          generatedShifts.push({
            employee_id:            emp.id,
            store_id:               storeId,
            date:                   currentDateStr,
            start_time:             '00:00',
            end_time:               '00:00',
            break_duration_minutes: 0,
            allow_overtime:         false,
          });
        } else {
          generatedShifts.push({
            employee_id:            emp.id,
            store_id:               storeId,
            date:                   currentDateStr,
            start_time:             sundayOpen,
            end_time:               sundayClose,
            break_duration_minutes: 60,
            allow_overtime:         false,
          });
        }
        continue;
      }

      // Regular weekday / Saturday
      const shift = SHIFTS[pattern];
      generatedShifts.push({
        employee_id:            emp.id,
        store_id:               storeId,
        date:                   currentDateStr,
        start_time:             shift.start,
        end_time:               shift.end,
        break_duration_minutes: 15,
        allow_overtime:         false,
      });
    }
  });

  return generatedShifts;
}
