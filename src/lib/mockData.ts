import { Store, Employee, Shift } from './types';

export const defaultStores: Store[] = [
  {
    id: 'store-1',
    name: 'Polo Shopping Indaiatuba',
    operating_hours: {
      weekday: { open: '10:00', close: '22:00' },
      sunday: { open: '12:00', close: '20:00' }
    }
  },
  {
    id: 'store-2',
    name: 'Shopping Parque das Bandeiras',
    operating_hours: {
      weekday: { open: '10:00', close: '22:00' },
      sunday: { open: '12:00', close: '20:00' }
    }
  },
  {
    id: 'store-3',
    name: 'Shopping Iguatemi Campinas',
    operating_hours: {
      weekday: { open: '10:00', close: '22:00' },
      sunday: { open: '12:00', close: '20:00' }
    }
  }
];

export const defaultEmployees: Employee[] = [
  // Store 1: Polo Shopping Indaiatuba
  { id: 'emp-1', name: 'Ana Paula Rodrigues', role: 'Vendedora Supervisora', home_store_id: 'store-1', weekly_hours_contract: 44, active: true },
  { id: 'emp-9', name: 'Juliana Souza Neves', role: 'Vendedora', home_store_id: 'store-1', weekly_hours_contract: 44, active: true },
  { id: 'emp-2', name: 'Bruno Alves Souza', role: 'Vendedora', home_store_id: 'store-1', weekly_hours_contract: 44, active: true },
  { id: 'emp-13', name: 'Marcos Oliveira', role: 'Vendedora', home_store_id: 'store-1', weekly_hours_contract: 44, active: true },
  { id: 'emp-3', name: 'Elena Santos Dias', role: 'Vendedora', home_store_id: 'store-1', weekly_hours_contract: 44, active: true },
  { id: 'emp-4', name: 'Gabriela Melo Reis', role: 'Vendedora', home_store_id: 'store-1', weekly_hours_contract: 44, active: true },
  
  // Store 2: Shopping Parque das Bandeiras
  { id: 'emp-14', name: 'Patricia Lima', role: 'Vendedora Supervisora', home_store_id: 'store-2', weekly_hours_contract: 44, active: true },
  { id: 'emp-5', name: 'Fernanda Costa Lima', role: 'Vendedora', home_store_id: 'store-2', weekly_hours_contract: 44, active: true },
  { id: 'emp-6', name: 'Camila Rocha Pinto', role: 'Vendedora', home_store_id: 'store-2', weekly_hours_contract: 44, active: true },
  { id: 'emp-10', name: 'Diego Ramos Cardoso', role: 'Vendedora', home_store_id: 'store-2', weekly_hours_contract: 44, active: true },
  { id: 'emp-7', name: 'Helena Lima Ferraz', role: 'Vendedora', home_store_id: 'store-2', weekly_hours_contract: 44, active: true },
  { id: 'emp-8', name: 'Isabela Azevedo', role: 'Vendedora', home_store_id: 'store-2', weekly_hours_contract: 44, active: true },

  // Store 3: Shopping Iguatemi Campinas
  { id: 'emp-15', name: 'Raquel Mendes Ferreira', role: 'Vendedora Supervisora', home_store_id: 'store-3', weekly_hours_contract: 44, active: true },
  { id: 'emp-16', name: 'Tatiana Borges Costa', role: 'Vendedora', home_store_id: 'store-3', weekly_hours_contract: 44, active: true },
  { id: 'emp-17', name: 'Vanessa Ribeiro Alves', role: 'Vendedora', home_store_id: 'store-3', weekly_hours_contract: 44, active: true },
  { id: 'emp-18', name: 'Amanda Carvalho Souza', role: 'Vendedora', home_store_id: 'store-3', weekly_hours_contract: 44, active: true },
  { id: 'emp-19', name: 'Bianca Farias Lima', role: 'Vendedora', home_store_id: 'store-3', weekly_hours_contract: 44, active: true },
  { id: 'emp-20', name: 'Carolina Duarte Pereira', role: 'Vendedora', home_store_id: 'store-3', weekly_hours_contract: 44, active: true }
];

