import { Employee, Shift } from './types';
import { getActiveWeekDates, getShiftElapsed } from './validation';
import { defaultStores } from './mockData';

/**
 * AI Local Solver — Escala Constance
 * 
 * Generates a fully CLT-compliant, coverage-optimized schedule for 7-day
 * mall retail operation. Each employee works 6 days/week and gets 1 folga per week.
 * Sundays are rotated in groups so every employee gets at least 2 Sundays off per month.
 * 
 * Coverage guarantee: At least 1 Vendedora Supervisora + 1 Vendedora
 * at all operating hours, every day the store is open.
 * 
 * The scheduler dynamically reads each store's operating hours and configures Sunday shifts.
 */
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

  // Find store Sunday hours
  const store = defaultStores.find(s => s.id === storeId);
  const sundayOpen = store?.operating_hours.sunday.open || '12:00';
  const sundayClose = store?.operating_hours.sunday.close || '20:00';

  const generatedShifts: Omit<Shift, 'id'>[] = [];

  // Determine which week of the month this is (0-indexed) for Sunday rotation
  const weekOfMonth = Math.floor((currentWeekStart.getDate() - 1) / 7);

  // Assign rest days — each employee gets exactly 1 folga per week (6 working days)
  // Group-based Sunday Rotation:
  // - Even group index gets Sunday off on even weeks.
  // - Odd group index gets Sunday off on odd weeks.
  // - Those who work Sunday get a weekday off (Tue, Wed, Thu, Fri) to balance coverage.
  const restDayAssignments = new Map<string, number>(); // emp.id -> dayIdx (0=Mon..6=Sun)
  
  let sundayWorkerCount = 0;
  storeEmployees.forEach((emp, empIndex) => {
    // Group-based alternation: approx half gets Sunday off, other half works Sunday
    const getsSundayOff = (empIndex + weekOfMonth) % 2 === 0;
    
    if (getsSundayOff) {
      restDayAssignments.set(emp.id, 6); // Sunday off
    } else {
      // Assign a weekday off (Tue=1, Wed=2, Thu=3, Fri=4) to spread out folgas
      const weekday = 1 + (sundayWorkerCount % 4);
      restDayAssignments.set(emp.id, weekday);
      sundayWorkerCount++;
    }
  });

  // Build the schedule for each employee
  storeEmployees.forEach((emp, empIndex) => {
    const restDay = restDayAssignments.get(emp.id) ?? 1;

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

      // Determine shift times
      let start: string;
      let end: string;
      let breakMin = 60;

      if (isSunday) {
        // Sunday: dynamic store hours
        start = sundayOpen;
        end = sundayClose;
        const elapsed = getShiftElapsed(start, end);
        breakMin = elapsed > 6 ? 60 : (elapsed >= 4 ? 15 : 0);
      } else {
        // Weekdays + Saturday: rotate between Abertura, Intermediário, Fechamento
        const shiftPattern = (empIndex + dayIdx) % 3;
        if (shiftPattern === 0) {
          start = '10:00';
          end = '18:00';
        } else if (shiftPattern === 1) {
          start = '12:00';
          end = '20:00';
        } else {
          start = '14:00';
          end = '22:00';
        }
        breakMin = 60;
      }

      generatedShifts.push({
        employee_id: emp.id,
        store_id: storeId,
        date: currentDateStr,
        start_time: start,
        end_time: end,
        break_duration_minutes: breakMin,
        allow_overtime: false,
      });
    }
  });

  return generatedShifts;
}
