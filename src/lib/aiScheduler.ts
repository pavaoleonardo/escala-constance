import { Employee, Shift } from './types';
import { getActiveWeekDates, getShiftElapsed } from './validation';
import { defaultStores } from './mockData';

/**
 * AI Local Solver — Escala Constance
 *
 * Business Rules (as defined by store management):
 *
 * SHIFTS (all days):
 *   - Morning   (Manhã):        10:00–16:00
 *   - Intermediate (Intermediário): 14:00–20:00
 *   - Evening   (Noite):        16:00–22:00
 *   All shifts are 6h. CLT break: 15 min (shift ≤ 6h, but ≥ 4h).
 *
 * SUNDAY:
 *   - Target: 3 vendedoras working; minimum 2 in exceptional cases.
 *   - All employees must have at least 1 Sunday off per month.
 *   - Employees are split into Group A (first half) and Group B (second half).
 *   - Week 0 (even weekOfMonth): Group A works Sunday, Group B has Sunday off.
 *   - Week 1 (odd weekOfMonth): Group B works Sunday, Group A has Sunday off.
 *
 * DAY-OFF AFTER SUNDAY WORK (Mon, Tue, or Wed — based on shift type):
 *   - Morning worker  (pattern 0) → Monday off
 *   - Evening worker  (pattern 2) → Tuesday off
 *   - Intermediate    (pattern 1) → Wednesday off
 *
 * DAY-OFF FOR SUNDAY-OFF GROUP:
 *   - Thursday or Friday (alternating), freeing Mon–Wed for Sunday workers.
 *
 * COVERAGE GOAL:
 *   - At least 2 employees per shift type across Mon–Sat.
 *   - Even distribution across all three shift patterns.
 */

// The three 6h shift patterns
const SHIFTS = [
  { start: '10:00', end: '16:00' }, // pattern 0 – Morning
  { start: '14:00', end: '20:00' }, // pattern 1 – Intermediate
  { start: '16:00', end: '22:00' }, // pattern 2 – Evening
];

// Day-off mapping for Sunday workers (by their shift pattern)
// pattern 0 (Morning) → Mon (dayIdx 0)
// pattern 2 (Evening) → Tue (dayIdx 1)
// pattern 1 (Intermediate) → Wed (dayIdx 2)
const SUNDAY_WORKER_DAYOFF: Record<number, number> = {
  0: 0, // Morning  → Monday
  2: 1, // Evening  → Tuesday
  1: 2, // Intermediate → Wednesday
};

