'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Store, Employee, Shift, ScheduleAlert } from '../lib/types';
import {
  getStores,
  getEmployees,
  getShifts,
  saveShift,
  deleteShift,
  updateShiftsBatch,
  saveEmployee,
  deleteEmployee,
  saveStore,
  deleteStore,
  subscribeToRealtime,
} from '../lib/dataService';
import { isDemoMode } from '../lib/supabaseClient';
import { runMonthlyValidations, getMonday, getMonthlyWeeks, getUniqueShifts } from '../lib/validation';
import { AlertsPanel } from '../components/AlertsPanel';
import { SidebarTracker } from '../components/SidebarTracker';
import { ScheduleMatrix } from '../components/ScheduleMatrix';
import { ShiftModal } from '../components/ShiftModal';
import { EmployeeModal } from '../components/EmployeeModal';
import { WhatsAppModal } from '../components/WhatsAppModal';
import { StoreModal } from '../components/StoreModal';
import { AISchedulerModal } from '../components/AISchedulerModal';
import { generateAISchedule } from '../lib/aiScheduler';

export default function DashboardPage() {
  // --- Core States ---
  const [stores, setStores] = useState<Store[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  
  const [currentMonthStart, setCurrentMonthStart] = useState<Date>(() => {
    // Standardize default active month to July 1st, 2026
    return new Date('2026-07-01T12:00:00');
  });

  const [activeStoreFilter, setActiveStoreFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [alerts, setAlerts] = useState<ScheduleAlert[]>([]);
  const [alertsMinimized, setAlertsMinimized] = useState<boolean>(false);

  const [franchiseName, setFranchiseName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('escala_varejo_franchise_name') || '';
    }
    return '';
  });

  const handleChangeFranchiseName = () => {
    const newName = prompt('Digite o nome da franquia ou empresa:', franchiseName);
    if (newName !== null) {
      const trimmed = newName.trim();
      setFranchiseName(trimmed);
      if (typeof window !== 'undefined') {
        localStorage.setItem('escala_varejo_franchise_name', trimmed);
      }
    }
  };

  // --- Track whether the user has modified anything in the current schedule ---
  const [userHasChanged, setUserHasChanged] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('varejo_user_has_changed') === 'true';
    }
    return false;
  });

  const markChanged = () => {
    setUserHasChanged(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('varejo_user_has_changed', 'true');
    }
  };

  const resetChanged = () => {
    setUserHasChanged(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('varejo_user_has_changed');
    }
  };

  // --- Modal Visibility Toggles ---
  const [isShiftModalOpen, setIsShiftModalOpen] = useState<boolean>(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState<boolean>(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState<boolean>(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState<boolean>(false);
  const [isAISchedulerOpen, setIsAISchedulerOpen] = useState<boolean>(false);

  // --- Modal Selected Variables ---
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [selectedShift, setSelectedShift] = useState<Shift | undefined>(undefined);

  // --- Data Loading Functions ---
  const loadData = useCallback(async () => {
    try {
      const loadedStores = await getStores();
      const loadedEmployees = await getEmployees();
      const loadedShifts = await getShifts();

      setStores(loadedStores);
      setEmployees(loadedEmployees);
      setShifts(loadedShifts);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on mount & subscribe to realtime Supabase broadcasts
  useEffect(() => {
    loadData();

    const subscription = subscribeToRealtime(() => {
      loadData();
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [loadData]);

  // Derived Month Info
  const activeYear = currentMonthStart.getFullYear();
  const activeMonthIndex = currentMonthStart.getMonth();
  const monthlyWeeks = getMonthlyWeeks(activeYear, activeMonthIndex);
  const monthDates = monthlyWeeks.flat().filter((d): d is string => d !== null);

  // Recalculate validation alerts when shifts, employees or month changes
  useEffect(() => {
    if (stores.length > 0) {
      const activeAlerts = runMonthlyValidations(stores, employees, shifts, activeYear, activeMonthIndex);
      setAlerts(activeAlerts);
    }
  }, [stores, employees, shifts, activeYear, activeMonthIndex]);

  // --- Modal Form Actions ---
  const handleSaveShift = async (shift: Omit<Shift, 'id'> & { id?: string }) => {
    try {
      await saveShift(shift);
      markChanged();
      await loadData();
    } catch (err) {
      alert('Erro ao salvar turno: ' + err);
    }
  };

  const handleDeleteShift = async (id: string) => {
    try {
      await deleteShift(id);
      markChanged();
      await loadData();
    } catch (err) {
      alert('Erro ao excluir turno: ' + err);
    }
  };

  const handleSaveEmployee = async (employee: Omit<Employee, 'id'> & { id?: string }) => {
    try {
      await saveEmployee(employee);
      await loadData();
    } catch (err) {
      alert('Erro ao salvar funcionário: ' + err);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (confirm('Deseja realmente excluir este funcionário e remover todos os seus turnos escalados?')) {
      try {
        await deleteEmployee(id);
        markChanged();
        await loadData();
        return true;
      } catch (err) {
        alert('Erro ao excluir funcionário: ' + err);
        return false;
      }
    }
    return false;
  };

  const handleSaveStore = async (store: Omit<Store, 'id'> & { id?: string }) => {
    try {
      await saveStore(store);
      await loadData();
    } catch (err) {
      alert('Erro ao salvar loja: ' + err);
    }
  };

  const handleDeleteStore = async (id: string) => {
    if (confirm('Atenção: Excluir esta loja apagará permanentemente todos os turnos e dados vinculados a ela! Deseja continuar?')) {
      try {
        await deleteStore(id);
        markChanged();
        await loadData();
      } catch (err) {
        alert('Erro ao excluir loja: ' + err);
        setLoading(false);
      }
    }
  };

  // Generate AI Schedule handler for calendar months
  const handleGenerateAISchedule = async (storeId: string, period: 'week' | 'month' = 'week') => {
    try {
      const targetYear = period === 'month'
        ? (activeMonthIndex === 11 ? activeYear + 1 : activeYear)
        : activeYear;
      const targetMonth = period === 'month'
        ? (activeMonthIndex === 11 ? 0 : activeMonthIndex + 1)
        : activeMonthIndex;

      // Find all weeks in the target calendar month (weeks may include prev-month days)
      const targetWeeks = getMonthlyWeeks(targetYear, targetMonth);
      const allOptimizedShifts: Omit<Shift, 'id'>[] = [];

      const targetMonthStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}`;

      const processedMondays = new Set<string>();
      targetWeeks.forEach(week => {
        // Use the first non-null date (could be from prev month for the first week)
        const firstDate = week.find(d => d !== null);
        if (!firstDate) return;

        const monday = getMonday(new Date(firstDate + 'T12:00:00'));
        const mondayStr = monday.toISOString().split('T')[0];

        if (processedMondays.has(mondayStr)) return;
        processedMondays.add(mondayStr);

        // Filter out old shifts of target store employees for dates in target weeks,
        // so that generating multiple times does not let stale shifts override newly generated ones.
        const storeEmployeeIds = employees
          .filter(e => e.home_store_id === storeId)
          .map(e => e.id);
        const allGridDates = targetWeeks.flat().filter((d): d is string => d !== null);
        const nonDiscardedShifts = shifts.filter(s => {
          const isStoreShift = s.store_id === storeId || storeEmployeeIds.includes(s.employee_id);
          const isInGrid = allGridDates.includes(s.date);
          return !(isStoreShift && isInGrid);
        });

        const accumulatedShifts = [
          ...nonDiscardedShifts,
          ...allOptimizedShifts.map((s, idx) => ({ ...s, id: `temp-${idx}` }))
        ];

        const weekShifts = generateAISchedule(storeId, employees, monday, accumulatedShifts);
        
        // Keep ALL 7 days of the first transition week (includes June 29/30 for July)
        // Only for subsequent weeks, filter to the target month
        const isFirstWeek = processedMondays.size === 1;
        if (isFirstWeek) {
          // Include all days in this week: the transition week shows prev-month context
          allOptimizedShifts.push(...weekShifts);
        } else {
          // Filter: only keep shifts within the target calendar month
          const monthShifts = weekShifts.filter(s => s.date.startsWith(targetMonthStr));
          allOptimizedShifts.push(...monthShifts);
        }
      });

      // Delete ALL existing shifts for employees of this store in the target month
      // Also delete the pre-month transition days (e.g. Jun 29/30) for this store
      const storeEmployeeIds = employees
        .filter(e => e.home_store_id === storeId)
        .map(e => e.id);
      
      // Compute all dates in the grid for deletion scope
      const allGridDates = targetWeeks.flat().filter((d): d is string => d !== null);
      
      const shiftsToDelete = shifts.filter(s => {
        const isStoreShift = s.store_id === storeId || storeEmployeeIds.includes(s.employee_id);
        const isInGrid = allGridDates.includes(s.date);
        return isStoreShift && isInGrid;
      });
      
      const toDeleteIds = shiftsToDelete.map(s => s.id);
      
      // Batch update: delete old ones and insert new ones in one single operation
      await updateShiftsBatch(toDeleteIds, allOptimizedShifts);
      
      markChanged();
      await loadData();
    } catch (err) {
      console.error('Erro ao gerar escala IA:', err);
      throw err;
    }
  };

  const handleDragAndDropShift = async (
    sourceEmployeeId: string,
    sourceDate: string,
    targetEmployeeId: string,
    targetDate: string
  ) => {
    // Same-week restriction check
    const week = monthlyWeeks.find(w => w.includes(sourceDate) && w.includes(targetDate));
    if (!week) {
      alert("Movimento não permitido: As trocas de turno são restritas à mesma semana!");
      return;
    }

    try {
      const uniqueShifts = getUniqueShifts(shifts);
      const sourceShift = uniqueShifts.find(
        s => s.employee_id === sourceEmployeeId && s.date === sourceDate
      );
      const targetShift = uniqueShifts.find(
        s => s.employee_id === targetEmployeeId && s.date === targetDate
      );

      if (!sourceShift && !targetShift) return;

      const shiftsToInsert: Omit<Shift, 'id'>[] = [];
      const shiftIdsToDelete: string[] = [];
      const isActive = (s?: Shift) => s && !((s.start_time === '00:00' && s.end_time === '00:00') || !s.start_time);

      if (sourceEmployeeId === targetEmployeeId) {
        if (sourceShift) shiftIdsToDelete.push(sourceShift.id);
        if (targetShift) shiftIdsToDelete.push(targetShift.id);

        if (isActive(sourceShift)) {
          shiftsToInsert.push({
            employee_id: sourceEmployeeId,
            store_id: sourceShift!.store_id,
            date: targetDate,
            start_time: sourceShift!.start_time,
            end_time: sourceShift!.end_time,
            break_duration_minutes: sourceShift!.break_duration_minutes,
            allow_overtime: sourceShift!.allow_overtime
          });
        } else {
          shiftsToInsert.push({
            employee_id: sourceEmployeeId,
            store_id: sourceShift ? sourceShift.store_id : (targetShift ? targetShift.store_id : ''),
            date: targetDate,
            start_time: '00:00',
            end_time: '00:00',
            break_duration_minutes: 0,
            allow_overtime: false
          });
        }

        if (isActive(targetShift)) {
          shiftsToInsert.push({
            employee_id: sourceEmployeeId,
            store_id: targetShift!.store_id,
            date: sourceDate,
            start_time: targetShift!.start_time,
            end_time: targetShift!.end_time,
            break_duration_minutes: targetShift!.break_duration_minutes,
            allow_overtime: targetShift!.allow_overtime
          });
        } else {
          shiftsToInsert.push({
            employee_id: sourceEmployeeId,
            store_id: targetShift ? targetShift.store_id : (sourceShift ? sourceShift.store_id : ''),
            date: sourceDate,
            start_time: '00:00',
            end_time: '00:00',
            break_duration_minutes: 0,
            allow_overtime: false
          });
        }
      } else {
        if (sourceShift) shiftIdsToDelete.push(sourceShift.id);
        if (targetShift) shiftIdsToDelete.push(targetShift.id);

        if (isActive(sourceShift)) {
          shiftsToInsert.push({
            employee_id: targetEmployeeId,
            store_id: sourceShift!.store_id,
            date: targetDate,
            start_time: sourceShift!.start_time,
            end_time: sourceShift!.end_time,
            break_duration_minutes: sourceShift!.break_duration_minutes,
            allow_overtime: sourceShift!.allow_overtime
          });
        } else {
          shiftsToInsert.push({
            employee_id: targetEmployeeId,
            store_id: sourceShift ? sourceShift.store_id : (targetShift ? targetShift.store_id : ''),
            date: targetDate,
            start_time: '00:00',
            end_time: '00:00',
            break_duration_minutes: 0,
            allow_overtime: false
          });
        }

        if (isActive(targetShift)) {
          shiftsToInsert.push({
            employee_id: sourceEmployeeId,
            store_id: targetShift!.store_id,
            date: sourceDate,
            start_time: targetShift!.start_time,
            end_time: targetShift!.end_time,
            break_duration_minutes: targetShift!.break_duration_minutes,
            allow_overtime: targetShift!.allow_overtime
          });
        } else {
          shiftsToInsert.push({
            employee_id: sourceEmployeeId,
            store_id: targetShift ? targetShift.store_id : (sourceShift ? sourceShift.store_id : ''),
            date: sourceDate,
            start_time: '00:00',
            end_time: '00:00',
            break_duration_minutes: 0,
            allow_overtime: false
          });
        }
      }

      await updateShiftsBatch(shiftIdsToDelete, shiftsToInsert);
      markChanged();
      await loadData();
    } catch (err) {
      console.error("Erro ao arrastar e soltar turno:", err);
      alert("Erro ao salvar a movimentação: " + err);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonthStart(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonthStart(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };



  // Open shift modal
  const handleCellClick = (employeeId: string, date: string, storeId: string, shift?: Shift) => {
    setSelectedEmployeeId(employeeId);
    setSelectedDate(date);
    setSelectedStoreId(storeId);
    setSelectedShift(shift);
    setIsShiftModalOpen(true);
  };

  // Format month name in Portuguese (e.g. "Julho de 2026")
  const monthLabel = currentMonthStart.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="app-container">
      {/* 1. Supabase Demo Mode warning banner */}
      {isDemoMode && (
        <div className="demo-banner">
          <span>⚙️ <strong>Modo Demo (Local):</strong> Dados persistidos no navegador. Configure o <code>.env.local</code> para habilitar o Supabase.</span>
        </div>
      )}

      {/* 2. Top Header Navigation */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-logo">{franchiseName ? franchiseName.charAt(0).toUpperCase() : 'V'}</div>
          <div className="brand-text">
            <h1>Escala Varejo</h1>
            <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{franchiseName ? `Unidades ${franchiseName}` : 'Gestão e Conformidade CLT'}</span>
              <button 
                type="button"
                onClick={handleChangeFranchiseName} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontSize: '0.85rem', 
                  padding: '2px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  opacity: 0.7
                }}
                title="Editar Nome da Franquia"
              >
                ✏️
              </button>
            </p>
          </div>
        </div>

        {/* Month Selector */}
        <div className="week-selector-container">
          <button
            type="button"
            className="btn-icon"
            onClick={handlePrevMonth}
            title="Mês Anterior"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div className="week-display" style={{ textTransform: 'capitalize' }}>
            <span>
              {monthLabel}
            </span>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={handleNextMonth}
            title="Próximo Mês"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Global Action Bar */}
        <div className="header-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsAISchedulerOpen(true)}
            style={{
              background: 'linear-gradient(135deg, var(--color-gold), #d4af37)',
              border: 'none',
              boxShadow: '0 2px 8px rgba(176, 141, 71, 0.15)'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '4px' }}>
              <path d="m12 3-1.912 5.886L4.202 9l5.886 1.912L12 16.798l1.912-5.886L19.798 9l-5.886-1.912Z" />
              <path d="M5 3v4" />
              <path d="M3 5h4" />
              <path d="M19 17v4" />
              <path d="M17 19h4" />
            </svg>
            <span>Gerar Escala (IA)</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsStoreModalOpen(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Lojas</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsEmployeeModalOpen(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Funcionários</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsWhatsAppModalOpen(true)}
            style={{ color: 'var(--color-success)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
            <span>WhatsApp</span>
          </button>


        </div>
      </header>

      {/* 3. Main Board Grid Workspace */}
      {loading && (
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ border: '3px solid var(--border-color)', borderTop: '3px solid var(--color-gold)', borderRadius: '50%', width: '36px', height: '36px', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
            <p>Carregando escala...</p>
            <style>{`
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
          </div>
        </div>
      )}

      {!loading && (
        <div className="app-workspace">
          {/* Left Side: Dynamic trackers */}
          <SidebarTracker
            stores={stores}
            employees={employees}
            shifts={shifts}
            currentMonthStart={currentMonthStart}
            activeStoreFilter={activeStoreFilter}
            onStoreFilterChange={setActiveStoreFilter}
            activeAlerts={alerts}
            monthDates={monthDates}
            showWarnings={userHasChanged}
          />

          {/* Right Side: Log console and matrix */}
          <main className="workspace-main">
            <AlertsPanel
              alerts={alerts}
              minimized={alertsMinimized}
              onToggleMinimize={() => setAlertsMinimized(!alertsMinimized)}
              showWarnings={userHasChanged}
            />

            <ScheduleMatrix
              stores={stores}
              employees={employees}
              shifts={shifts}
              monthlyWeeks={monthlyWeeks}
              activeStoreFilter={activeStoreFilter}
              activeAlerts={alerts}
              onCellClick={handleCellClick}
              showWarnings={userHasChanged}
              onDragAndDropShift={handleDragAndDropShift}
            />
          </main>
        </div>
      )}

      {/* 4. Modals */}
      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        onSave={handleSaveShift}
        onDelete={handleDeleteShift}
        stores={stores}
        employees={employees}
        selectedEmployeeId={selectedEmployeeId}
        selectedDate={selectedDate}
        selectedStoreId={selectedStoreId}
        selectedShift={selectedShift}
      />

      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onSave={handleSaveEmployee}
        onDelete={handleDeleteEmployee}
        stores={stores}
        employees={employees}
      />

      <WhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        stores={stores}
        employees={employees}
        shifts={shifts}
        monthlyWeeks={monthlyWeeks}
        activeYear={activeYear}
        activeMonthIndex={activeMonthIndex}
      />

      <StoreModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        onSave={handleSaveStore}
        onDelete={handleDeleteStore}
        stores={stores}
      />

      <AISchedulerModal
        isOpen={isAISchedulerOpen}
        onClose={() => setIsAISchedulerOpen(false)}
        stores={stores}
        employees={employees}
        currentMonthStart={currentMonthStart}
        activeStoreFilter={activeStoreFilter}
        onGenerate={handleGenerateAISchedule}
      />
    </div>
  );
}
