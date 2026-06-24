import React, { useState, useEffect } from 'react';
import { Store, Employee, Shift } from '../lib/types';
import { formatToDayMonth, getUniqueShifts } from '../lib/validation';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  stores: Store[];
  employees: Employee[];
  shifts: Shift[];
  monthlyWeeks: (string | null)[][];
  activeYear: number;
  activeMonthIndex: number;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  stores,
  employees,
  shifts,
  monthlyWeeks,
  activeYear,
  activeMonthIndex,
}) => {
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [selectedWeekIdx, setSelectedWeekIdx] = useState<number>(0);
  const [exportText, setExportText] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Set default store and week when modal opens
  useEffect(() => {
    if (isOpen && stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(stores[0].id);
    }
    if (isOpen) {
      setSelectedWeekIdx(0);
    }
  }, [isOpen, stores, selectedStoreId]);

  const getWeekOptionLabel = (week: (string | null)[], idx: number) => {
    const dates = week.filter((d): d is string => {
      if (!d) return false;
      const parts = d.split('-');
      const y = parseInt(parts[0]);
      const m = parseInt(parts[1]) - 1;
      return y === activeYear && m === activeMonthIndex;
    });
    if (dates.length === 0) return `Semana ${idx + 1}`;
    const start = formatToDayMonth(dates[0]);
    const end = formatToDayMonth(dates[dates.length - 1]);
    return `Semana ${idx + 1} (${start} a ${end})`;
  };

  // Generate the formatted WhatsApp copy-paste text
  useEffect(() => {
    const store = stores.find(s => s.id === selectedStoreId);
    const week = monthlyWeeks[selectedWeekIdx];
    if (!store || !week) return;

    // Filter week dates to only include those in the active month
    const activeMonthDates = week.filter((d): d is string => {
      if (!d) return false;
      const parts = d.split('-');
      const y = parseInt(parts[0]);
      const m = parseInt(parts[1]) - 1;
      return y === activeYear && m === activeMonthIndex;
    });

    if (activeMonthDates.length === 0) return;

    const startDayFormatted = formatToDayMonth(activeMonthDates[0]);
    const endDayFormatted = formatToDayMonth(activeMonthDates[activeMonthDates.length - 1]);
    const franchiseName = (typeof window !== 'undefined' ? localStorage.getItem('escala_varejo_franchise_name') : null) || 'Varejo';
    let text = `🗓️ ESCALA ${franchiseName.toUpperCase()} - ${store.name.toUpperCase()}\n`;
    text += `Período: ${startDayFormatted} a ${endDayFormatted}\n\n`;

    const homeEmployees = employees.filter(emp => emp.active && emp.home_store_id === selectedStoreId);
    const uniqueShifts = getUniqueShifts(shifts);
    const DAY_NAMES_SEG_DOM = ['Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado', 'Domingo'];

    week.forEach((date, idx) => {
      if (!date) return; // Skip padding days outside the month

      // Check if date belongs to active month
      const parts = date.split('-');
      const y = parseInt(parts[0]);
      const m = parseInt(parts[1]) - 1;
      if (y !== activeYear || m !== activeMonthIndex) return; // Skip days from other months

      text += `${DAY_NAMES_SEG_DOM[idx]} (${formatToDayMonth(date)}):\n`;

      // Active shifts scheduled at this store on this day
      const storeShifts = uniqueShifts.filter(
        s =>
          s.store_id === selectedStoreId &&
          s.date === date &&
          !((s.start_time === '00:00' && s.end_time === '00:00') || !s.start_time)
      );

      if (storeShifts.length === 0) {
        text += `- Loja Fechada ou Sem Escala\n`;
      } else {
        storeShifts.forEach(shift => {
          const emp = employees.find(e => e.id === shift.employee_id);
          if (emp) {
            text += `- ${emp.name} (${emp.role}): ${shift.start_time} - ${shift.end_time}\n`;
          }
        });
      }

      // Calculate folgas
      const folgas: string[] = [];
      homeEmployees.forEach(emp => {
        const empShiftsOnDay = uniqueShifts.filter(s => s.employee_id === emp.id && s.date === date);

        if (empShiftsOnDay.length === 0) {
          folgas.push(emp.name);
        } else {
          const isExplicitFolga = empShiftsOnDay.every(
            s => (s.start_time === '00:00' && s.end_time === '00:00') || !s.start_time
          );

          if (isExplicitFolga) {
            folgas.push(emp.name);
          }
        }
      });

      if (folgas.length > 0) {
        text += `Folgas: ${folgas.join(', ')}\n`;
      }

      text += `\n`;
    });

    setExportText(text);
  }, [selectedStoreId, selectedWeekIdx, stores, employees, shifts, monthlyWeeks, activeYear, activeMonthIndex]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(exportText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  return (
    <div className="modal-backdrop active">
      <div className="modal-content card">
        <div className="modal-header">
          <h2>Exportar Escala para WhatsApp</h2>
          <button className="modal-close" onClick={onClose} type="button">
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="export-store">Selecione a Loja para Exportação</label>
            <select
              id="export-store"
              value={selectedStoreId}
              onChange={e => setSelectedStoreId(e.target.value)}
              required
            >
              {stores.map(st => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="export-week">Selecione a Semana</label>
            <select
              id="export-week"
              value={selectedWeekIdx}
              onChange={e => setSelectedWeekIdx(parseInt(e.target.value) || 0)}
              required
            >
              {monthlyWeeks.map((week, idx) => (
                <option key={idx} value={idx}>
                  {getWeekOptionLabel(week, idx)}
                </option>
              ))}
            </select>
            <span className="input-tip">
              Escolha qual semana da escala mensal você deseja exportar para o grupo da loja.
            </span>
          </div>

          <div className="form-group">
            <label>Visualização do Texto</label>
            <textarea
              className="whatsapp-preview-area"
              value={exportText}
              readOnly
              rows={12}
              style={{ width: '100%', fontFamily: 'monospace', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', resize: 'vertical' }}
            />
          </div>

          <div className="modal-footer">
            {copySuccess && (
              <span className="copy-success-message" style={{ color: 'var(--color-success)', marginRight: 'auto', fontSize: '0.85rem' }}>Copiado para a área de transferência! 👍</span>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Fechar
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleCopy}>
              Copiar Texto
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={() => {
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(exportText)}`, '_blank');
              }}
              style={{
                backgroundColor: '#25D366',
                color: 'white',
                borderColor: '#25D366',
                boxShadow: '0 2px 8px rgba(37, 211, 102, 0.2)'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
              <span>Enviar no WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
