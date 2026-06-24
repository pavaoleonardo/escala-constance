import React from 'react';
import { Store, Employee, Shift, ScheduleAlert } from '../lib/types';
import { getShiftDuration, getUniqueShifts, isDateInMonth } from '../lib/validation';

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

// Subtle alternating tints per week (used for column group backgrounds)
const WEEK_BODY_BG = [
  'rgba(175, 143, 86, 0.05)',
  'rgba(99, 102, 241, 0.04)',
  'rgba(16, 185, 129, 0.04)',
  'rgba(245, 158, 11, 0.04)',
  'rgba(239, 68, 68, 0.03)',
  'rgba(59, 130, 246, 0.04)',
];

const WEEK_HEADER_BG = [
  'rgba(175, 143, 86, 0.13)',
  'rgba(99, 102, 241, 0.09)',
  'rgba(16, 185, 129, 0.09)',
  'rgba(245, 158, 11, 0.09)',
  'rgba(239, 68, 68, 0.07)',
  'rgba(59, 130, 246, 0.09)',
];

const STORE_BADGE_COLORS = [
  '#1c7ed6',
  '#7048e8',
  '#d6336c',
  '#2f9e44',
  '#e67700',
  '#0c8599',
];

// Employee column width — must be in sync with CSS .col-employee
const EMP_COL_WIDTH = 180;

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
  // All dates in the grid (including prev-month padding days like Jun 29/30)
  const allGridDates = monthlyWeeks.flat().filter((d): d is string => d !== null);
  const allMonthDates = allGridDates; // kept for compatibility

  // Stores to render
  const storesToShow: Store[] =
    activeStoreFilter === 'all'
      ? stores
      : stores.filter(s => s.id === activeStoreFilter);

  // Employees per store
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

  // total columns = employee col + (7 days × N weeks)
  const totalDayCols = monthlyWeeks.length * 7;

  return (
    <div className="matrix-container card">
      <div className="matrix-scroll-wrapper">
        <table
          className="schedule-matrix"
          id="schedule-matrix-table"
          style={{ tableLayout: 'auto', minWidth: 'max-content', borderCollapse: 'separate', borderSpacing: 0 }}
        >
          <thead>
            {/* ── Row 1: Week group labels ── */}
            <tr>
              {/* Employee column header — sticky + solid bg so it's never transparent */}
              <th
                rowSpan={2}
                style={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 20,
                  width: EMP_COL_WIDTH,
                  minWidth: EMP_COL_WIDTH,
                  backgroundColor: '#ffffff',
                  borderRight: '2px solid #e2e8f0',
                  verticalAlign: 'middle',
                  padding: '0.6rem 0.8rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#64748b',
                  borderBottom: '2px solid #e2e8f0',
                }}
              >
                Funcionário / Cargo
              </th>

              {monthlyWeeks.map((week, wIdx) => {
                // For week label use only dates in the target month
                const weekYear = monthlyWeeks[0][0] ? parseInt(monthlyWeeks[0][0].split('-')[0]) : new Date().getFullYear();
                const weekMonth = monthlyWeeks[0].find(d => d !== null)?.split('-')[1] || '01';
                const targetYear = parseInt(weekYear.toString());
                const targetMonthIdx = parseInt(weekMonth) - 1;
                const datesInMonth = week.filter((d): d is string => d !== null && isDateInMonth(d, targetYear, targetMonthIdx));
                const firstDate = datesInMonth[0] || week.find(d => d !== null);
                const lastDate = datesInMonth[datesInMonth.length - 1] || [...week].reverse().find(d => d !== null);
                const fDay = firstDate ? parseInt(firstDate.split('-')[2]) : '';
                const lDay = lastDate ? parseInt(lastDate.split('-')[2]) : '';
                return (
                  <th
                    key={wIdx}
                    colSpan={7}
                    style={{
                      textAlign: 'center',
                      backgroundColor: WEEK_HEADER_BG[wIdx % WEEK_HEADER_BG.length],
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      borderLeft: '2px solid #e2e8f0',
                      borderBottom: '1px solid #e2e8f0',
                      padding: '6px 4px',
                      color: '#80612c',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Semana {wIdx + 1}
                    {fDay !== '' && lDay !== '' && (
                      <span style={{ fontWeight: 400, opacity: 0.7, marginLeft: 6, fontSize: '0.68rem' }}>
                        ({fDay}–{lDay})
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>

            {/* ── Row 2: Day-of-week + day number ── */}
            <tr>
              {monthlyWeeks.map((week, wIdx) => {
                // Determine which month is being displayed (from the first month-owned date)
                const firstMonthDate = monthlyWeeks.flat().find(d => {
                  if (!d) return false;
                  const yr = parseInt(d.split('-')[0]);
                  const mo = parseInt(d.split('-')[1]) - 1;
                  // Find first date that is the reference month
                  return true; // placeholder — we use activeYear/activeMonthIndex below
                });
                return week.map((dateStr, dIdx) => {
                  const dayNum = dateStr ? parseInt(dateStr.split('-')[2]) : '';
                  const isWeekend = dIdx >= 5;
                  const isFirstDayOfWeek = dIdx === 0;
                  // Check if this date belongs to the displayed month by comparing its month
                  const isPrevMonth = dateStr ? (() => {
                    const parts = dateStr.split('-');
                    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                    // We treat it as prev-month if its date is < first day of the target month's first date
                    const refMonthDates = monthlyWeeks.flat().filter((x): x is string => x !== null);
                    const firstOfMonth = refMonthDates.find(x => {
                      const p = x.split('-');
                      const dInMonth = new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]));
                      return dInMonth.getDate() === 1;
                    });
                    if (firstOfMonth) {
                      const refDate = new Date(firstOfMonth + 'T00:00:00');
                      return d < refDate;
                    }
                    return false;
                  })() : false;
                  return (
                    <th
                      key={`hd-${wIdx}-${dIdx}`}
                      style={{
                        textAlign: 'center',
                        fontSize: '0.72rem',
                        padding: '5px 3px',
                        borderLeft: isFirstDayOfWeek ? '2px solid #e2e8f0' : undefined,
                        borderBottom: '2px solid #e2e8f0',
                        color: isPrevMonth ? '#adb5bd' : isWeekend ? '#80612c' : '#334155',
                        fontWeight: isWeekend && !isPrevMonth ? 700 : 600,
                        backgroundColor: isPrevMonth
                          ? 'rgba(148,163,184,0.08)'
                          : WEEK_HEADER_BG[wIdx % WEEK_HEADER_BG.length],
                        opacity: dateStr ? (isPrevMonth ? 0.6 : 1) : 0.35,
                        whiteSpace: 'nowrap',
                        width: 110,
                        minWidth: 110,
                      }}
                    >
                      <div>{DAY_SHORT[dIdx]}</div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 400, color: isPrevMonth ? '#cbd5e1' : '#94a3b8', marginTop: '1px' }}>
                        {dayNum !== '' ? dayNum : '–'}
                      </div>
                    </th>
                  );
                });
              })}
            </tr>
          </thead>

          <tbody id="matrix-body">
            {storesToShow.map((store, storeIdx) => {
              const storeEmps = storeEmployeeMap.get(store.id) ?? [];
              const badgeColor = STORE_BADGE_COLORS[storeIdx % STORE_BADGE_COLORS.length];

              return (
                <React.Fragment key={store.id}>
                  {/* ── Store group header row ── */}
                  <tr>
                    {/* Sticky store-name cell (left column) */}
                    <td
                      style={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 10,
                        width: EMP_COL_WIDTH,
                        minWidth: EMP_COL_WIDTH,
                        backgroundColor: '#f1f5f9',
                        borderRight: '2px solid #e2e8f0',
                        borderTop: storeIdx > 0 ? '3px solid #cbd5e1' : '1px solid #e2e8f0',
                        borderBottom: '1px solid #e2e8f0',
                        padding: '6px 10px',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 20,
                              height: 20,
                              borderRadius: 5,
                              backgroundColor: badgeColor,
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              flexShrink: 0,
                            }}
                          >
                            {store.name.charAt(0).toUpperCase()}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: '0.78rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {store.name}
                          </span>
                        </div>
                        <div style={{ paddingLeft: 28 }}>
                          <span
                            style={{
                              fontSize: '0.66rem',
                              color: '#64748b',
                              backgroundColor: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: 20,
                              padding: '1px 6px',
                              fontWeight: 500,
                              display: 'inline-block',
                              lineHeight: '1.2',
                            }}
                          >
                            {storeEmps.length} {storeEmps.length === 1 ? 'funcionário' : 'funcionários'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Rest of the row — decorative gradient */}
                    <td
                      colSpan={totalDayCols}
                      style={{
                        background: `linear-gradient(90deg, ${badgeColor}18 0%, transparent 60%)`,
                        borderTop: storeIdx > 0 ? '3px solid #cbd5e1' : '1px solid #e2e8f0',
                        borderBottom: '1px solid #e2e8f0',
                        padding: '7px 14px',
                        verticalAlign: 'middle',
                      }}
                    />
                  </tr>

                  {/* ── Employee rows ── */}
                  {storeEmps.length === 0 ? (
                    <tr>
                      <td
                        colSpan={1 + totalDayCols}
                        style={{
                          textAlign: 'center',
                          color: '#94a3b8',
                          padding: '1.5rem',
                          fontSize: '0.8rem',
                          fontStyle: 'italic',
                        }}
                      >
                        Nenhum funcionário cadastrado nesta loja.
                      </td>
                    </tr>
                  ) : (
                    storeEmps.map(employee => {
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
                            if (!isFolga)
                              h += getShiftDuration(s.start_time, s.end_time, s.break_duration_minutes);
                          });
                        return h;
                      });

                      return (
                        <tr key={employee.id} className="employee-row">
                          {/* Sticky employee name cell */}
                          <td
                            style={{
                              position: 'sticky',
                              left: 0,
                              zIndex: 5,
                              width: EMP_COL_WIDTH,
                              minWidth: EMP_COL_WIDTH,
                              backgroundColor: '#ffffff',
                              borderRight: '2px solid #e2e8f0',
                              padding: '0.5rem 0.75rem',
                              verticalAlign: 'middle',
                            }}
                          >
                            <div style={{ fontWeight: 600, fontSize: '0.84rem', color: '#0f172a' }}>
                              {employee.name}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 3 }}>
                              <span className="employee-role-tag">{employee.role}</span>
                              <span style={{ fontSize: '0.67rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                                {weekHours.map((h, i) => `S${i + 1}: ${h.toFixed(0)}h`).join(' · ')}
                              </span>
                            </div>
                          </td>

                          {/* Day cells */}
                          {monthlyWeeks.map((week, wIdx) =>
                            week.map((date, dIdx) => {
                              const isFirstDayOfWeek = dIdx === 0;
                              const weekBg = WEEK_BODY_BG[wIdx % WEEK_BODY_BG.length];

                              if (!date) {
                                return (
                                  <td
                                    key={`empty-${wIdx}-${dIdx}`}
                                    style={{
                                      backgroundColor: '#f8fafc',
                                      opacity: 0.4,
                                      borderLeft: isFirstDayOfWeek ? '2px solid #e2e8f0' : undefined,
                                      padding: '0.5rem',
                                      height: 84,
                                      width: 110,
                                      minWidth: 110,
                                    }}
                                  >
                                    <div style={{ height: 36 }} />
                                  </td>
                                );
                              }

                              // Check if this date is from the previous month (padding days)
                              const isPrevMonthDate = (() => {
                                const refMonthDates = allGridDates;
                                const firstOfMonth = refMonthDates.find(x => {
                                  const p = x.split('-');
                                  return new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2])).getDate() === 1;
                                });
                                if (firstOfMonth) {
                                  const p = date.split('-');
                                  const d = new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]));
                                  const ref = new Date(firstOfMonth + 'T00:00:00');
                                  return d < ref;
                                }
                                return false;
                              })();

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
                                    backgroundColor: isPrevMonthDate ? 'rgba(148,163,184,0.06)' : weekBg,
                                    borderLeft: isFirstDayOfWeek ? '2px solid #e2e8f0' : undefined,
                                    position: 'relative',
                                    padding: '0.4rem',
                                    height: 84,
                                    width: 110,
                                    minWidth: 110,
                                    verticalAlign: 'middle',
                                    opacity: isPrevMonthDate ? 0.65 : 1,
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

                                      const sIdx = stores.findIndex(s => s.id === shift.store_id);
                                      const storeShort = stores[sIdx]
                                        ? stores[sIdx].name.replace('Constance ', '')
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
                                          <span className={`shift-store store-tag-${sIdx >= 0 ? sIdx : 0}`}>
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
