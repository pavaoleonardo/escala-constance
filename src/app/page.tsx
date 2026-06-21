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
  resetToMockData,
  subscribeToRealtime,
} from '../lib/dataService';
import { isDemoMode } from '../lib/supabaseClient';
import { runAllValidations, getMonday, getActiveWeekDates } from '../lib/validation';
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
  
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    // Standardize default active week to June 29, 2026 (contains July 1st)
    return getMonday(new Date('2026-06-29T12:00:00'));
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

    // Subscribe to supabase database edits (only runs if keys are present)
    const subscription = subscribeToRealtime(() => {
      loadData();
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [loadData]);

  // Recalculate validation alerts when shifts, employees or current date changes
  useEffect(() => {
    if (stores.length > 0) {
      const activeAlerts = runAllValidations(stores, employees, shifts, currentWeekStart);
      setAlerts(activeAlerts);
    }
  }, [stores, employees, shifts, currentWeekStart]);

  // --- Action Handlers ---

  const handlePrevWeek = () => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 7);
      return newDate;
    });
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 7);
      return newDate;
    });
  };

  const handleResetData = async () => {
    if (
      confirm(
        'Deseja redefinir os dados para o padrão de demonstração? Isso apagará todas as modificações atuais.'
      )
    ) {
      setLoading(true);
      await resetToMockData();
      resetChanged();
      await loadData();
    }
  };

  // Open shift modal
  const handleCellClick = (employeeId: string, date: string, shift?: Shift) => {
    setSelectedEmployeeId(employeeId);
    setSelectedDate(date);
    setSelectedShift(shift);
    setIsShiftModalOpen(true);
  };

  // Save shift handler
  const handleSaveShift = async (shiftData: Omit<Shift, 'id'> & { id?: string }) => {
    setLoading(true);
    try {
      await saveShift(shiftData);
      markChanged();
      await loadData();
      setIsShiftModalOpen(false);
    } catch (err) {
      alert('Erro ao salvar turno: ' + err);
      setLoading(false);
    }
  };

  // Delete shift handler
  const handleDeleteShift = async (id: string) => {
    setLoading(true);
    try {
      await deleteShift(id);
      markChanged();
      await loadData();
      setIsShiftModalOpen(false);
    } catch (err) {
      alert('Erro ao excluir turno: ' + err);
      setLoading(false);
    }
  };

  // Save employee handler
  const handleSaveEmployee = async (employeeData: Omit<Employee, 'id'> & { id?: string }) => {
    setLoading(true);
    try {
      await saveEmployee(employeeData);
      markChanged();
      await loadData();
    } catch (err) {
      alert('Erro ao salvar funcionário: ' + err);
      setLoading(false);
    }
  };

  // Delete employee handler
  const handleDeleteEmployee = async (id: string): Promise<boolean> => {
    if (!confirm('Deseja realmente excluir este funcionário? Os turnos associados também serão removidos.')) return false;
    setLoading(true);
    try {
      await deleteEmployee(id);
      markChanged();
      await loadData();
      return true;
    } catch (err) {
      alert('Erro ao excluir funcionário: ' + err);
      setLoading(false);
      return false;
    }
  };

  // Save store handler
  const handleSaveStore = async (storeData: Omit<Store, 'id'> & { id?: string }) => {
    setLoading(true);
    try {
      await saveStore(storeData);
      markChanged();
      await loadData();
    } catch (err) {
      alert('Erro ao salvar loja: ' + err);
      setLoading(false);
    }
  };

  // Delete store handler
  const handleDeleteStore = async (id: string) => {
    setLoading(true);
    try {
      await deleteStore(id);
      markChanged();
      await loadData();
    } catch (err) {
      alert('Erro ao excluir loja: ' + err);
      setLoading(false);
    }
  };

  // Generate AI Schedule handler
  const handleGenerateAISchedule = async (storeId: string, period: 'week' | 'month' = 'week') => {
    try {
      const numWeeks = period === 'month' ? 4 : 1;
      const allOptimizedShifts: Omit<Shift, 'id'>[] = [];
      const allWeekDates: string[] = [];

      for (let i = 0; i < numWeeks; i++) {
        const targetWeekStart = new Date(currentWeekStart);
        targetWeekStart.setDate(currentWeekStart.getDate() + i * 7);
        
        const weekShifts = generateAISchedule(storeId, employees, targetWeekStart);
        allOptimizedShifts.push(...weekShifts);
        
        const weekDates = getActiveWeekDates(targetWeekStart);
        allWeekDates.push(...weekDates);
      }

      // Delete ALL existing shifts for employees of this store in all planned weeks
      const storeEmployeeIds = employees
        .filter(e => e.home_store_id === storeId)
        .map(e => e.id);
      
      const shiftsToDelete = shifts.filter(
        s => allWeekDates.includes(s.date) && (
          s.store_id === storeId || storeEmployeeIds.includes(s.employee_id)
        )
      );
      
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

  // Dates array for active week headers
  const weekDates = getActiveWeekDates(currentWeekStart);
  const startLabel = weekDates[0] ? weekDates[0].split('-').reverse().slice(0, 2).join('/') : '';
  const endLabel = weekDates[6] ? weekDates[6].split('-').reverse().slice(0, 2).join('/') : '';

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

        {/* Week Selector */}
        <div className="week-selector-container">
          <button
            type="button"
            className="btn-icon"
            onClick={handlePrevWeek}
            title="Semana Anterior"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div className="week-display">
            <span>
              Período: {startLabel} a {endLabel}
            </span>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={handleNextWeek}
            title="Próxima Semana"
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

          <button
            type="button"
            className="btn btn-danger-outline"
            onClick={handleResetData}
            title="Redefinir para dados de demonstração padrão"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
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
            currentWeekStart={currentWeekStart}
            activeStoreFilter={activeStoreFilter}
            onStoreFilterChange={setActiveStoreFilter}
            activeAlerts={alerts}
            weekDates={weekDates}
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
              weekDates={weekDates}
              activeStoreFilter={activeStoreFilter}
              activeAlerts={alerts}
              onCellClick={handleCellClick}
              showWarnings={userHasChanged}
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
        weekDates={weekDates}
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
        currentWeekStart={currentWeekStart}
        activeStoreFilter={activeStoreFilter}
        onGenerate={handleGenerateAISchedule}
      />
    </div>
  );
}
