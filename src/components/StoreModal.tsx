import React, { useState, useEffect } from 'react';
import { Store } from '../lib/types';

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (store: Omit<Store, 'id'> & { id?: string }) => void;
  onDelete: (id: string) => void;
  stores: Store[];
}

export const StoreModal: React.FC<StoreModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  stores,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [storeId, setStoreId] = useState<string>('');
  const [name, setName] = useState<string>('');
  
  // Operating hours states
  const [weekdayOpen, setWeekdayOpen] = useState<string>('10:00');
  const [weekdayClose, setWeekdayClose] = useState<string>('22:00');
  const [sundayOpen, setSundayOpen] = useState<string>('12:00');
  const [sundayClose, setSundayClose] = useState<string>('21:00');

  if (!isOpen) return null;

  const handleEditClick = (store: Store) => {
    setStoreId(store.id);
    setName(store.name);
    setWeekdayOpen(store.operating_hours.weekday.open);
    setWeekdayClose(store.operating_hours.weekday.close);
    setSundayOpen(store.operating_hours.sunday.open);
    setSundayClose(store.operating_hours.sunday.close);
    setActiveTab('form');
  };

  const handleNewClick = () => {
    setStoreId('');
    setName('');
    setWeekdayOpen('10:00');
    setWeekdayClose('22:00');
    setSundayOpen('12:00');
    setSundayClose('21:00');
    setActiveTab('form');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: storeId || undefined,
      name,
      operating_hours: {
        weekday: { open: weekdayOpen, close: weekdayClose },
        sunday: { open: sundayOpen, close: sundayClose }
      }
    });
    setActiveTab('list');
  };

  const handleDelete = (id: string) => {
    if (confirm("Deseja realmente remover esta loja? Isso afetará os colaboradores e turnos associados.")) {
      onDelete(id);
      setActiveTab('list');
    }
  };

  return (
    <div className="modal-backdrop active">
      <div className="modal-content card modal-lg">
        <div className="modal-header">
          <h2>Gerenciamento de Lojas</h2>
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
              Lista de Lojas
            </button>
            <button
              type="button"
              className={`tab-button ${activeTab === 'form' ? 'active' : ''}`}
              onClick={handleNewClick}
            >
              {storeId ? 'Editar Loja' : 'Nova Loja'}
            </button>
          </div>

          {activeTab === 'list' ? (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nome da Loja</th>
                    <th>Horário Mon-Sat</th>
                    <th>Horário Domingo</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map(store => (
                    <tr key={store.id}>
                      <td>
                        <strong>{store.name}</strong>
                      </td>
                      <td>{store.operating_hours.weekday.open} - {store.operating_hours.weekday.close}</td>
                      <td>{store.operating_hours.sunday.open} - {store.operating_hours.sunday.close}</td>
                      <td>
                        <button
                          type="button"
                          className="btn-text-action"
                          onClick={() => handleEditClick(store)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn-text-action"
                          style={{ color: 'var(--color-danger)', marginLeft: '1rem' }}
                          onClick={() => handleDelete(store.id)}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="store-name">Nome Comercial da Loja</label>
                <input
                  type="text"
                  id="store-name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Ex: Shopping Iguatemi"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Funcionamento Segunda a Sábado</label>
                  <div className="form-row" style={{ marginTop: '0.25rem' }}>
                    <div>
                      <span className="input-tip">Abertura</span>
                      <input
                        type="time"
                        value={weekdayOpen}
                        onChange={e => setWeekdayOpen(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <span className="input-tip">Fechamento</span>
                      <input
                        type="time"
                        value={weekdayClose}
                        onChange={e => setWeekdayClose(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Funcionamento aos Domingos</label>
                  <div className="form-row" style={{ marginTop: '0.25rem' }}>
                    <div>
                      <span className="input-tip">Abertura</span>
                      <input
                        type="time"
                        value={sundayOpen}
                        onChange={e => setSundayOpen(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <span className="input-tip">Fechamento</span>
                      <input
                        type="time"
                        value={sundayClose}
                        onChange={e => setSundayClose(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActiveTab('list')}
                >
                  Voltar
                </button>
                {storeId && (
                  <button
                    type="button"
                    className="btn btn-danger-outline"
                    onClick={() => handleDelete(storeId)}
                  >
                    Excluir Loja
                  </button>
                )}
                <button type="submit" className="btn btn-primary">
                  Salvar Loja
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
