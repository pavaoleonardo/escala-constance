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

  const DAY_SHORT_NAMES_DOM_SAB = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="matrix-container card">
      <div className="matrix-scroll-wrapper">
        <table className="schedule-matrix" id="schedule-matrix-table">
          <thead>
            <tr id="matrix-header-row">
              <th className="col-employee">Funcionário / Cargo</th>
              {DAY_SHORT_NAMES_DOM_SAB.map(name => (
                <th key={name} className="col-day" style={{ textAlign: 'center' }}>
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody id="matrix-body">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  Nenhum funcionário cadastrado ou alocado nesta loja.
                </td>
              </tr>
            ) : (
              monthlyWeeks.map((week, weekIdx) => {
                const weekDatesOnly = week.filter((d): d is string => d !== null);

                return (
                  <React.Fragment key={weekIdx}>
                    {/* Week Header Row containing numbers of the month */}
                    <tr className="store-group-row" style={{ backgroundColor: 'rgba(175, 143, 86, 0.1)', color: 'var(--color-gold-text)', fontWeight: 'bold' }}>
                      <td style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                        Semana {weekIdx + 1}
                      </td>
                      {week.map((dateStr, dayIdx) => {
                        const dayNum = dateStr ? dateStr.split('-')[2] : '';
                        return (
                          <td key={dayIdx} style={{ textAlign: 'center', fontSize: '0.9rem', padding: '0.5rem' }}>
                            {dayNum ? parseInt(dayNum) : ''}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Employee Rows for this week */}
                    {filteredEmployees.map(employee => {
                      // Calculate weekly hours for this specific week block
                      let weeklyHours = 0;
                      uniqueShifts
                        .filter(s => s.employee_id === employee.id && s.store_id === employee.home_store_id && weekDatesOnly.includes(s.date))
                        .forEach(s => {
                          const isFolga = (s.start_time === '00:00' && s.end_time === '00:00') || !s.start_time;
                          if (!isFolga) {
                            weeklyHours += getShiftDuration(s.start_time, s.end_time, s.break_duration_minutes);
                          }
                        });

                      const hasOvertime = weeklyHours > employee.weekly_hours_contract;
                      const overtimeHours = hasOvertime ? weeklyHours - employee.weekly_hours_contract : 0;

                      return (
                        <tr key={`${employee.id}-${weekIdx}`} className="employee-row">
                          {/* Employee Meta */}
                          <td className="col-employee">
                            <div className="employee-cell-info">
                              <div className="employee-cell-name">{employee.name}</div>
                              <div className="employee-cell-meta">
                                <span className="employee-role-tag">{employee.role}</span>
                                <span
                                  className={`employee-cell-hours ${hasOvertime ? 'has-overtime' : ''}`}
                                  title={hasOvertime ? `${overtimeHours.toFixed(1)}h extras` : 'Horas trabalhadas nesta semana / Contrato'}
                                >
                                  {weeklyHours.toFixed(0)}h{hasOvertime && ` (+${overtimeHours.toFixed(0)}h)`}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Day Columns */}
                          {week.map((date, dayIdx) => {
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
                          })}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
