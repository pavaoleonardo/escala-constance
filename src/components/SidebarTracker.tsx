import React from 'react';
import { Store, Employee, Shift, ScheduleAlert } from '../lib/types';
import { DAY_NAMES_PT, formatToDayMonth, formatDateString, calculateOvertime, getShiftDuration } from '../lib/validation';

interface SidebarTrackerProps {
  stores: Store[];
  employees: Employee[];
  shifts: Shift[];
  currentWeekStart: Date;
  activeStoreFilter: string;
  onStoreFilterChange: (id: string) => void;
  activeAlerts: ScheduleAlert[];
  weekDates: string[];
  showWarnings: boolean;
}

export const SidebarTracker: React.FC<SidebarTrackerProps> = ({
  stores,
  employees,
  shifts,
  currentWeekStart,
  activeStoreFilter,
  onStoreFilterChange,
  activeAlerts,
  weekDates,
  showWarnings,
}) => {
  // Get active month details
  const activeMonthStr = currentWeekStart.toLocaleString('pt-BR', { month: 'long' });
  const activeMonthIndex = currentWeekStart.getMonth();
  const activeYear = currentWeekStart.getFullYear();

  // Calculate Sundays in this calendar month
  const sundays: string[] = [];
  const tempDate = new Date(activeYear, activeMonthIndex, 1);
  while (tempDate.getMonth() === activeMonthIndex) {
    if (tempDate.getDay() === 0) {
      sundays.push(formatDateString(tempDate));
    }
    tempDate.setDate(tempDate.getDate() + 1);
  }

  // Overtime data
  const filteredEmployees = employees.filter(
    emp => emp.active && (activeStoreFilter === 'all' || emp.home_store_id === activeStoreFilter)
  );
  const overtimeData = calculateOvertime(filteredEmployees, shifts, currentWeekStart);

  return (
    <aside className="workspace-sidebar">
      {/* 1. Store Filtering */}
      <section className="sidebar-section card">
        <h3>Filtro de Lojas</h3>
        <div className="store-filter-buttons">
          <button
            type="button"
            className={`store-filter-btn ${activeStoreFilter === 'all' ? 'active' : ''}`}
            onClick={() => onStoreFilterChange('all')}
          >
            <span className="dot"></span>
            <span>Todas</span>
          </button>
          {stores.map(store => (
            <button
              key={store.id}
              type="button"
              className={`store-filter-btn ${activeStoreFilter === store.id ? 'active' : ''}`}
              onClick={() => onStoreFilterChange(store.id)}
            >
              <span className="dot"></span>
              <span>{store.name.replace('Constance ', '')}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 2. Weekly Hours & Overtime Summary */}
      <section className="sidebar-section card">
        <h3>Horas Semanais</h3>
        <p className="section-desc">Horas regulares e extras da semana ativa.</p>
        <div className="overtime-list">
          {overtimeData.map(info => (
            <div key={info.employeeId} className="overtime-row">
              <div className="overtime-name">{info.employeeName}</div>
              <div className="overtime-hours">
                <span className="hours-regular">{info.regularHours.toFixed(0)}h</span>
                {info.overtimeHours > 0 && (
                  <span className="hours-extra">+{info.overtimeHours.toFixed(1)}h extra</span>
                )}
              </div>
            </div>
          ))}
          {overtimeData.length === 0 && (
            <p className="section-desc" style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              Nenhum funcionário ativo.
            </p>
          )}
        </div>
      </section>

      {/* 3. Sunday Rotation — informational only, no alerts */}
      <section className="sidebar-section card">
        <div className="section-header">
          <h3>Domingos</h3>
          <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
            {activeMonthStr.slice(0, 3)}/{activeYear}
          </span>
        </div>
        <p className="section-desc">Folgas dominicais do mês (calculado automaticamente).</p>
        <div className="sunday-rotation-list">
          {filteredEmployees.map(employee => {
            let workedSundaysCount = 0;
            sundays.forEach(sunDate => {
              const works = shifts.some(
                s =>
                  s.employee_id === employee.id &&
                  s.date === sunDate &&
                  !((s.start_time === '00:00' && s.end_time === '00:00') || !s.start_time)
              );
              if (works) {
                workedSundaysCount++;
              }
            });

            const totalSundays = sundays.length;
            const freeSundays = totalSundays - workedSundaysCount;

            return (
              <div key={employee.id} className="sunday-worker-row">
                <div className="sunday-worker-name">
                  {employee.name}
                </div>
                <div
                  className="sunday-counter-badge"
                  title={`${freeSundays} Domingo(s) de folga no mês`}
                >
                  {freeSundays}/{totalSundays} folga
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </aside>
  );
};
