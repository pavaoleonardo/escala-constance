import React, { useState, useEffect } from 'react';
import { Store, Employee } from '../lib/types';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (emp: Omit<Employee, 'id'> & { id?: string }) => void;
  onDelete: (id: string) => Promise<boolean> | boolean | void;
  stores: Store[];
  employees: Employee[];
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
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
    setActiveTab('form');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: empId || undefined,
      name,
      role: role.trim() || 'Vendedora',
      home_store_id: homeStoreId,
      weekly_hours_contract: weeklyHours,
      active,
    });
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
                    return (
                      <tr key={emp.id}>
                        <td>
                          <strong>{emp.name}</strong>
                        </td>
                        <td>{emp.role}</td>
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

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActiveTab('list')}
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
                  >
                    Excluir
                  </button>
                )}
                <button type="submit" className="btn btn-primary">
                  Salvar Funcionário
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
