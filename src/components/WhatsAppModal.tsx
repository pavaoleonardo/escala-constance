import React, { useState, useEffect } from 'react';
import { Store, Employee, Shift } from '../lib/types';
import { DAY_NAMES_PT, formatToDayMonth, getUniqueShifts } from '../lib/validation';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  stores: Store[];
  employees: Employee[];
  shifts: Shift[];
  weekDates: string[];
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  stores,
  employees,
  shifts,
  weekDates,
}) => {
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [exportText, setExportText] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Set default store when modal opens
  useEffect(() => {
    if (isOpen && stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(stores[0].id);
    }
  }, [isOpen, stores, selectedStoreId]);

  // Generate the formatted WhatsApp copy-paste text
  useEffect(() => {
    const store = stores.find(s => s.id === selectedStoreId);
    if (!store || weekDates.length < 7) return;

    const startDayFormatted = formatToDayMonth(weekDates[0]);
    const endDayFormatted = formatToDayMonth(weekDates[6]);
    const franchiseName = (typeof window !== 'undefined' ? localStorage.getItem('escala_varejo_franchise_name') : null) || 'Constance';
    let text = `🗓️ ESCALA ${franchiseName.toUpperCase()} - ${store.name.toUpperCase()}\n`;
    text += `Período: ${startDayFormatted} a ${endDayFormatted}\n\n`;

    const homeEmployees = employees.filter(emp => emp.active && emp.home_store_id === selectedStoreId);

    const uniqueShifts = getUniqueShifts(shifts);

    weekDates.forEach((date, idx) => {
      text += `${DAY_NAMES_PT[idx]} (${formatToDayMonth(date)}):\n`;

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
  }, [selectedStoreId, stores, employees, shifts, weekDates]);

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
            <span className="input-tip">
              A exportação gerará a escala correspondente a esta loja, listando os horários do dia e folgas dos funcionários fixos.
            </span>
          </div>

          <div className="form-group">
            <label>Visualização do Texto</label>
            <textarea
              className="whatsapp-preview-area"
              value={exportText}
              readOnly
              rows={12}
            />
          </div>

          <div className="modal-footer">
            {copySuccess && (
              <span className="copy-success-message">Copiado para a área de transferência! 👍</span>
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
