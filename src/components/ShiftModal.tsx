import React, { useState, useEffect } from 'react';
import { Store, Employee, Shift } from '../lib/types';
import { getShiftDuration, getShiftElapsed, formatToFullDate, DAY_NAMES_PT } from '../lib/validation';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shift: Omit<Shift, 'id'> & { id?: string }) => void;
  onDelete: (id: string) => void;
  stores: Store[];
  employees: Employee[];
  selectedEmployeeId: string;
  selectedDate: string;
  selectedShift?: Shift;
}

export const ShiftModal: React.FC<ShiftModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  stores,
  employees,
  selectedEmployeeId,
  selectedDate,
  selectedShift,
}) => {
  const [shiftType, setShiftType] = useState<string>('abertura');
  const [storeId, setStoreId] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('10:00');
  const [endTime, setEndTime] = useState<string>('18:00');
  const [breakDuration, setBreakDuration] = useState<number>(60);
  const [allowOvertime, setAllowOvertime] = useState<boolean>(false);
  const [warningMsg, setWarningMsg] = useState<string>('');

  const employee = employees.find(e => e.id === selectedEmployeeId);

  // Initialize form when opening/changing selection
  useEffect(() => {
    if (!isOpen) return;

    if (selectedShift) {
      setStoreId(selectedShift.store_id);
      setAllowOvertime(!!selectedShift.allow_overtime);

      const start = selectedShift.start_time;
      const end = selectedShift.end_time;
      const bMin = selectedShift.break_duration_minutes;

      const isFolgaVal = (start === '00:00' && end === '00:00') || !start;

      if (isFolgaVal) {
        setShiftType('folga');
      } else if (start === '10:00' && end === '18:00' && bMin === 60) {
        setShiftType('abertura');
      } else if (start === '12:00' && end === '20:00' && bMin === 60) {
        setShiftType('intermediario');
      } else if (start === '14:00' && end === '22:00' && bMin === 60) {
        setShiftType('fechamento');
      } else {
        setShiftType('personalizado');
        setStartTime(start);
        setEndTime(end);
        setBreakDuration(bMin);
      }
    } else {
      // New Shift defaults
      setShiftType('abertura');
      setAllowOvertime(false);
      setStartTime('10:00');
      setEndTime('18:00');
      setBreakDuration(60);
      if (employee) {
        setStoreId(employee.home_store_id);
      } else if (stores.length > 0) {
        setStoreId(stores[0].id);
      }
    }
  }, [isOpen, selectedShift, selectedEmployeeId, employee, stores]);

  // Compute live warnings in modal
  useEffect(() => {
    if (shiftType === 'folga') {
      setWarningMsg('');
      return;
    }

    let start = '10:00';
    let end = '18:00';
    let bMin = 60;

    if (shiftType === 'abertura') {
      start = '10:00'; end = '18:00'; bMin = 60;
    } else if (shiftType === 'intermediario') {
      start = '12:00'; end = '20:00'; bMin = 60;
    } else if (shiftType === 'fechamento') {
      start = '14:00'; end = '22:00'; bMin = 60;
    } else {
      start = startTime;
      end = endTime;
      bMin = breakDuration;
    }

    const duration = getShiftDuration(start, end, bMin);
    const elapsed = getShiftElapsed(start, end);
    const warnings: string[] = [];

    const limit = allowOvertime ? 10 : 8;
    if (duration > limit) {
      warnings.push(`Carga horária diária (${duration.toFixed(1)}h) excede o limite de ${limit}h.`);
    }

    if (elapsed > 6 && bMin < 60) {
      warnings.push(`Jornada acima de 6h requer intervalo mínimo de 1 hora (60 min).`);
    } else if (elapsed >= 4 && elapsed <= 6 && bMin < 15) {
      warnings.push(`Jornada entre 4h e 6h requer intervalo mínimo de 15 min.`);
    }

    if (warnings.length > 0) {
      setWarningMsg(`⚠️ <strong>Atenção:</strong><br>${warnings.join('<br>')}`);
    } else {
      setWarningMsg('');
    }
  }, [shiftType, startTime, endTime, breakDuration, allowOvertime]);

  if (!isOpen) return null;

  const getFriendlyDate = () => {
    if (!selectedDate) return '';
    const dateObj = new Date(selectedDate + 'T12:00:00');
    const dayNameIdx = dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1;
    return `${formatToFullDate(selectedDate)} (${DAY_NAMES_PT[dayNameIdx]})`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let start = '00:00';
    let end = '00:00';
    let bMin = 0;

    if (shiftType === 'abertura') {
      start = '10:00'; end = '18:00'; bMin = 60;
    } else if (shiftType === 'intermediario') {
      start = '12:00'; end = '20:00'; bMin = 60;
    } else if (shiftType === 'fechamento') {
      start = '14:00'; end = '22:00'; bMin = 60;
    } else if (shiftType === 'personalizado') {
      start = startTime;
      end = endTime;
      bMin = breakDuration;
    }

    onSave({
      id: selectedShift?.id,
      employee_id: selectedEmployeeId,
      store_id: employee?.home_store_id || storeId,
      date: selectedDate,
      start_time: start,
      end_time: end,
      break_duration_minutes: bMin,
      allow_overtime: allowOvertime,
    });
  };

  return (
    <div className="modal-backdrop active">
      <div className="modal-content card">
        <div className="modal-header">
          <h2>{selectedShift ? 'Editar Turno' : 'Novo Turno'}</h2>
          <button className="modal-close" onClick={onClose} type="button">
            &times;
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group info-read-only">
              <label>Funcionário</label>
              <div className="read-only-text">
                {employee ? `${employee.name} (${employee.role})` : 'Carregando...'}
              </div>
            </div>

            <div className="form-group info-read-only">
              <label>Data</label>
              <div className="read-only-text">{getFriendlyDate()}</div>
            </div>

            <div className="form-group">
              <label htmlFor="shift-type">Tipo de Turno / Ação</label>
              <select
                id="shift-type"
                value={shiftType}
                onChange={e => setShiftType(e.target.value)}
                required
              >
                <option value="folga">Folga (DSR / Sem expediente)</option>
                <option value="abertura">Abertura (10:00 - 18:00)</option>
                <option value="intermediario">Intermediário (12:00 - 20:00)</option>
                <option value="fechamento">Fechamento (14:00 - 22:00)</option>
                <option value="personalizado">Horário Personalizado</option>
              </select>
            </div>

            {shiftType !== 'folga' && (
              <>
                {shiftType === 'personalizado' && (
                  <div className="custom-schedule-fields">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="custom-start">Entrada</label>
                        <input
                          type="time"
                          id="custom-start"
                          value={startTime}
                          onChange={e => setStartTime(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="custom-end">Saída</label>
                        <input
                          type="time"
                          id="custom-end"
                          value={endTime}
                          onChange={e => setEndTime(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="custom-break">Intervalo (Minutos)</label>
                        <input
                          type="number"
                          id="custom-break"
                          min="0"
                          max="240"
                          value={breakDuration}
                          onChange={e => setBreakDuration(parseInt(e.target.value) || 0)}
                        />
                        <span className="input-tip">
                          Jornadas &gt; 6h exigem min 60m. Entre 4h e 6h exigem min 15m.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-group checkbox-group">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      id="modal-overtime"
                      checked={allowOvertime}
                      onChange={e => setAllowOvertime(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Permitir Hora Extra (Permite jornada diária até 10h)
                  </label>
                </div>
              </>
            )}

            {warningMsg && (
              <div
                className="modal-inline-alert alert-warning"
                dangerouslySetInnerHTML={{ __html: warningMsg }}
              />
            )}

            <div className="modal-footer">
              {selectedShift && (
                <button
                  type="button"
                  className="btn btn-danger-outline"
                  onClick={() => onDelete(selectedShift.id)}
                >
                  Excluir Turno
                </button>
              )}
              <div className="footer-actions-right">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar Turno
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