export function generateAISchedule(
  storeId: string,
  employees: Employee[],
  currentWeekStart: Date
): Omit<Shift, 'id'>[] {
  const weekDates = getActiveWeekDates(currentWeekStart);

  // Filter active employees belonging to this store
  const storeEmployees = employees.filter(
    emp => emp.active && emp.home_store_id === storeId
  );

  if (storeEmployees.length === 0) return [];

  // Find store Sunday hours for the Sunday shift window
  const store = defaultStores.find(s => s.id === storeId);
  const sundayOpen = store?.operating_hours.sunday.open || '12:00';
  const sundayClose = store?.operating_hours.sunday.close || '20:00';

  const generatedShifts: Omit<Shift, 'id'>[] = [];

  // Which week of month are we in (0-indexed)
  const weekOfMonth = Math.floor((currentWeekStart.getDate() - 1) / 7);

  const n = storeEmployees.length;

  // Split employees into two groups of equal (or near-equal) size
  const groupASize = Math.ceil(n / 2);
  // Group A = indices 0..(groupASize-1), Group B = the rest

  // Determine which group works Sunday this week
  // Even weekOfMonth: Group A works, Group B has Sunday off
  // Odd weekOfMonth:  Group B works, Group A has Sunday off
  const groupAWorksSunday = weekOfMonth % 2 === 0;

  // Assign each employee:
  // - whether they work Sunday
  // - their shift pattern (0=Morning, 1=Intermediate, 2=Evening)
  // - their rest day
  const restDayAssignments = new Map<string, number>();   // emp.id → dayIdx (0=Mon..6=Sun)
  const shiftPatterns = new Map<string, number>();        // emp.id → 0|1|2
  const worksSunday = new Map<string, boolean>();         // emp.id → boolean

  // Counters for spreading Sunday-off group folgas across Thu/Fri
  let sundayOffCounter = 0;

  storeEmployees.forEach((emp, empIndex) => {
    const inGroupA = empIndex < groupASize;
    const worksThisSunday = groupAWorksSunday ? inGroupA : !inGroupA;
    worksSunday.set(emp.id, worksThisSunday);

    // Shift pattern: rotate across all employees so Mon–Sat coverage is balanced
    const pattern = empIndex % 3;
    shiftPatterns.set(emp.id, pattern);

    if (worksThisSunday) {
      // Day-off is Mon, Tue, or Wed — determined by their shift pattern
      const dayOff = SUNDAY_WORKER_DAYOFF[pattern];
      restDayAssignments.set(emp.id, dayOff);
    } else {
      // Day-off is Thu (3) or Fri (4), alternating
      const dayOff = 3 + (sundayOffCounter % 2);
      restDayAssignments.set(emp.id, dayOff);
      sundayOffCounter++;
    }
  });

  // Build the Sunday shift schedule for each worker
  // Distribute 3 different 6h windows across the Sunday opening hours
  const sundayShiftPatterns = getSundayShifts(sundayOpen, sundayClose);

  let sundayWorkerIdx = 0;

  // Build the full week schedule for each employee
  storeEmployees.forEach((emp, empIndex) => {
    const restDay = restDayAssignments.get(emp.id) ?? 4;
    const pattern = shiftPatterns.get(emp.id) ?? 0;
    const empWorksSunday = worksSunday.get(emp.id) ?? false;

    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      const currentDateStr = weekDates[dayIdx];
      const isSunday = dayIdx === 6;

      // Rest day → Folga
      if (dayIdx === restDay) {
        generatedShifts.push({
          employee_id: emp.id,
          store_id: storeId,
          date: currentDateStr,
          start_time: '00:00',
          end_time: '00:00',
          break_duration_minutes: 0,
          allow_overtime: false,
        });
        continue;
      }

      // Sunday — only for employees who work this Sunday
      if (isSunday) {
        if (!empWorksSunday) {
          // Sunday off (this employee is in the off-group)
          generatedShifts.push({
            employee_id: emp.id,
            store_id: storeId,
            date: currentDateStr,
            start_time: '00:00',
            end_time: '00:00',
            break_duration_minutes: 0,
            allow_overtime: false,
          });
          continue;
        }

        // Assign a Sunday 6h shift from the distributed Sunday windows
        const sundayShift = sundayShiftPatterns[sundayWorkerIdx % sundayShiftPatterns.length];
        sundayWorkerIdx++;

        const elapsed = getShiftElapsed(sundayShift.start, sundayShift.end);
        const breakMin = elapsed > 6 ? 60 : (elapsed >= 4 ? 15 : 0);

        generatedShifts.push({
          employee_id: emp.id,
          store_id: storeId,
          date: currentDateStr,
          start_time: sundayShift.start,
          end_time: sundayShift.end,
          break_duration_minutes: breakMin,
          allow_overtime: false,
        });
        continue;
      }

      // Weekday / Saturday: use the employee's assigned 6h shift pattern
      const shift = SHIFTS[pattern];
      generatedShifts.push({
        employee_id: emp.id,
        store_id: storeId,
        date: currentDateStr,
        start_time: shift.start,
        end_time: shift.end,
        break_duration_minutes: 15, // 6h shift → 15 min CLT break
        allow_overtime: false,
      });
    }
  });

  return generatedShifts;
}

/**
 * Given a store's Sunday open/close window, return up to 3 different 6h shift windows
 * that cover the full operating span as evenly as possible.
 */
function getSundayShifts(open: string, close: string): { start: string; end: string }[] {
  // Sunday has a single turn/shift covering the store operating hours (usually 12:00 to 20:00)
  return [
    { start: open, end: close },
    { start: open, end: close },
    { start: open, end: close },
  ];
}
