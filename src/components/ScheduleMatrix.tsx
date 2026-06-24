import React from 'react';
import { Store, Employee, Shift, ScheduleAlert } from '../lib/types';
import { getShiftDuration, getUniqueShifts } from '../lib/validation';

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

const DAY_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

// Week separator colors — alternating subtle backgrounds per week block
const WEEK_COLORS = [
  'rgba(175, 143, 86, 0.06)',
  'rgba(99, 102, 241, 0.04)',
  'rgba(16, 185, 129, 0.04)',
  'rgba(245, 158, 11, 0.04)',
  'rgba(239, 68, 68, 0.03)',
  'rgba(59, 130, 246, 0.04)',
];

const WEEK_HEADER_COLORS = [
  'rgba(175, 143, 86, 0.15)',
  'rgba(99, 102, 241, 0.10)',
  'rgba(16, 185, 129, 0.10)',
  'rgba(245, 158, 11, 0.10)',
  'rgba(239, 68, 68, 0.08)',
  'rgba(59, 130, 246, 0.10)',
];

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
  const uniqueShifts = getUniqueShifts(shifts);
  const allMonthDates = monthlyWeeks.flat().filter((d): d is string => d !== null);

  // Build list of stores to show, and their employees
  const storesToShow: Store[] =
    activeStoreFilter === 'all'
      ? stores
      : stores.filter(s => s.id === activeStoreFilter);

  // For each store, get the filtered employee list
  const storeEmployeeMap = new Map<string, Employee[]>();
  storesToShow.forEach(store => {
    const emps = employees.filter(emp => {
      if (!emp.active) return false;
      if (activeStoreFilter !== 'all') {
        return (
          emp.home_store_id === store.id ||
          uniqueShifts.some(
            s =>
              s.employee_id === emp.id &&
              s.store_id === store.id &&
              allMonthDates.includes(s.date) &&
              !((s.start_time === '00:00' && s.end_time === '00:00') || !s.start_time)
          )
        );
      }
      return emp.home_store_id === store.id;
    });
    storeEmployeeMap.set(store.id, emps);
  });

  const totalCols = 1 + monthlyWeeks.length * 7;

  return (
    <div className="matrix-container card">
      <div className="matrix-scroll-wrapper">
        <table
          className="schedule-matrix"
          id="schedule-matrix-table"
          style={{ tableLayout: 'auto', minWidth: 'max-content', borderCollapse: 'separate', borderSpacing: 0 }}
        >
          {/* ── COLGROUP for alternating week backgrounds ── */}
          <colgroup>
            {/* sticky employee column */}
            <col style={{ minWidth: '160px' }} />
            {monthlyWeeks.map((_, wIdx) =>
              Array.from({ length: 7 }).map((__, dIdx) => (
                <col
                  key={`col-${wIdx}-${dIdx}`}
                  style={{ backgroundColor: WEEK_COLORS[wIdx % WEEK_COLORS.length] }}
                />
              ))
            )}
          </colgroup>

          <thead>
            {/* ── Row 1: Week group headers ── */}
            <tr>
              <th
                rowSpan={2}
                className="col-employee"
                style={{
                  verticalAlign: 'middle',
                  borderRight: '2px solid var(--border-color)',
                  position: 'sticky',
                  left: 0,
                  zIndex: 3,
                  backgroundColor: 'var(--bg-secondary)',
                }}
              >
                Funcionário / Cargo
              </th>
              {monthlyWeeks.map((week, wIdx) => {
                const firstDate = week.find(d => d !== null);
                const lastDate = [...week].reverse().find(d => d !== null);
                const fDay = firstDate ? parseInt(firstDate.split('-')[2]) : '';
                const lDay = lastDate ? parseInt(lastDate.split('-')[2]) : '';
                return (
                  <th
                    key={wIdx}
                    colSpan={7}
                    style={{
                      textAlign: 'center',
                      backgroundColor: WEEK_HEADER_COLORS[wIdx % WEEK_HEADER_COLORS.length],
                      fontWeight: '700',
                      fontSize: '0.78rem',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      borderBottom: '1px solid var(--border-color)',
                      borderLeft: '2px solid var(--border-color)',
                      padding: '6px 4px',
                      color: 'var(--color-gold-text)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Semana {wIdx + 1}
                    {fDay && lDay ? (
                      <span style={{ fontWeight: 400, opacity: 0.75, marginLeft: '6px', fontSize: '0.72rem' }}>
                        ({fDay}–{lDay})
                      </span>
                    ) : null}
                  </th>
                );
              })}
            </tr>

            {/* ── Row 2: Day-of-week + day-number headers ── */}
            <tr id="matrix-header-row">
              {monthlyWeeks.map((week, wIdx) =>
                week.map((dateStr, dIdx) => {
                  const dayNum = dateStr ? parseInt(dateStr.split('-')[2]) : '';
                  const isWeekend = dIdx >= 5;
                  return (
                    <th
                      key={`hd-${wIdx}-${dIdx}`}
                      className="col-day"
                      style={{
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        padding: '5px 3px',
                        borderLeft: dIdx === 0 ? '2px solid var(--border-color)' : undefined,
                        color: isWeekend ? 'var(--color-gold-text)' : 'var(--text-primary)',
                        backgroundColor: WEEK_HEADER_COLORS[wIdx % WEEK_HEADER_COLORS.length],
                        opacity: dateStr ? 1 : 0.35,
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>{DAY_SHORT[dIdx]}</div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-muted)', marginTop: '1px' }}>
                        {dayNum || '–'}
                      </div>
                    </th>
                  );
                })
              )}
            </tr>
          </thead>

          <tbody id="matrix-body">
            {storesToShow.map((store, storeIdx) => {
              const storeEmps = storeEmployeeMap.get(store.id) ?? [];
              const storeName = store.name;

              return (
                <React.Fragment key={store.id}>
                  {/* ── Store separator / group header row ── */}
                  <tr className="store-group-header-row">
                    <td
                      colSpan={totalCols}
                      style={{
                        padding: '8px 14px',
                        background: 'linear-gradient(90deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
                        borderTop: storeIdx > 0 ? '3px solid var(--border-color)' : '1px solid var(--border-color)',
                        borderBottom: '1px solid var(--border-color)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '26px',
                            height: '26px',
                            borderRadius: '6px',
                            background: `hsl(${(storeIdx * 67 + 200) % 360}, 60%, 55%)`,
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            flexShrink: 0,
                          }}
                        >
                          {storeName.charAt(0).toUpperCase()}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
                          {storeName}
                        </span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            color: 'var(--text-muted)',
                            backgroundColor: 'var(--bg-primary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '20px',
                            padding: '1px 8px',
                            marginLeft: '4px',
                          }}
                        >
                          {storeEmps.length} funcionário{storeEmps.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* ── Employee rows ── */}
                  {storeEmps.length === 0 ? (
                    <tr>
                      <td
                        colSpan={totalCols}
                        style={{
                          textAlign: 'center',
                          color: 'var(--text-muted)',
                          padding: '1.5rem',
                          fontSize: '0.8rem',
                          fontStyle: 'italic',
                        }}
                      >
                        Nenhum funcionário cadastrado nesta loja.
                      </td>
                    </tr>
                  ) : (
                    storeEmps.map((employee, empIdx) => {
                      const isLastEmp = empIdx === storeEmps.length - 1;

                      // Per-week hours summary
                      const weekHours = monthlyWeeks.map(week => {
                        let h = 0;
                        const weekDates = week.filter((d): d is string => d !== null);
                        uniqueShifts
                          .filter(
                            s =>
                              s.employee_id === employee.id &&
                              s.store_id === employee.home_store_id &&
                              weekDates.includes(s.date)
                          )
                          .forEach(s => {
                            const isFolga =
                              (s.start_time === '00:00' && s.end_time === '00:00') || !s.start_time;
                            if (!isFolga) h += getShiftDuration(s.start_time, s.end_time, s.break_duration_minutes);
                          });
                        return h;
                      });

                      return (
                        <tr
                          key={employee.id}
                          className="employee-row"
                          style={{ borderBottom: isLastEmp ? 'none' : '1px solid var(--border-color)' }}
                        >
                          {/* Employee name + meta */}
                          <td
                            className="col-employee"
                            style={{
                              borderRight: '2px solid var(--border-color)',
                              position: 'sticky',
                              left: 0,
                              zIndex: 2,
                              backgroundColor: 'var(--bg-secondary)',
                            }}
                          >
                            <div className="employee-cell-info">
                              <div
                                className="employee-cell-name"
                                style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}
                              >
                                {employee.name}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '3px' }}>
                                <span className="employee-role-tag">{employee.role}</span>
                                <span
                                  style={{
                                    fontSize: '0.68rem',
                                    color: 'var(--text-muted)',
                                    whiteSpace: 'nowrap',
                                  }}
                                  title="Horas por semana"
                                >
                                  {weekHours.map((h, i) => `S${i + 1}: ${h.toFixed(0)}h`).join(' · ')}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Day cells */}
                          {monthlyWeeks.map((week, wIdx) =>
                            week.map((date, dIdx) => {
                              const isFirstDayOfWeek = dIdx === 0;

                              if (!date) {
                                return (
                                  <td
                                    key={`empty-${wIdx}-${dIdx}`}
                                    className="matrix-cell empty-month-cell"
                                    style={{
                                      backgroundColor: 'var(--bg-primary)',
                                      opacity: 0.3,
                                      borderLeft: isFirstDayOfWeek ? '2px solid var(--border-color)' : undefined,
                                    }}
                                  >
                                    <div style={{ height: '36px' }} />
                                  </td>
                                );
                              }

                              const dayShifts = uniqueShifts.filter(
                                s =>
                                  s.employee_id === employee.id &&
                                  s.date === date &&
                                  s.store_id === employee.home_store_id
                              );

                              const cellAlerts = activeAlerts.filter(
                                a => a.employeeId === employee.id && a.date === date
                              );
                              const hasCellAlert = showWarnings && cellAlerts.length > 0;

                              return (
                                <td
                                  key={date}
                                  className="matrix-cell"
                                  style={{
                                    borderLeft: isFirstDayOfWeek ? '2px solid var(--border-color)' : undefined,
                                    position: 'relative',
                                  }}
                                >
                                  {dayShifts.length === 0 ? (
                                    <div
                                      className="shift-card shift-card-empty"
                                      onClick={() => onCellClick(employee.id, date)}
                                    >
                                      <span className="empty-plus">+</span>
                                    </div>
                                  ) : (
                                    dayShifts.map(shift => {
                                      const isFolga =
                                        (shift.start_time === '00:00' && shift.end_time === '00:00') ||
                                        !shift.start_time;

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

                                      const storeIndex = stores.findIndex(s => s.id === shift.store_id);
                                      const storeShort = stores[storeIndex]
                                        ? stores[storeIndex].name.replace('Constance ', '')
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
                                            {shift.start_time} – {shift.end_time}
                                          </span>
                                          <span className="shift-hours-info">
                                            ({duration.toFixed(1)}h | int: {shift.break_duration_minutes}m)
                                          </span>
                                          <span
                                            className={`shift-store store-tag-${storeIndex >= 0 ? storeIndex : '0'}`}
                                          >
                                            {storeShort}
                                          </span>
                                        </div>
                                      );
                                    })
                                  )}

                                  {hasCellAlert && (
                                    <span
                                      className="cell-warning-indicator"
                                      title={cellAlerts
                                        .map(a => a.message.replace(/<\/?[^>]+(>|$)/g, ''))
                                        .join('\n')}
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
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
