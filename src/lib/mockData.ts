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
  { id: 'emp-1', name: 'Estela Cristina da Rocha', role: 'Vendedora', home_store_id: 'store-1', weekly_hours_contract: 44, active: true, default_shift: 'morning' },
  { id: 'emp-9', name: 'Lenilda Chalegre Muniz Matias', role: 'Vendedora', home_store_id: 'store-1', weekly_hours_contract: 44, active: true, default_shift: 'evening' },
  { id: 'emp-2', name: 'Caroline Salvador Pazim', role: 'Vendedora', home_store_id: 'store-1', weekly_hours_contract: 44, active: true, default_shift: 'intermediate' },
  { id: 'emp-13', name: 'Stefanny', role: 'Vendedora', home_store_id: 'store-1', weekly_hours_contract: 44, active: true, default_shift: 'morning' },
  { id: 'emp-3', name: 'Karimme Gabriel Galante', role: 'Vendedora', home_store_id: 'store-1', weekly_hours_contract: 44, active: true, default_shift: 'evening' },
  
  // Store 2: Shopping Parque das Bandeiras
  { id: 'emp-14', name: 'Patricia Lima', role: 'Vendedora Supervisora', home_store_id: 'store-2', weekly_hours_contract: 44, active: true, default_shift: 'morning' },
  { id: 'emp-5', name: 'Fernanda Costa Lima', role: 'Vendedora', home_store_id: 'store-2', weekly_hours_contract: 44, active: true, default_shift: 'evening' },
  { id: 'emp-6', name: 'Camila Rocha Pinto', role: 'Vendedora', home_store_id: 'store-2', weekly_hours_contract: 44, active: true, default_shift: 'morning' },
  { id: 'emp-10', name: 'Diego Ramos Cardoso', role: 'Vendedora', home_store_id: 'store-2', weekly_hours_contract: 44, active: true, default_shift: 'intermediate' },
  { id: 'emp-7', name: 'Helena Lima Ferraz', role: 'Vendedora', home_store_id: 'store-2', weekly_hours_contract: 44, active: true, default_shift: 'evening' },
  { id: 'emp-8', name: 'Isabela Azevedo', role: 'Vendedora', home_store_id: 'store-2', weekly_hours_contract: 44, active: true, default_shift: 'intermediate' },

  // Store 3: Shopping Iguatemi Campinas
  { id: 'emp-15', name: 'Raquel Mendes Ferreira', role: 'Vendedora Supervisora', home_store_id: 'store-3', weekly_hours_contract: 44, active: true, default_shift: 'morning' },
  { id: 'emp-16', name: 'Tatiana Borges Costa', role: 'Vendedora', home_store_id: 'store-3', weekly_hours_contract: 44, active: true, default_shift: 'evening' },
  { id: 'emp-17', name: 'Vanessa Ribeiro Alves', role: 'Vendedora', home_store_id: 'store-3', weekly_hours_contract: 44, active: true, default_shift: 'intermediate' },
  { id: 'emp-18', name: 'Amanda Carvalho Souza', role: 'Vendedora', home_store_id: 'store-3', weekly_hours_contract: 44, active: true, default_shift: 'morning' },
  { id: 'emp-19', name: 'Bianca Farias Lima', role: 'Vendedora', home_store_id: 'store-3', weekly_hours_contract: 44, active: true, default_shift: 'evening' },
  { id: 'emp-20', name: 'Carolina Duarte Pereira', role: 'Vendedora', home_store_id: 'store-3', weekly_hours_contract: 44, active: true, default_shift: 'intermediate' }
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
  { id: 's-109', employee_id: 'emp-20', store_id: 'store-3', date: '2026-06-12', start_time: '14:00', end_time: '20:00', break_duration_minutes: 15, allow_overtime: false }
];
