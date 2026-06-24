import { Employee, Shift } from './types';
import { getActiveWeekDates, getShiftElapsed } from './validation';
import { defaultStores } from './mockData';

/**
 * AI Local Solver — Escala Varejo
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
 *   - Perfect rotation alternates Group A and Group B using a continuous week index.
 *
 * DAY-OFF AFTER SUNDAY WORK (Monday or Tuesday only):
 *   - Alternates between Monday (0) and Tuesday (1) for Sunday workers to balance coverage.
 *
 * DAY-OFF FOR SUNDAY-OFF GROUP:
 *   - Thursday or Friday (alternating), freeing Mon–Tue for Sunday workers.
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

  // Continuous week number from a fixed epoch Monday (Jan 5, 2026) to avoid monthly boundary resets
  const epoch = new Date('2026-01-05T00:00:00Z').getTime();
  const diffMs = currentWeekStart.getTime() - epoch;
  const continuousWeekIdx = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));

  const n = storeEmployees.length;

  // Split employees into two groups of equal (or near-equal) size
  const groupASize = Math.ceil(n / 2);
  // Group A = indices 0..(groupASize-1), Group B = the rest

  // Determine which group works Sunday this week
  const groupAWorksSunday = continuousWeekIdx % 2 === 0;

  // Assign each employee:
  // - whether they work Sunday
  // - their shift pattern (0=Morning, 1=Intermediate, 2=Evening)
  // - their rest day
  const restDayAssignments = new Map<string, number>();   // emp.id → dayIdx (0=Mon..6=Sun)
  const shiftPatterns = new Map<string, number>();        // emp.id → 0|1|2
  const worksSunday = new Map<string, boolean>();         // emp.id → boolean

  // Counters for alternating off-days
  let sundayWorkerCount = 0;
  let sundayOffCounter = 0;

  storeEmployees.forEach((emp, empIndex) => {
    const inGroupA = empIndex < groupASize;
    const worksThisSunday = groupAWorksSunday ? inGroupA : !inGroupA;
    worksSunday.set(emp.id, worksThisSunday);

    // Shift pattern: prioritize employee default shift preference, otherwise rotate
    let pattern = empIndex % 3;
    if (emp.default_shift === 'morning') pattern = 0;
    else if (emp.default_shift === 'intermediate') pattern = 1;
    else if (emp.default_shift === 'evening') pattern = 2;
    shiftPatterns.set(emp.id, pattern);

    if (worksThisSunday) {
      // Day-off is strictly Monday (0) or Tuesday (1), alternating
      const dayOff = sundayWorkerCount % 2 === 0 ? 0 : 1;
      restDayAssignments.set(emp.id, dayOff);
      sundayWorkerCount++;
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

        // Assign a Sunday shift from the distributed Sunday windows
        const sundayShift = sundayShiftPatterns[sundayWorkerIdx % sundayShiftPatterns.length];
        sundayWorkerIdx++;

        generatedShifts.push({
          employee_id: emp.id,
          store_id: storeId,
          date: currentDateStr,
          start_time: sundayShift.start,
          end_time: sundayShift.end,
          break_duration_minutes: 15, // 15 min break on Sunday as requested
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
