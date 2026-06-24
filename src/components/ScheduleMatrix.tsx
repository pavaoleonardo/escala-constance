import React from 'react';
import { Store, Employee, Shift, ScheduleAlert } from '../lib/types';
import { getShiftDuration, formatToDayMonth, getUniqueShifts } from '../lib/validation';

interface ScheduleMatrixProps {
  stores: Store[];
  employees: Employee[];
  shifts: Shift[];
  monthlyWeeks: (string | null)[][];
  activeStoreFilter: string;
  activeAlerts: ScheduleAlert[];
  onCellClick: (employeeId: string, date: string, shift?: Shift) => void;
  showWarnings: boolean;
}

export const ScheduleMatrix: React.FC<ScheduleMatrixProps> = ({
  stores,
  employees,
  shifts,
  monthlyWeeks,
  activeStoreFilter,
  activeAlerts,
  onCellClick,
  showWarnings,
}) => {
  // Filter active employees
  let filteredEmployees = employees.filter(emp => emp.active);

  const uniqueShifts = getUniqueShifts(shifts);
  const allMonthDates = monthlyWeeks.flat().filter((d): d is string => d !== null);

  if (activeStoreFilter !== 'all') {
    filteredEmployees = filteredEmployees.filter(emp => {
      const isHomeStore = emp.home_store_id === activeStoreFilter;
      const hasFloatShiftHere = uniqueShifts.some(
        s =>
          s.employee_id === emp.id &&
          s.store_id === activeStoreFilter &&
          allMonthDates.includes(s.date) &&
          !((s.start_time === '00:00' && s.end_time === '00:00') || !s.start_time)
      );
      return isHomeStore || hasFloatShiftHere;
    });
  }

  const DAY_SHORT_NAMES_SEG_DOM = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  return (
    <div className="matrix-container card">
      <div className="matrix-scroll-wrapper">
        <table className="schedule-matrix" id="schedule-matrix-table" style={{ tableLayout: 'auto', minWidth: 'max-content' }}>
          <thead>
            <tr>
              <th rowSpan={2} className="col-employee" style={{ verticalAlign: 'middle', borderRight: '2px solid var(--border-color)' }}>Funcionário / Cargo</th>
              {monthlyWeeks.map((week, weekIdx) => (
                <th key={weekIdx} colSpan={7} style={{ textAlign: 'center', backgroundColor: 'rgba(175, 143, 86, 0.1)', color: 'var(--color-gold-text)', fontWeight: 'bold', fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)' }}>
                  Semana {weekIdx + 1}
                </th>
              ))}
            </tr>
            <tr id="matrix-header-row">
              {monthlyWeeks.map((week) =>
                week.map((dateStr, dayIdx) => {
                  const dayName = DAY_SHORT_NAMES_SEG_DOM[dayIdx];
                  const dayNum = dateStr ? dateStr.split('-')[2] : '';
                  return (
                    <th key={dayIdx} className="col-day" style={{ textAlign: 'center', fontSize: '0.8rem', padding: '0.5rem 0.25rem' }}>
                      <div>{dayName}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {dayNum ? parseInt(dayNum) : ''}
                      </div>
                    </th>
                  );
                })
              )}
            </tr>
          </thead>
          <tbody id="matrix-body">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={1 + monthlyWeeks.length * 7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  Nenhum funcionário cadastrado ou alocado nesta loja.
                </td>
              </tr>
            ) : (
              filteredEmployees.map(employee => {
                // Calculate weekly hours for each week block to show inside the cell info
                const employeeWeekHours = monthlyWeeks.map(week => {
                  let hours = 0;
                  const weekDatesOnly = week.filter((d): d is string => d !== null);
                  uniqueShifts
                    .filter(s => s.employee_id === employee.id && s.store_id === employee.home_store_id && weekDatesOnly.includes(s.date))
                    .forEach(s => {
                      const isFolga = (s.start_time === '00:00' && s.end_time === '00:00') || !s.start_time;
                      if (!isFolga) {
                        hours += getShiftDuration(s.start_time, s.end_time, s.break_duration_minutes);
                      }
                    });
                  return hours;
                });

                return (
                  <tr key={employee.id} className="employee-row">
                    {/* Employee Meta */}
                    <td className="col-employee" style={{ borderRight: '2px solid var(--border-color)' }}>
                      <div className="employee-cell-info">
                        <div className="employee-cell-name" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{employee.name}</div>
                        <div className="employee-cell-meta" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                          <span className="employee-role-tag">{employee.role}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }} title="Horas trabalhadas por semana (Semana 1 | Semana 2 | ...)">
                            Horas: {employeeWeekHours.map((h, i) => `S${i+1}:${h.toFixed(0)}h`).join(' | ')}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Day Columns for all weeks side-by-side */}
                    {monthlyWeeks.map((week) =>
                      week.map((date, dayIdx) => {
                        if (!date) {
                          // Day is outside the active month range
                          return (
                            <td key={`empty-${dayIdx}`} className="matrix-cell empty-month-cell" style={{ backgroundColor: '#f8fafc', opacity: 0.4 }}>
                              <div className="shift-card-empty-disabled" style={{ height: '36px' }} />
                            </td>
                          );
                        }

                        // Active shift for employee
                        const dayShifts = uniqueShifts.filter(
                          s => s.employee_id === employee.id && s.date === date && s.store_id === employee.home_store_id
                        );
                        const cellAlerts = activeAlerts.filter(a => a.employeeId === employee.id && a.date === date);
                        const hasCellAlert = showWarnings && cellAlerts.length > 0;

                        return (
                          <td key={date} className="matrix-cell">
                            {dayShifts.length === 0 ? (
                              <div
                                className="shift-card shift-card-empty"
                                onClick={() => onCellClick(employee.id, date)}
                              >
                                <span className="empty-plus">+</span>
                              </div>
                            ) : (
                              dayShifts.map(shift => {
                                const isFolga = (shift.start_time === '00:00' && shift.end_time === '00:00') || !shift.start_time;

                                if (isFolga) {
                                  return (
                                    <div
                                      key={shift.id}
                                      className="shift-card shift-card-folga"
                                      onClick={() => onCellClick(employee.id, date, shift)}
                                    >
                                      <span className="shift-time">Folga</span>
                                    </div>
                                  );
                                }

                                const storeIdx = stores.findIndex(s => s.id === shift.store_id);
                                const storeShort = stores[storeIdx]
                                  ? stores[storeIdx].name.replace('Constance ', '')
                                  : 'Loja';

                                const duration = getShiftDuration(
                                  shift.start_time,
                                  shift.end_time,
                                  shift.break_duration_minutes
                                );

                                return (
                                  <div
                                    key={shift.id}
                                    className="shift-card shift-card-active"
                                    onClick={() => onCellClick(employee.id, date, shift)}
                                  >
                                    <span className="shift-time">
                                      {shift.start_time} - {shift.end_time}
                                    </span>
                                    <span className="shift-hours-info">
                                      ({duration.toFixed(1)}h | int: {shift.break_duration_minutes}m)
                                    </span>
                                    <span className={`shift-store store-tag-${storeIdx >= 0 ? storeIdx : '0'}`}>
                                      {storeShort}
                                    </span>
                                  </div>
                                );
                              })
                            )}

                            {/* Error Dot */}
                            {hasCellAlert && (
                              <span
                                className="cell-warning-indicator"
                                title={cellAlerts.map(a => a.message.replace(/<\/?[^>]+(>|$)/g, "")).join('\n')}
                              />
                            )}
                          </td>
                        );
                      })
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
