import React from 'react';
import { Store, Employee, Shift, ScheduleAlert } from '../lib/types';
import { formatDateString, getShiftDuration, getUniqueShifts } from '../lib/validation';

interface SidebarTrackerProps {
  stores: Store[];
  employees: Employee[];
  shifts: Shift[];
  currentMonthStart: Date;
  activeStoreFilter: string;
  onStoreFilterChange: (id: string) => void;
  activeAlerts: ScheduleAlert[];
  monthDates: string[]; // Flat dates of the active month
  showWarnings: boolean;
}

export const SidebarTracker: React.FC<SidebarTrackerProps> = ({
  stores,
  employees,
  shifts,
  currentMonthStart,
  activeStoreFilter,
  onStoreFilterChange,
  activeAlerts,
  monthDates,
  showWarnings,
}) => {
  const activeMonthStr = currentMonthStart.toLocaleString('pt-BR', { month: 'long' });
  const activeMonthIndex = currentMonthStart.getMonth();
  const activeYear = currentMonthStart.getFullYear();

  // Calculate Sundays in this calendar month
  const sundays: string[] = [];
  const tempDate = new Date(activeYear, activeMonthIndex, 1);
  while (tempDate.getMonth() === activeMonthIndex) {
    if (tempDate.getDay() === 0) {
      sundays.push(formatDateString(tempDate));
    }
    tempDate.setDate(tempDate.getDate() + 1);
  }

  const filteredEmployees = employees.filter(
    emp => emp.active && (activeStoreFilter === 'all' || emp.home_store_id === activeStoreFilter)
  );

  const uniqueShifts = getUniqueShifts(shifts);

  // Calculate total monthly hours worked by each employee in the active month
  const monthlyHoursData = filteredEmployees.map(employee => {
    let totalHours = 0;
    uniqueShifts
      .filter(s => s.employee_id === employee.id && s.store_id === employee.home_store_id && monthDates.includes(s.date))
      .forEach(s => {
        const isFolga = (s.start_time === '00:00' && s.end_time === '00:00') || !s.start_time;
        if (!isFolga) {
          totalHours += getShiftDuration(s.start_time, s.end_time, s.break_duration_minutes);
        }
      });

    return {
      employeeId: employee.id,
      employeeName: employee.name,
      totalHours
    };
  });

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

      {/* 2. Monthly Hours Summary */}
      <section className="sidebar-section card">
        <h3>Horas do Mês</h3>
        <p className="section-desc">Total de horas trabalhadas no mês ativo.</p>
        <div className="overtime-list">
          {monthlyHoursData.map(info => (
            <div key={info.employeeId} className="overtime-row">
              <div className="overtime-name">{info.employeeName}</div>
              <div className="overtime-hours">
                <span className="hours-regular" style={{ fontWeight: '600', color: 'var(--color-gold-text)' }}>
                  {info.totalHours.toFixed(0)}h
                </span>
              </div>
            </div>
          ))}
          {monthlyHoursData.length === 0 && (
            <p className="section-desc" style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              Nenhum funcionário ativo.
            </p>
          )}
        </div>
      </section>

      {/* 3. Sunday Rotation */}
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
