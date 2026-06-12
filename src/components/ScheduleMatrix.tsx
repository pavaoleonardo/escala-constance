import React from 'react';
import { Store, Employee, Shift, ScheduleAlert } from '../lib/types';
import { getShiftDuration, formatToDayMonth, DAY_SHORT_NAMES_PT } from '../lib/validation';

interface ScheduleMatrixProps {
  stores: Store[];
  employees: Employee[];
  shifts: Shift[];
  weekDates: string[];
  activeStoreFilter: string;
  activeAlerts: ScheduleAlert[];
  onCellClick: (employeeId: string, date: string, shift?: Shift) => void;
  showWarnings: boolean;
}

export const ScheduleMatrix: React.FC<ScheduleMatrixProps> = ({
  stores,
  employees,
  shifts,
  weekDates,
  activeStoreFilter,
  activeAlerts,
  onCellClick,
  showWarnings,
}) => {
  // Filter active employees
  let filteredEmployees = employees.filter(emp => emp.active);

  if (activeStoreFilter !== 'all') {
    filteredEmployees = filteredEmployees.filter(emp => {
      const isHomeStore = emp.home_store_id === activeStoreFilter;
      const hasFloatShiftHere = shifts.some(
        s =>
          s.employee_id === emp.id &&
          s.store_id === activeStoreFilter &&
          weekDates.includes(s.date) &&
          !((s.start_time === '00:00' && s.end_time === '00:00') || !s.start_time)
      );
      return isHomeStore || hasFloatShiftHere;
    });
  }

  // Group by store
  const storeGroups: Record<string, { name: string; employees: Employee[] }> = {};
  stores.forEach(st => {
    storeGroups[st.id] = { name: st.name, employees: [] };
  });
  storeGroups['unknown'] = { name: 'Sem Loja Sede', employees: [] };

  filteredEmployees.forEach(emp => {
    const storeId = emp.home_store_id || 'unknown';
    if (storeGroups[storeId]) {
      storeGroups[storeId].employees.push(emp);
    } else {
      storeGroups['unknown'].employees.push(emp);
    }
  });

  return (
    <div className="matrix-container card">
      <div className="matrix-scroll-wrapper">
        <table className="schedule-matrix" id="schedule-matrix-table">
          <thead>
            <tr id="matrix-header-row">
              <th className="col-employee">Funcionário / Cargo</th>
              {weekDates.map((date, idx) => (
                <th key={date} className="col-day">
                  {DAY_SHORT_NAMES_PT[idx]}{' '}
                  <span className="header-date">{formatToDayMonth(date)}</span>
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
              Object.entries(storeGroups).map(([storeId, group]) => {
                if (group.employees.length === 0) return null;

                return (
                  <React.Fragment key={storeId}>
                    {/* Store Header Row */}
                    <tr className="store-group-row">
                      <td colSpan={8}>{group.name}</td>
                    </tr>

                    {/* Employee Rows */}
                    {group.employees.map(employee => {
                      // Calculate weekly hours
                      let weeklyHours = 0;
                      shifts
                        .filter(s => s.employee_id === employee.id && s.store_id === employee.home_store_id && weekDates.includes(s.date))
                        .forEach(s => {
                          const isFolga = (s.start_time === '00:00' && s.end_time === '00:00') || !s.start_time;
                          if (!isFolga) {
                            weeklyHours += getShiftDuration(s.start_time, s.end_time, s.break_duration_minutes);
                          }
                        });

                      const hasOvertime = weeklyHours > employee.weekly_hours_contract;
                      const overtimeHours = hasOvertime ? weeklyHours - employee.weekly_hours_contract : 0;

                      return (
                        <tr key={employee.id} className="employee-row">
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
                          {weekDates.map(date => {
                            // Only show shifts for the employee's home store (no cross-store)
                            // Take only the last shift per cell to avoid duplicate stacking
                            const allDayShifts = shifts.filter(
                              s => s.employee_id === employee.id && s.date === date && s.store_id === employee.home_store_id
                            );
                            const dayShifts = allDayShifts.length > 1 ? [allDayShifts[allDayShifts.length - 1]] : allDayShifts;
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
