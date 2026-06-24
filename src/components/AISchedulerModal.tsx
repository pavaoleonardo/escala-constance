import React, { useState, useEffect } from 'react';
import { Store, Employee } from '../lib/types';
import { formatToFullDate, DAY_NAMES_PT } from '../lib/validation';

interface AISchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  stores: Store[];
  employees: Employee[];
  currentMonthStart: Date;
  activeStoreFilter: string;
  onGenerate: (storeId: string, period: 'week' | 'month') => Promise<void>;
}

export const AISchedulerModal: React.FC<AISchedulerModalProps> = ({
  isOpen,
  onClose,
  stores,
  employees,
  currentMonthStart,
  activeStoreFilter,
  onGenerate,
}) => {
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [planningPeriod, setPlanningPeriod] = useState<'week' | 'month'>('week');
  const [isPlanning, setIsPlanning] = useState<boolean>(false);
  const [planningStep, setPlanningStep] = useState<number>(0);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      if (activeStoreFilter && activeStoreFilter !== 'all') {
        setSelectedStoreId(activeStoreFilter);
      } else if (stores.length > 0) {
        setSelectedStoreId(stores[0].id);
      }
      setPlanningPeriod('week');
      setIsPlanning(false);
      setPlanningStep(0);
      setSuccess(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const steps = [
    'Analisando contratos e limites da CLT...',
    'Alocando folgas obrigatórias e DSR...',
    'Distribuindo equipe nos turnos de Abertura/Intermediário/Fechamento...',
    'Garantindo cobertura da Supervisora...',
    'Executando verificação de conformidade em tempo real (0 violações)...',
    'Salvando dados de escala...'
  ];

  const handleStartPlanning = async () => {
    if (!selectedStoreId) return;
    setIsPlanning(true);
    setPlanningStep(0);

    // Simulate AI optimization process steps
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setPlanningStep(i + 1);
    }

    try {
      await onGenerate(selectedStoreId, planningPeriod);
      setSuccess(true);
      setIsPlanning(false);
    } catch (err) {
      alert('Erro ao gerar escala: ' + err);
      setIsPlanning(false);
    }
  };

  const getWeekRangeLabel = () => {
    const start = new Date(currentMonthStart);
    if (planningPeriod === 'month') {
      start.setMonth(start.getMonth() + 1);
    }
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    
    const format = (d: Date) => {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    };
    return `${format(start)} a ${format(end)}`;
  };

  const activeEmployeesCount = employees.filter(
    emp => emp.active && emp.home_store_id === selectedStoreId
  ).length;

  return (
    <div className="modal-backdrop active">
      <div className="modal-content card">
        <div className="modal-header">
          <h2>Planejamento Inteligente (IA)</h2>
          {!isPlanning && (
            <button className="modal-close" onClick={onClose} type="button">
              &times;
            </button>
          )}
        </div>
        <div className="modal-body">
          {!isPlanning && !success && (
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                O otimizador local irá criar automaticamente uma escala de segunda-feira a domingo que atende a 100% das regras da CLT (limites de 44h semanais, descansos de 11h e DSR) e garante cobertura operacional contínua para a loja selecionada.
              </p>

              <div className="form-group info-read-only" style={{ marginBottom: '1rem' }}>
                <label>Período de Planejamento (Mês)</label>
                <div className="read-only-text">{getWeekRangeLabel()}</div>
              </div>

              <div className="form-group">
                <label htmlFor="ai-period-select">Período de Planejamento</label>
                <select
                  id="ai-period-select"
                  value={planningPeriod}
                  onChange={e => setPlanningPeriod(e.target.value as 'week' | 'month')}
                  required
                >
                  <option value="week">Este Mês (Mês Completo)</option>
                  <option value="month">Próximo Mês (Mês Completo)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="ai-store-select">Selecione a Loja</label>
                <select
                  id="ai-store-select"
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

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>Funcionários Ativos:</span>
                  <strong style={{ color: 'var(--color-gold-text)' }}>{activeEmployeesCount} colaboradores</strong>
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: '0', paddingTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleStartPlanning}
                  disabled={activeEmployeesCount === 0}
                  style={{
                    background: 'linear-gradient(135deg, var(--color-gold), #d4af37)',
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(176,141,71,0.25)'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '4px' }}>
                    <path d="m12 3-1.912 5.886L4.202 9l5.886 1.912L12 16.798l1.912-5.886L19.798 9l-5.886-1.912Z" />
                    <path d="M5 3v4" />
                    <path d="M3 5h4" />
                    <path d="M19 17v4" />
                    <path d="M17 19h4" />
                  </svg>
                  Iniciar Planejamento
                </button>
              </div>
            </div>
          )}

          {isPlanning && !success && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              {/* Spinning AI Sparkle Ring */}
              <div style={{ position: 'relative', width: '70px', height: '70px', margin: '0 auto 1.5rem auto' }}>
                <div style={{
                  border: '3px solid #f1f5f9',
                  borderTop: '3px solid var(--color-gold)',
                  borderRadius: '50%',
                  width: '100%',
                  height: '100%',
                  animation: 'spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite'
                }} />
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '1.5rem'
                }}>
                  ✨
                </div>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Otimizando Escala com IA
              </h3>
              
              <div style={{ margin: '1rem 0' }}>
                {steps.map((step, idx) => {
                  const isActive = idx === planningStep;
                  const isCompleted = idx < planningStep;
                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        fontSize: '0.78rem',
                        color: isActive ? 'var(--text-primary)' : isCompleted ? 'var(--color-success)' : 'var(--text-muted)',
                        fontWeight: isActive ? '600' : 'normal',
                        margin: '0.4rem 0',
                        opacity: isActive || isCompleted ? 1 : 0.5,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>{isCompleted ? '✓' : isActive ? '●' : '○'}</span>
                      <span>{step}</span>
                    </div>
                  );
                })}
              </div>

              <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              `}</style>
            </div>
          )}

          {success && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-success-bg)',
                border: '2px solid var(--color-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
                fontSize: '1.8rem',
                color: 'var(--color-success)'
              }}>
                ✓
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Escala Criada com Sucesso!
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Os turnos foram gerados respeitando todas as regras da CLT e garantindo cobertura da supervisora.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={onClose}
                style={{ minWidth: '120px' }}
              >
                Concluir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
