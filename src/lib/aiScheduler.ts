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
  const sundayYear    = sundayDate.getFullYear();
  const sundayMonth   = sundayDate.getMonth();

  const thisSundayIdx     = sundayIndexInMonth(sundayDate);

  // ── Assignments ───────────────────────────────────────────────────────────
  const restDayMap    = new Map<string, number>();  // emp.id → dayIdx 0=Mon,1=Tue
  const shiftPattern  = new Map<string, number>();  // emp.id → 0|1|2
  const worksSunday   = new Map<string, boolean>(); // emp.id → true if works this Sunday

  storeEmployees.forEach((emp, empIndex) => {
    // ── Weekday rest: strictly Mon or Tue ─────────────────────────────────
    restDayMap.set(emp.id, empIndex % 2); // even → Mon(0), odd → Tue(1)

    // ── Shift pattern: read from history first, then preference, then rotate ─
    let pattern: number;
    const detectedPattern = detectShiftPattern(emp.id, existingShifts);
    if (detectedPattern !== null) {
      pattern = detectedPattern;
    } else if (emp.default_shift === 'morning')       { pattern = 0; }
    else if (emp.default_shift === 'intermediate')     { pattern = 1; }
    else if (emp.default_shift === 'evening')          { pattern = 2; }
    else { pattern = empIndex % 3; }
    shiftPattern.set(emp.id, pattern);

    // ── Sunday: employees can have 1 or 2 Sundays off per month ───────────
    // If employee had Sunday off in the previous week, they must work this Sunday
    const prevSunday = new Date(currentWeekStart);
    prevSunday.setDate(prevSunday.getDate() - 1);
    const prevSundayStr = formatDateString(prevSunday);
    const prevSundayShift = existingShifts.find(
      s => s.employee_id === emp.id && s.date === prevSundayStr
    );
    const hadSundayOffPrevWeek = prevSundayShift
      ? (prevSundayShift.start_time === '00:00' && prevSundayShift.end_time === '00:00') || !prevSundayShift.start_time
      : false;

    let worksThisSunday = true;
    if (hadSundayOffPrevWeek) {
      worksThisSunday = true;
    } else {
      // Off Sunday index rotation pattern (thisSundayIdx + empIndex) % 3 === 0
      worksThisSunday = (thisSundayIdx + empIndex) % 3 !== 0;
    }
    worksSunday.set(emp.id, worksThisSunday);
  });

  // ── Build shifts ──────────────────────────────────────────────────────────
  const generatedShifts: Omit<Shift, 'id'>[] = [];

  storeEmployees.forEach((emp) => {
    const restDay        = restDayMap.get(emp.id) ?? 0;
    const pattern        = shiftPattern.get(emp.id) ?? 0;
    const empWorksSunday = worksSunday.get(emp.id) ?? true;

    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      const currentDateStr = weekDates[dayIdx];
      const isSunday       = dayIdx === 6;

      // Weekday rest day → Folga
      if (!isSunday && dayIdx === restDay) {
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
          // This employee's one Sunday off this month
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
          // Works Sunday — use the store's Sunday window
          generatedShifts.push({
            employee_id:            emp.id,
            store_id:               storeId,
            date:                   currentDateStr,
            start_time:             sundayOpen,
            end_time:               sundayClose,
            break_duration_minutes: 60, // Sunday requires 60min break (CLT)
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