export const defaultShifts: Shift[] = [
  // --- Store 1 (Indaiatuba) — 6h shifts ---

  // Ana Paula (Supervisora) - Mon to Fri (Manhã: 10:00-16:00)
  { id: 's-1', employee_id: 'emp-1', store_id: 'store-1', date: '2026-06-08', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-2', employee_id: 'emp-1', store_id: 'store-1', date: '2026-06-09', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-3', employee_id: 'emp-1', store_id: 'store-1', date: '2026-06-10', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-4', employee_id: 'emp-1', store_id: 'store-1', date: '2026-06-11', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-5', employee_id: 'emp-1', store_id: 'store-1', date: '2026-06-12', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },

  // Juliana Souza (Vendedora) - Mon to Fri (Noite: 16:00-22:00)
  { id: 's-25', employee_id: 'emp-9', store_id: 'store-1', date: '2026-06-08', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-26', employee_id: 'emp-9', store_id: 'store-1', date: '2026-06-09', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-27', employee_id: 'emp-9', store_id: 'store-1', date: '2026-06-10', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-28', employee_id: 'emp-9', store_id: 'store-1', date: '2026-06-11', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-29', employee_id: 'emp-9', store_id: 'store-1', date: '2026-06-12', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },

  // Bruno Alves (Vendedora) - Mon to Fri (Intermediário: 14:00-20:00)
  { id: 's-6', employee_id: 'emp-2', store_id: 'store-1', date: '2026-06-08', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-7', employee_id: 'emp-2', store_id: 'store-1', date: '2026-06-09', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-8', employee_id: 'emp-2', store_id: 'store-1', date: '2026-06-10', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-9', employee_id: 'emp-2', store_id: 'store-1', date: '2026-06-11', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-10', employee_id: 'emp-2', store_id: 'store-1', date: '2026-06-12', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },

  // Marcos Oliveira (Vendedora) - Mon to Fri (Manhã: 10:00-16:00)
  { id: 's-39', employee_id: 'emp-13', store_id: 'store-1', date: '2026-06-08', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-40', employee_id: 'emp-13', store_id: 'store-1', date: '2026-06-09', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-41', employee_id: 'emp-13', store_id: 'store-1', date: '2026-06-10', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-42', employee_id: 'emp-13', store_id: 'store-1', date: '2026-06-11', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-43', employee_id: 'emp-13', store_id: 'store-1', date: '2026-06-12', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },

  // Elena Santos (Vendedora) - Mon to Fri (Noite: 16:00-22:00)
  { id: 's-12', employee_id: 'emp-3', store_id: 'store-1', date: '2026-06-08', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-13', employee_id: 'emp-3', store_id: 'store-1', date: '2026-06-09', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-14', employee_id: 'emp-3', store_id: 'store-1', date: '2026-06-10', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-15', employee_id: 'emp-3', store_id: 'store-1', date: '2026-06-11', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-44', employee_id: 'emp-3', store_id: 'store-1', date: '2026-06-12', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },

  // Gabriela Melo (Vendedora) - Mon to Fri (Intermediário: 14:00-20:00)
  { id: 's-45', employee_id: 'emp-4', store_id: 'store-1', date: '2026-06-08', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-46', employee_id: 'emp-4', store_id: 'store-1', date: '2026-06-09', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-47', employee_id: 'emp-4', store_id: 'store-1', date: '2026-06-10', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-48', employee_id: 'emp-4', store_id: 'store-1', date: '2026-06-11', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-49', employee_id: 'emp-4', store_id: 'store-1', date: '2026-06-12', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },


  // --- Store 2 (Parque das Bandeiras) — 6h shifts ---

  // Patricia Lima (Supervisora) - Mon to Fri (Manhã: 10:00-16:00)
  { id: 's-50', employee_id: 'emp-14', store_id: 'store-2', date: '2026-06-08', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-51', employee_id: 'emp-14', store_id: 'store-2', date: '2026-06-09', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-52', employee_id: 'emp-14', store_id: 'store-2', date: '2026-06-10', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-53', employee_id: 'emp-14', store_id: 'store-2', date: '2026-06-11', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-54', employee_id: 'emp-14', store_id: 'store-2', date: '2026-06-12', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },

  // Fernanda Costa (Vendedora) - Mon to Fri (Noite: 16:00-22:00)
  { id: 's-16', employee_id: 'emp-5', store_id: 'store-2', date: '2026-06-08', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-17', employee_id: 'emp-5', store_id: 'store-2', date: '2026-06-09', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-18', employee_id: 'emp-5', store_id: 'store-2', date: '2026-06-10', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-19', employee_id: 'emp-5', store_id: 'store-2', date: '2026-06-11', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-20', employee_id: 'emp-5', store_id: 'store-2', date: '2026-06-12', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },

  // Diego Ramos (Vendedora) - Mon to Fri (Intermediário: 14:00-20:00)
  { id: 's-30', employee_id: 'emp-10', store_id: 'store-2', date: '2026-06-08', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-31', employee_id: 'emp-10', store_id: 'store-2', date: '2026-06-09', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-32', employee_id: 'emp-10', store_id: 'store-2', date: '2026-06-10', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-33', employee_id: 'emp-10', store_id: 'store-2', date: '2026-06-11', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-34', employee_id: 'emp-10', store_id: 'store-2', date: '2026-06-12', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },

  // Camila Rocha (Vendedora) - Mon to Fri (Manhã: 10:00-16:00)
  { id: 's-21', employee_id: 'emp-6', store_id: 'store-2', date: '2026-06-08', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-22', employee_id: 'emp-6', store_id: 'store-2', date: '2026-06-09', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-23', employee_id: 'emp-6', store_id: 'store-2', date: '2026-06-10', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-24', employee_id: 'emp-6', store_id: 'store-2', date: '2026-06-11', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-55', employee_id: 'emp-6', store_id: 'store-2', date: '2026-06-12', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },

  // Helena Lima (Vendedora) - Mon to Fri (Noite: 16:00-22:00)
  { id: 's-56', employee_id: 'emp-7', store_id: 'store-2', date: '2026-06-08', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-57', employee_id: 'emp-7', store_id: 'store-2', date: '2026-06-09', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-58', employee_id: 'emp-7', store_id: 'store-2', date: '2026-06-10', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-59', employee_id: 'emp-7', store_id: 'store-2', date: '2026-06-11', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-60', employee_id: 'emp-7', store_id: 'store-2', date: '2026-06-12', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },

  // Isabela Azevedo (Vendedora) - Mon to Fri (Intermediário: 14:00-20:00)
  { id: 's-61', employee_id: 'emp-8', store_id: 'store-2', date: '2026-06-08', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-62', employee_id: 'emp-8', store_id: 'store-2', date: '2026-06-09', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-63', employee_id: 'emp-8', store_id: 'store-2', date: '2026-06-10', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-64', employee_id: 'emp-8', store_id: 'store-2', date: '2026-06-11', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-65', employee_id: 'emp-8', store_id: 'store-2', date: '2026-06-12', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },

  // --- Store 3 (Shopping Iguatemi Campinas) — 6h shifts ---

  // Raquel Mendes (Supervisora) - Mon to Fri (Manhã: 10:00-16:00)
  { id: 's-80', employee_id: 'emp-15', store_id: 'store-3', date: '2026-06-08', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-81', employee_id: 'emp-15', store_id: 'store-3', date: '2026-06-09', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-82', employee_id: 'emp-15', store_id: 'store-3', date: '2026-06-10', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-83', employee_id: 'emp-15', store_id: 'store-3', date: '2026-06-11', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-84', employee_id: 'emp-15', store_id: 'store-3', date: '2026-06-12', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },

  // Tatiana Borges (Vendedora) - Mon to Fri (Noite: 16:00-22:00)
  { id: 's-85', employee_id: 'emp-16', store_id: 'store-3', date: '2026-06-08', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-86', employee_id: 'emp-16', store_id: 'store-3', date: '2026-06-09', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-87', employee_id: 'emp-16', store_id: 'store-3', date: '2026-06-10', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-88', employee_id: 'emp-16', store_id: 'store-3', date: '2026-06-11', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-89', employee_id: 'emp-16', store_id: 'store-3', date: '2026-06-12', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },

  // Vanessa Ribeiro (Vendedora) - Mon to Fri (Intermediário: 14:00-20:00)
  { id: 's-90', employee_id: 'emp-17', store_id: 'store-3', date: '2026-06-08', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-91', employee_id: 'emp-17', store_id: 'store-3', date: '2026-06-09', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-92', employee_id: 'emp-17', store_id: 'store-3', date: '2026-06-10', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-93', employee_id: 'emp-17', store_id: 'store-3', date: '2026-06-11', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-94', employee_id: 'emp-17', store_id: 'store-3', date: '2026-06-12', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },

  // Amanda Carvalho (Vendedora) - Mon to Fri (Manhã: 10:00-16:00)
  { id: 's-95', employee_id: 'emp-18', store_id: 'store-3', date: '2026-06-08', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-96', employee_id: 'emp-18', store_id: 'store-3', date: '2026-06-09', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-97', employee_id: 'emp-18', store_id: 'store-3', date: '2026-06-10', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-98', employee_id: 'emp-18', store_id: 'store-3', date: '2026-06-11', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-99', employee_id: 'emp-18', store_id: 'store-3', date: '2026-06-12', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },

  // Bianca Farias (Vendedora) - Mon to Fri (Noite: 16:00-22:00)
  { id: 's-100', employee_id: 'emp-19', store_id: 'store-3', date: '2026-06-08', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-101', employee_id: 'emp-19', store_id: 'store-3', date: '2026-06-09', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-102', employee_id: 'emp-19', store_id: 'store-3', date: '2026-06-10', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-103', employee_id: 'emp-19', store_id: 'store-3', date: '2026-06-11', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-104', employee_id: 'emp-19', store_id: 'store-3', date: '2026-06-12', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },

  // Carolina Duarte (Vendedora) - Mon to Fri (Intermediário: 14:00-20:00)
  { id: 's-105', employee_id: 'emp-20', store_id: 'store-3', date: '2026-06-08', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-106', employee_id: 'emp-20', store_id: 'store-3', date: '2026-06-09', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-107', employee_id: 'emp-20', store_id: 'store-3', date: '2026-06-10', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-108', employee_id: 'emp-20', store_id: 'store-3', date: '2026-06-11', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 's-109', employee_id: 'emp-20', store_id: 'store-3', date: '2026-06-12', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },

  // ============================================================
  // JULY 2026 SHIFTS — STORE 1 (Polo Shopping Indaiatuba)
  // July 1=Wed, 5=Sun(1st), 12=Sun(2nd), 19=Sun(3rd), 26=Sun(4th)
  // Rest rule: even-index → Mon, odd-index → Tue
  // Sunday off: employee index % 4 → which Sunday they rest
  // Transition week: June 29 (Mon) and June 30 (Tue) also included
  // ============================================================

  // emp-1 (idx=0) Ana Paula Rodrigues — 10:00-16:00, Mon rest, Sun-off=wk1(Jul5)
  { id: 'j1-001', employee_id: 'emp-1', store_id: 'store-1', date: '2026-06-29', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j1-002', employee_id: 'emp-1', store_id: 'store-1', date: '2026-06-30', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j1-003', employee_id: 'emp-1', store_id: 'store-1', date: '2026-07-01', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j1-004', employee_id: 'emp-1', store_id: 'store-1', date: '2026-07-02', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j1-005', employee_id: 'emp-1', store_id: 'store-1', date: '2026-07-03', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j1-006', employee_id: 'emp-1', store_id: 'store-1', date: '2026-07-04', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j1-007', employee_id: 'emp-1', store_id: 'store-1', date: '2026-07-05', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j1-008', employee_id: 'emp-1', store_id: 'store-1', date: '2026-07-06', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j1-009', employee_id: 'emp-1', store_id: 'store-1', date: '2026-07-07', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j1-010', employee_id: 'emp-1', store_id: 'store-1', date: '2026-07-08', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j1-011', employee_id: 'emp-1', store_id: 'store-1', date: '2026-07-09', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j1-012', employee_id: 'emp-1', store_id: 'store-1', date: '2026-07-10', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j1-013', employee_id: 'emp-1', store_id: 'store-1', date: '2026-07-11', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j1-014', employee_id: 'emp-1', store_id: 'store-1', date: '2026-07-12', start_time: '12:00', end_time: '20:00', break_duration_minutes: 60, allow_overtime: false },
  { id: 'j1-015', employee_id: 'emp-1', store_id: 'store-1', date: '2026-07-13', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j1-016', employee_id: 'emp-1', store_id: 'store-1', date: '2026-07-14', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j1-017', employee_id: 'emp-1', store_id: 'store-1', date: '2026-07-15', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j1-018', employee_id: 'emp-1', store_id: 'store-1', date: '2026-07-16', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j1-019', employee_id: 'emp-1', store_id: 'store-1', date: '2026-07-17', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j1-020', employee_id: 'emp-1', store_id: 'store-1', date: '2026-07-18', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j1-021', employee_id: 'emp-1', store_id: 'store-1', date: '2026-07-19', start_time: '12:00', end_time: '20:00', break_duration_minutes: 60, allow_overtime: false },
  { id: 'j1-022', employee_id: 'emp-1', store_id: 'store-1', date: '2026-07-20', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j1-023', employee_id: 'emp-1', store_id: 'store-1', date: '2026-07-21', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j1-024', employee_id: 'emp-1', store_id: 'store-1', date: '2026-07-22', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j1-025', employee_id: 'emp-1', store_id: 'store-1', date: '2026-07-23', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j1-026', employee_id: 'emp-1', store_id: 'store-1', date: '2026-07-24', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j1-027', employee_id: 'emp-1', store_id: 'store-1', date: '2026-07-25', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j1-028', employee_id: 'emp-1', store_id: 'store-1', date: '2026-07-26', start_time: '12:00', end_time: '20:00', break_duration_minutes: 60, allow_overtime: false },
  { id: 'j1-029', employee_id: 'emp-1', store_id: 'store-1', date: '2026-07-27', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j1-030', employee_id: 'emp-1', store_id: 'store-1', date: '2026-07-28', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j1-031', employee_id: 'emp-1', store_id: 'store-1', date: '2026-07-29', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j1-032', employee_id: 'emp-1', store_id: 'store-1', date: '2026-07-30', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j1-033', employee_id: 'emp-1', store_id: 'store-1', date: '2026-07-31', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },

  // emp-9 (idx=1) Juliana Souza Neves — 16:00-22:00, Tue rest, Sun-off=wk2(Jul12)
  { id: 'j2-001', employee_id: 'emp-9', store_id: 'store-1', date: '2026-06-29', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j2-002', employee_id: 'emp-9', store_id: 'store-1', date: '2026-06-30', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j2-003', employee_id: 'emp-9', store_id: 'store-1', date: '2026-07-01', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j2-004', employee_id: 'emp-9', store_id: 'store-1', date: '2026-07-02', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j2-005', employee_id: 'emp-9', store_id: 'store-1', date: '2026-07-03', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j2-006', employee_id: 'emp-9', store_id: 'store-1', date: '2026-07-04', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j2-007', employee_id: 'emp-9', store_id: 'store-1', date: '2026-07-05', start_time: '12:00', end_time: '20:00', break_duration_minutes: 60, allow_overtime: false },
  { id: 'j2-008', employee_id: 'emp-9', store_id: 'store-1', date: '2026-07-06', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j2-009', employee_id: 'emp-9', store_id: 'store-1', date: '2026-07-07', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j2-010', employee_id: 'emp-9', store_id: 'store-1', date: '2026-07-08', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j2-011', employee_id: 'emp-9', store_id: 'store-1', date: '2026-07-09', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j2-012', employee_id: 'emp-9', store_id: 'store-1', date: '2026-07-10', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j2-013', employee_id: 'emp-9', store_id: 'store-1', date: '2026-07-11', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j2-014', employee_id: 'emp-9', store_id: 'store-1', date: '2026-07-12', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j2-015', employee_id: 'emp-9', store_id: 'store-1', date: '2026-07-13', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j2-016', employee_id: 'emp-9', store_id: 'store-1', date: '2026-07-14', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j2-017', employee_id: 'emp-9', store_id: 'store-1', date: '2026-07-15', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j2-018', employee_id: 'emp-9', store_id: 'store-1', date: '2026-07-16', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j2-019', employee_id: 'emp-9', store_id: 'store-1', date: '2026-07-17', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j2-020', employee_id: 'emp-9', store_id: 'store-1', date: '2026-07-18', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j2-021', employee_id: 'emp-9', store_id: 'store-1', date: '2026-07-19', start_time: '12:00', end_time: '20:00', break_duration_minutes: 60, allow_overtime: false },
  { id: 'j2-022', employee_id: 'emp-9', store_id: 'store-1', date: '2026-07-20', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j2-023', employee_id: 'emp-9', store_id: 'store-1', date: '2026-07-21', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j2-024', employee_id: 'emp-9', store_id: 'store-1', date: '2026-07-22', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j2-025', employee_id: 'emp-9', store_id: 'store-1', date: '2026-07-23', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j2-026', employee_id: 'emp-9', store_id: 'store-1', date: '2026-07-24', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j2-027', employee_id: 'emp-9', store_id: 'store-1', date: '2026-07-25', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j2-028', employee_id: 'emp-9', store_id: 'store-1', date: '2026-07-26', start_time: '12:00', end_time: '20:00', break_duration_minutes: 60, allow_overtime: false },
  { id: 'j2-029', employee_id: 'emp-9', store_id: 'store-1', date: '2026-07-27', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j2-030', employee_id: 'emp-9', store_id: 'store-1', date: '2026-07-28', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j2-031', employee_id: 'emp-9', store_id: 'store-1', date: '2026-07-29', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j2-032', employee_id: 'emp-9', store_id: 'store-1', date: '2026-07-30', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j2-033', employee_id: 'emp-9', store_id: 'store-1', date: '2026-07-31', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },

  // emp-2 (idx=2) Bruno Alves Souza — 14:00-20:00, Mon rest, Sun-off=wk3(Jul19)
  { id: 'j3-001', employee_id: 'emp-2', store_id: 'store-1', date: '2026-06-29', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j3-002', employee_id: 'emp-2', store_id: 'store-1', date: '2026-06-30', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j3-003', employee_id: 'emp-2', store_id: 'store-1', date: '2026-07-01', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j3-004', employee_id: 'emp-2', store_id: 'store-1', date: '2026-07-02', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j3-005', employee_id: 'emp-2', store_id: 'store-1', date: '2026-07-03', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j3-006', employee_id: 'emp-2', store_id: 'store-1', date: '2026-07-04', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j3-007', employee_id: 'emp-2', store_id: 'store-1', date: '2026-07-05', start_time: '12:00', end_time: '20:00', break_duration_minutes: 60, allow_overtime: false },
  { id: 'j3-008', employee_id: 'emp-2', store_id: 'store-1', date: '2026-07-06', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j3-009', employee_id: 'emp-2', store_id: 'store-1', date: '2026-07-07', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j3-010', employee_id: 'emp-2', store_id: 'store-1', date: '2026-07-08', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j3-011', employee_id: 'emp-2', store_id: 'store-1', date: '2026-07-09', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j3-012', employee_id: 'emp-2', store_id: 'store-1', date: '2026-07-10', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j3-013', employee_id: 'emp-2', store_id: 'store-1', date: '2026-07-11', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j3-014', employee_id: 'emp-2', store_id: 'store-1', date: '2026-07-12', start_time: '12:00', end_time: '20:00', break_duration_minutes: 60, allow_overtime: false },
  { id: 'j3-015', employee_id: 'emp-2', store_id: 'store-1', date: '2026-07-13', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j3-016', employee_id: 'emp-2', store_id: 'store-1', date: '2026-07-14', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j3-017', employee_id: 'emp-2', store_id: 'store-1', date: '2026-07-15', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j3-018', employee_id: 'emp-2', store_id: 'store-1', date: '2026-07-16', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j3-019', employee_id: 'emp-2', store_id: 'store-1', date: '2026-07-17', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j3-020', employee_id: 'emp-2', store_id: 'store-1', date: '2026-07-18', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j3-021', employee_id: 'emp-2', store_id: 'store-1', date: '2026-07-19', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j3-022', employee_id: 'emp-2', store_id: 'store-1', date: '2026-07-20', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j3-023', employee_id: 'emp-2', store_id: 'store-1', date: '2026-07-21', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j3-024', employee_id: 'emp-2', store_id: 'store-1', date: '2026-07-22', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j3-025', employee_id: 'emp-2', store_id: 'store-1', date: '2026-07-23', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j3-026', employee_id: 'emp-2', store_id: 'store-1', date: '2026-07-24', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j3-027', employee_id: 'emp-2', store_id: 'store-1', date: '2026-07-25', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j3-028', employee_id: 'emp-2', store_id: 'store-1', date: '2026-07-26', start_time: '12:00', end_time: '20:00', break_duration_minutes: 60, allow_overtime: false },
  { id: 'j3-029', employee_id: 'emp-2', store_id: 'store-1', date: '2026-07-27', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j3-030', employee_id: 'emp-2', store_id: 'store-1', date: '2026-07-28', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j3-031', employee_id: 'emp-2', store_id: 'store-1', date: '2026-07-29', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j3-032', employee_id: 'emp-2', store_id: 'store-1', date: '2026-07-30', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j3-033', employee_id: 'emp-2', store_id: 'store-1', date: '2026-07-31', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },

  // emp-13 (idx=3) Marcos Oliveira — 10:00-16:00, Tue rest, Sun-off=wk4(Jul26)
  { id: 'j4-001', employee_id: 'emp-13', store_id: 'store-1', date: '2026-06-29', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j4-002', employee_id: 'emp-13', store_id: 'store-1', date: '2026-06-30', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j4-003', employee_id: 'emp-13', store_id: 'store-1', date: '2026-07-01', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j4-004', employee_id: 'emp-13', store_id: 'store-1', date: '2026-07-02', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j4-005', employee_id: 'emp-13', store_id: 'store-1', date: '2026-07-03', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j4-006', employee_id: 'emp-13', store_id: 'store-1', date: '2026-07-04', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j4-007', employee_id: 'emp-13', store_id: 'store-1', date: '2026-07-05', start_time: '12:00', end_time: '20:00', break_duration_minutes: 60, allow_overtime: false },
  { id: 'j4-008', employee_id: 'emp-13', store_id: 'store-1', date: '2026-07-06', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j4-009', employee_id: 'emp-13', store_id: 'store-1', date: '2026-07-07', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j4-010', employee_id: 'emp-13', store_id: 'store-1', date: '2026-07-08', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j4-011', employee_id: 'emp-13', store_id: 'store-1', date: '2026-07-09', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j4-012', employee_id: 'emp-13', store_id: 'store-1', date: '2026-07-10', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j4-013', employee_id: 'emp-13', store_id: 'store-1', date: '2026-07-11', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j4-014', employee_id: 'emp-13', store_id: 'store-1', date: '2026-07-12', start_time: '12:00', end_time: '20:00', break_duration_minutes: 60, allow_overtime: false },
  { id: 'j4-015', employee_id: 'emp-13', store_id: 'store-1', date: '2026-07-13', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j4-016', employee_id: 'emp-13', store_id: 'store-1', date: '2026-07-14', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j4-017', employee_id: 'emp-13', store_id: 'store-1', date: '2026-07-15', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j4-018', employee_id: 'emp-13', store_id: 'store-1', date: '2026-07-16', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j4-019', employee_id: 'emp-13', store_id: 'store-1', date: '2026-07-17', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j4-020', employee_id: 'emp-13', store_id: 'store-1', date: '2026-07-18', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j4-021', employee_id: 'emp-13', store_id: 'store-1', date: '2026-07-19', start_time: '12:00', end_time: '20:00', break_duration_minutes: 60, allow_overtime: false },
  { id: 'j4-022', employee_id: 'emp-13', store_id: 'store-1', date: '2026-07-20', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j4-023', employee_id: 'emp-13', store_id: 'store-1', date: '2026-07-21', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j4-024', employee_id: 'emp-13', store_id: 'store-1', date: '2026-07-22', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j4-025', employee_id: 'emp-13', store_id: 'store-1', date: '2026-07-23', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j4-026', employee_id: 'emp-13', store_id: 'store-1', date: '2026-07-24', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j4-027', employee_id: 'emp-13', store_id: 'store-1', date: '2026-07-25', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j4-028', employee_id: 'emp-13', store_id: 'store-1', date: '2026-07-26', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j4-029', employee_id: 'emp-13', store_id: 'store-1', date: '2026-07-27', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j4-030', employee_id: 'emp-13', store_id: 'store-1', date: '2026-07-28', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j4-031', employee_id: 'emp-13', store_id: 'store-1', date: '2026-07-29', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j4-032', employee_id: 'emp-13', store_id: 'store-1', date: '2026-07-30', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j4-033', employee_id: 'emp-13', store_id: 'store-1', date: '2026-07-31', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },

  // emp-3 (idx=4) Elena Santos Dias — 16:00-22:00, Mon rest, Sun-off=wk1(Jul5)
  { id: 'j5-001', employee_id: 'emp-3', store_id: 'store-1', date: '2026-06-29', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j5-002', employee_id: 'emp-3', store_id: 'store-1', date: '2026-06-30', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j5-003', employee_id: 'emp-3', store_id: 'store-1', date: '2026-07-01', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j5-004', employee_id: 'emp-3', store_id: 'store-1', date: '2026-07-02', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j5-005', employee_id: 'emp-3', store_id: 'store-1', date: '2026-07-03', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j5-006', employee_id: 'emp-3', store_id: 'store-1', date: '2026-07-04', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j5-007', employee_id: 'emp-3', store_id: 'store-1', date: '2026-07-05', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j5-008', employee_id: 'emp-3', store_id: 'store-1', date: '2026-07-06', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j5-009', employee_id: 'emp-3', store_id: 'store-1', date: '2026-07-07', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j5-010', employee_id: 'emp-3', store_id: 'store-1', date: '2026-07-08', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j5-011', employee_id: 'emp-3', store_id: 'store-1', date: '2026-07-09', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j5-012', employee_id: 'emp-3', store_id: 'store-1', date: '2026-07-10', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j5-013', employee_id: 'emp-3', store_id: 'store-1', date: '2026-07-11', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j5-014', employee_id: 'emp-3', store_id: 'store-1', date: '2026-07-12', start_time: '12:00', end_time: '20:00', break_duration_minutes: 60, allow_overtime: false },
  { id: 'j5-015', employee_id: 'emp-3', store_id: 'store-1', date: '2026-07-13', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j5-016', employee_id: 'emp-3', store_id: 'store-1', date: '2026-07-14', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j5-017', employee_id: 'emp-3', store_id: 'store-1', date: '2026-07-15', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j5-018', employee_id: 'emp-3', store_id: 'store-1', date: '2026-07-16', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j5-019', employee_id: 'emp-3', store_id: 'store-1', date: '2026-07-17', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j5-020', employee_id: 'emp-3', store_id: 'store-1', date: '2026-07-18', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j5-021', employee_id: 'emp-3', store_id: 'store-1', date: '2026-07-19', start_time: '12:00', end_time: '20:00', break_duration_minutes: 60, allow_overtime: false },
  { id: 'j5-022', employee_id: 'emp-3', store_id: 'store-1', date: '2026-07-20', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j5-023', employee_id: 'emp-3', store_id: 'store-1', date: '2026-07-21', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j5-024', employee_id: 'emp-3', store_id: 'store-1', date: '2026-07-22', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j5-025', employee_id: 'emp-3', store_id: 'store-1', date: '2026-07-23', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j5-026', employee_id: 'emp-3', store_id: 'store-1', date: '2026-07-24', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j5-027', employee_id: 'emp-3', store_id: 'store-1', date: '2026-07-25', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j5-028', employee_id: 'emp-3', store_id: 'store-1', date: '2026-07-26', start_time: '12:00', end_time: '20:00', break_duration_minutes: 60, allow_overtime: false },
  { id: 'j5-029', employee_id: 'emp-3', store_id: 'store-1', date: '2026-07-27', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j5-030', employee_id: 'emp-3', store_id: 'store-1', date: '2026-07-28', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j5-031', employee_id: 'emp-3', store_id: 'store-1', date: '2026-07-29', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j5-032', employee_id: 'emp-3', store_id: 'store-1', date: '2026-07-30', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j5-033', employee_id: 'emp-3', store_id: 'store-1', date: '2026-07-31', start_time: '16:00', end_time: '22:00', break_duration_minutes: 15, allow_overtime: false },

  // emp-4 (idx=5) Gabriela Melo Reis — 14:00-20:00, Tue rest, Sun-off=wk2(Jul12)
  { id: 'j6-001', employee_id: 'emp-4', store_id: 'store-1', date: '2026-06-29', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j6-002', employee_id: 'emp-4', store_id: 'store-1', date: '2026-06-30', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j6-003', employee_id: 'emp-4', store_id: 'store-1', date: '2026-07-01', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j6-004', employee_id: 'emp-4', store_id: 'store-1', date: '2026-07-02', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j6-005', employee_id: 'emp-4', store_id: 'store-1', date: '2026-07-03', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j6-006', employee_id: 'emp-4', store_id: 'store-1', date: '2026-07-04', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j6-007', employee_id: 'emp-4', store_id: 'store-1', date: '2026-07-05', start_time: '12:00', end_time: '20:00', break_duration_minutes: 60, allow_overtime: false },
  { id: 'j6-008', employee_id: 'emp-4', store_id: 'store-1', date: '2026-07-06', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j6-009', employee_id: 'emp-4', store_id: 'store-1', date: '2026-07-07', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j6-010', employee_id: 'emp-4', store_id: 'store-1', date: '2026-07-08', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j6-011', employee_id: 'emp-4', store_id: 'store-1', date: '2026-07-09', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j6-012', employee_id: 'emp-4', store_id: 'store-1', date: '2026-07-10', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j6-013', employee_id: 'emp-4', store_id: 'store-1', date: '2026-07-11', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j6-014', employee_id: 'emp-4', store_id: 'store-1', date: '2026-07-12', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j6-015', employee_id: 'emp-4', store_id: 'store-1', date: '2026-07-13', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j6-016', employee_id: 'emp-4', store_id: 'store-1', date: '2026-07-14', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j6-017', employee_id: 'emp-4', store_id: 'store-1', date: '2026-07-15', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j6-018', employee_id: 'emp-4', store_id: 'store-1', date: '2026-07-16', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j6-019', employee_id: 'emp-4', store_id: 'store-1', date: '2026-07-17', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j6-020', employee_id: 'emp-4', store_id: 'store-1', date: '2026-07-18', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j6-021', employee_id: 'emp-4', store_id: 'store-1', date: '2026-07-19', start_time: '12:00', end_time: '20:00', break_duration_minutes: 60, allow_overtime: false },
  { id: 'j6-022', employee_id: 'emp-4', store_id: 'store-1', date: '2026-07-20', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j6-023', employee_id: 'emp-4', store_id: 'store-1', date: '2026-07-21', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j6-024', employee_id: 'emp-4', store_id: 'store-1', date: '2026-07-22', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j6-025', employee_id: 'emp-4', store_id: 'store-1', date: '2026-07-23', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j6-026', employee_id: 'emp-4', store_id: 'store-1', date: '2026-07-24', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j6-027', employee_id: 'emp-4', store_id: 'store-1', date: '2026-07-25', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j6-028', employee_id: 'emp-4', store_id: 'store-1', date: '2026-07-26', start_time: '12:00', end_time: '20:00', break_duration_minutes: 60, allow_overtime: false },
  { id: 'j6-029', employee_id: 'emp-4', store_id: 'store-1', date: '2026-07-27', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j6-030', employee_id: 'emp-4', store_id: 'store-1', date: '2026-07-28', start_time: '00:00', end_time: '00:00', break_duration_minutes: 0, allow_overtime: false },
  { id: 'j6-031', employee_id: 'emp-4', store_id: 'store-1', date: '2026-07-29', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j6-032', employee_id: 'emp-4', store_id: 'store-1', date: '2026-07-30', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
  { id: 'j6-033', employee_id: 'emp-4', store_id: 'store-1', date: '2026-07-31', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false },
];
