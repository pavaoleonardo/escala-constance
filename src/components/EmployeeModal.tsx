import React, { useState, useEffect } from 'react';
import { Store, Employee } from '../lib/types';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (emp: Omit<Employee, 'id'> & { id?: string }) => Promise<{ id: string } | undefined> | { id: string } | undefined | void;
  onDelete: (id: string) => Promise<boolean> | boolean | void;
  onSaveVacation?: (employeeId: string, startDate: string, endDate: string) => Promise<void> | void;
  stores: Store[];
  employees: Employee[];
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  onSaveVacation,
  stores,
  employees,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [empId, setEmpId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<string>('Vendedora');
  const [homeStoreId, setHomeStoreId] = useState<string>('');
  const [weeklyHours, setWeeklyHours] = useState<number>(44);
  const [active, setActive] = useState<boolean>(true);
  const [defaultShift, setDefaultShift] = useState<string>('morning');

  const [hasVacationRange, setHasVacationRange] = useState<boolean>(false);
  const [vacationStart, setVacationStart] = useState<string>('');
  const [vacationEnd, setVacationEnd] = useState<string>('');
  const [vacationLoading, setVacationLoading] = useState<boolean>(false);

  // Set default store when stores list loads
  useEffect(() => {
    if (stores.length > 0 && !homeStoreId) {
      setHomeStoreId(stores[0].id);
    }
  }, [stores, homeStoreId]);

  if (!isOpen) return null;

  // Collect unique roles from existing employees for suggestions
  const existingRoles = Array.from(new Set(employees.map(e => e.role)));
  const defaultSuggestions = ['Vendedora', 'Vendedora Supervisora'];
  const roleSuggestions = Array.from(new Set([...defaultSuggestions, ...existingRoles]));

  const handleEditClick = (emp: Employee) => {
    setEmpId(emp.id);
    setName(emp.name);
    setRole(emp.role);
    setHomeStoreId(emp.home_store_id);
    setWeeklyHours(emp.weekly_hours_contract);
    setActive(emp.active);
    setDefaultShift(emp.default_shift || 'morning');
    setHasVacationRange(false);
    setVacationStart('');
    setVacationEnd('');
    setActiveTab('form');
  };

  const handleNewClick = () => {
    setEmpId('');
    setName('');
    setRole('Vendedora');
    if (stores.length > 0) {
      setHomeStoreId(stores[0].id);
    }
    setWeeklyHours(44);
    setActive(true);
    setDefaultShift('morning');
    setHasVacationRange(false);
    setVacationStart('');
    setVacationEnd('');
    setActiveTab('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasVacationRange && vacationStart && vacationEnd) {
      if (new Date(vacationStart) > new Date(vacationEnd)) {
        alert("A data de início das férias não pode ser posterior à data de término.");
        return;
      }
    }

    // Save employee first and get the confirmed id (may differ from local empId for new employees)
    const savedResult = await onSave({
      id: empId || undefined,
      name,
      role: role.trim() || 'Vendedora',
      home_store_id: homeStoreId,
      weekly_hours_contract: weeklyHours,
      active,
      default_shift: defaultShift,
    });

    // Use the confirmed id returned by onSave (important for new employees and UUID migration)
    const confirmedId = savedResult?.id || empId;

    if (confirmedId && hasVacationRange && vacationStart && vacationEnd && onSaveVacation) {
      setVacationLoading(true);
      try {
        await onSaveVacation(confirmedId, vacationStart, vacationEnd);
      } catch (err) {
        console.error("Erro ao salvar período de férias:", err);
        alert('Erro ao salvar férias. Verifique as datas e tente novamente.');
      } finally {
        setVacationLoading(false);
      }
    }

    setActiveTab('list');
  };

  return (
    <div className="modal-backdrop active">
      <div className="modal-content card modal-lg">
        <div className="modal-header">
          <h2>Gerenciamento de Funcionários</h2>
          <button className="modal-close" onClick={onClose} type="button">
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="employee-tabs">
            <button
              type="button"
              className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => setActiveTab('list')}
            >
              Lista de Funcionários
            </button>
            <button
              type="button"
              className={`tab-button ${activeTab === 'form' ? 'active' : ''}`}
              onClick={handleNewClick}
            >
              {empId ? 'Editar Funcionário' : 'Novo Funcionário'}
            </button>
          </div>

          {activeTab === 'list' ? (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Cargo</th>
                    <th>Turno Padrão</th>
                    <th>Loja Sede</th>
                    <th>Contrato Semanal</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => {
                    const store = stores.find(s => s.id === emp.home_store_id);
                    const storeName = store ? store.name.replace('Constance ', '') : 'Indefinido';
                    const shiftLabels: Record<string, string> = {
                      morning: 'Manhã',
                      intermediate: 'Intermediário',
                      evening: 'Noite'
                    };
                    const shiftText = shiftLabels[emp.default_shift || 'morning'] || 'Manhã';

                    return (
                      <tr key={emp.id}>
                        <td>
                          <strong>{emp.name}</strong>
                        </td>
                        <td>{emp.role}</td>
                        <td>
                          <span className="badge badge-info" style={{ backgroundColor: 'rgba(175, 143, 86, 0.1)', color: 'var(--color-gold-text)', border: '1px solid rgba(175, 143, 86, 0.2)', fontSize: '0.75rem' }}>
                            {shiftText}
                          </span>
                        </td>
                        <td>{storeName}</td>
                        <td>{emp.weekly_hours_contract}h</td>
                        <td>
                          {emp.active ? (
                            <span className="badge badge-success">Ativo</span>
                          ) : (
                            <span className="badge badge-danger">Inativo</span>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-text-action"
                            onClick={() => handleEditClick(emp)}
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="emp-name">Nome Completo</label>
                  <input
                    type="text"
                    id="emp-name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="Ex: Maria Oliveira"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="emp-role">Cargo</label>
                  <input
                    type="text"
                    id="emp-role"
                    list="role-suggestions"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    required
                    placeholder="Ex: Vendedora"
                  />
                  <datalist id="role-suggestions">
                    {roleSuggestions.map(r => (
                      <option key={r} value={r} />
                    ))}
                  </datalist>
                  <span className="input-tip">Digite livremente ou escolha uma sugestão.</span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="emp-store">Loja Sede</label>
                  <select
                    id="emp-store"
                    value={homeStoreId}
                    onChange={e => setHomeStoreId(e.target.value)}
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
                  <label htmlFor="emp-hours">Carga Horária Semanal Contratual (h)</label>
                  <input
                    type="number"
                    id="emp-hours"
                    value={weeklyHours}
                    onChange={e => setWeeklyHours(parseInt(e.target.value) || 44)}
                    min={1}
                    max={44}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="emp-shift">Turno Padrão</label>
                  <select
                    id="emp-shift"
                    value={defaultShift}
                    onChange={e => setDefaultShift(e.target.value)}
                    required
                  >
                    <option value="morning">Manhã (10:00 - 16:00)</option>
                    <option value="intermediate">Intermediário (14:00 - 20:00)</option>
                    <option value="evening">Noite (16:00 - 22:00)</option>
                  </select>
                  <span className="input-tip">O planejador IA escalará este funcionário neste turno por padrão.</span>
                </div>
                <div className="form-group" style={{ visibility: 'hidden' }}>
                  <label>&nbsp;</label>
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    id="emp-active"
                    checked={active}
                    onChange={e => setActive(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Funcionário Ativo (Apenas ativos aparecem na escala semanal)
                </label>
              </div>

              {empId && (
                <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                  <label className="checkbox-container" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    <input
                      type="checkbox"
                      id="emp-has-vacation"
                      checked={hasVacationRange}
                      onChange={e => setHasVacationRange(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Agendar Período de Férias (Férias)
                  </label>

                  {hasVacationRange && (
                    <div className="form-row" style={{ marginTop: '1rem' }}>
                      <div className="form-group">
                        <label htmlFor="vacation-start">Início das Férias</label>
                        <input
                          type="date"
                          id="vacation-start"
                          value={vacationStart}
                          onChange={e => setVacationStart(e.target.value)}
                          required={hasVacationRange}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="vacation-end">Fim das Férias</label>
                        <input
                          type="date"
                          id="vacation-end"
                          value={vacationEnd}
                          onChange={e => setVacationEnd(e.target.value)}
                          required={hasVacationRange}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActiveTab('list')}
                  disabled={vacationLoading}
                >
                  Voltar
                </button>
                {empId && (
                  <button
                    type="button"
                    className="btn btn-danger-outline"
                    onClick={async () => {
                      const success = await onDelete(empId);
                      if (success !== false) {
                        setActiveTab('list');
                      }
                    }}
                    disabled={vacationLoading}
                  >
                    Excluir
                  </button>
                )}
                <button type="submit" className="btn btn-primary" disabled={vacationLoading}>
                  {vacationLoading ? 'Processando...' : 'Salvar Funcionário'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
