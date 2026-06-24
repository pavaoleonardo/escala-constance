import { supabase, isDemoMode } from './supabaseClient';
import { Store, Employee, Shift } from './types';
import { defaultStores, defaultEmployees, defaultShifts } from './mockData';

const STORAGE_KEYS = {
  STORES: 'varejo_stores',
  EMPLOYEES: 'varejo_employees',
  SHIFTS: 'varejo_shifts'
};

// Helper: load from localStorage
function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const val = localStorage.getItem(key);
  if (!val) return fallback;
  try {
    return JSON.parse(val) as T;
  } catch {
    return fallback;
  }
}

// Helper: save to localStorage
function saveLocal(key: string, data: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

const DATA_VERSION_KEY = 'varejo_data_version';
const CURRENT_DATA_VERSION = 7; // Reseeding employees with real Polo Shopping Indaiatuba names

function checkAndMigrateData() {
  if (typeof window === 'undefined') return;

  // Seamless migration from old constance_ keys to varejo_ keys
  const oldStores = localStorage.getItem('constance_stores');
  const newStores = localStorage.getItem(STORAGE_KEYS.STORES);
  if (oldStores && !newStores) {
    localStorage.setItem(STORAGE_KEYS.STORES, oldStores);
    
    const oldEmployees = localStorage.getItem('constance_employees');
    if (oldEmployees) localStorage.setItem(STORAGE_KEYS.EMPLOYEES, oldEmployees);
    
    const oldShifts = localStorage.getItem('constance_shifts');
    if (oldShifts) localStorage.setItem(STORAGE_KEYS.SHIFTS, oldShifts);
    
    const oldVersion = localStorage.getItem('constance_data_version');
    if (oldVersion) localStorage.setItem(DATA_VERSION_KEY, oldVersion);
    
    const oldChanged = localStorage.getItem('constance_user_has_changed');
    if (oldChanged) localStorage.setItem('varejo_user_has_changed', oldChanged);
  }

  const version = localStorage.getItem(DATA_VERSION_KEY);
  if (!version || parseInt(version, 10) < CURRENT_DATA_VERSION) {
    localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION.toString());
    localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(defaultStores));
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(defaultEmployees));
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(defaultShifts));
  }
}

// Load Stores
export async function getStores(): Promise<Store[]> {
  checkAndMigrateData();
  if (isDemoMode || !supabase) {
    let stores = getLocal<Store[]>(STORAGE_KEYS.STORES, []);
    if (stores.length === 0) {
      stores = defaultStores;
      saveLocal(STORAGE_KEYS.STORES, stores);
    }
    return stores;
  }

  const { data, error } = await supabase.from('lojas').select('*');
  if (error) {
    console.error("Erro ao buscar lojas do Supabase, usando fallback:", error);
    return defaultStores;
  }
  return data as Store[];
}

// Load Employees
export async function getEmployees(): Promise<Employee[]> {
  checkAndMigrateData();
  if (isDemoMode || !supabase) {
    let employees = getLocal<Employee[]>(STORAGE_KEYS.EMPLOYEES, []);
    if (employees.length === 0) {
      employees = defaultEmployees;
      saveLocal(STORAGE_KEYS.EMPLOYEES, employees);
    }
    return employees;
  }

  const { data, error } = await supabase.from('funcionarios').select('*');
  if (error) {
    console.error("Erro ao buscar funcionários do Supabase:", error);
    return getLocal<Employee[]>(STORAGE_KEYS.EMPLOYEES, defaultEmployees);
  }
  return data as Employee[];
}

// Clean up duplicate shifts from the database
export async function cleanDuplicateShifts(shifts: Shift[]): Promise<Shift[]> {
  const seen = new Map<string, Shift>();
  const duplicatesToDelete: string[] = [];

  shifts.forEach(s => {
    const key = `${s.employee_id}_${s.date}`;
    if (seen.has(key)) {
      const prev = seen.get(key)!;
      duplicatesToDelete.push(prev.id);
    }
    seen.set(key, s);
  });

  if (duplicatesToDelete.length > 0) {
    console.log(`[Database Cleanup] Cleaning up ${duplicatesToDelete.length} duplicate shifts...`);
    if (isDemoMode || !supabase) {
      let currentShifts = getLocal<Shift[]>(STORAGE_KEYS.SHIFTS, []);
      currentShifts = currentShifts.filter(s => !duplicatesToDelete.includes(s.id));
      saveLocal(STORAGE_KEYS.SHIFTS, currentShifts);
    } else {
      await supabase.from('turnos').delete().in('id', duplicatesToDelete);
    }
    return Array.from(seen.values());
  }

  return shifts;
}

// Load Shifts
export async function getShifts(): Promise<Shift[]> {
  checkAndMigrateData();
  let shifts: Shift[] = [];
  if (isDemoMode || !supabase) {
    shifts = getLocal<Shift[]>(STORAGE_KEYS.SHIFTS, []);
    if (shifts.length === 0) {
      shifts = defaultShifts;
      saveLocal(STORAGE_KEYS.SHIFTS, shifts);
    }
  } else {
    const { data, error } = await supabase.from('turnos').select('*');
    if (error) {
      console.error("Erro ao buscar turnos do Supabase:", error);
      shifts = getLocal<Shift[]>(STORAGE_KEYS.SHIFTS, defaultShifts);
    } else {
      shifts = data as Shift[];
    }
  }

  return cleanDuplicateShifts(shifts);
}

// Save/Update Shift
export async function saveShift(shift: Omit<Shift, 'id'> & { id?: string }): Promise<Shift> {
  const isNew = !shift.id;
  const shiftId = shift.id || 'shift-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  const completedShift: Shift = { ...shift, id: shiftId };

  if (isDemoMode || !supabase) {
    let shifts = await getShifts();
    if (isNew) {
      // Remove any existing shift for same employee and date to prevent duplicates
      shifts = shifts.filter(s => !(s.employee_id === shift.employee_id && s.date === shift.date));
      shifts.push(completedShift);
    } else {
      shifts = shifts.map(s => s.id === shiftId ? completedShift : s);
    }
    saveLocal(STORAGE_KEYS.SHIFTS, shifts);
    return completedShift;
  }

  if (isNew) {
    // To prevent duplicate insertion in Supabase, first delete any shift on the same date/employee
    await supabase.from('turnos').delete().eq('employee_id', shift.employee_id).eq('date', shift.date);

    // Insert into Supabase
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...supabaseInsertData } = completedShift; // Let Supabase auto-generate UUID
    const { data, error } = await supabase.from('turnos').insert([supabaseInsertData]).select();
    if (error) throw new Error(error.message);
    return data[0] as Shift;
  } else {
    // Update Supabase
    const { data, error } = await supabase.from('turnos').update(completedShift).eq('id', shiftId).select();
    if (error) throw new Error(error.message);
    return data[0] as Shift;
  }
}

// Delete Shift
export async function deleteShift(id: string): Promise<void> {
  if (isDemoMode || !supabase) {
    let shifts = await getShifts();
    shifts = shifts.filter(s => s.id !== id);
    saveLocal(STORAGE_KEYS.SHIFTS, shifts);
    return;
  }

  const { error } = await supabase.from('turnos').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// Batch Update Shifts (Optimized for AI Scheduler)
export async function updateShiftsBatch(
  toDeleteIds: string[],
  toSave: Omit<Shift, 'id'>[]
): Promise<void> {
  if (isDemoMode || !supabase) {
    let shifts = await getShifts();
    
    // Perform delete
    if (toDeleteIds.length > 0) {
      shifts = shifts.filter(s => !toDeleteIds.includes(s.id));
    }
    
    // Perform insert
    if (toSave.length > 0) {
      // Create a set of "employee_id:date" keys for the new shifts
      const newKeys = new Set(toSave.map(s => `${s.employee_id}_${s.date}`));
      
      // Filter out any existing shifts that have a matching key
      shifts = shifts.filter(s => !newKeys.has(`${s.employee_id}_${s.date}`));

      const timestamp = Date.now();
      const completedShifts = toSave.map((s, idx) => ({
        ...s,
        id: `shift-${timestamp}-${idx}-${Math.floor(Math.random() * 1000)}`
      }));
      shifts.push(...completedShifts);
    }
    
    saveLocal(STORAGE_KEYS.SHIFTS, shifts);
    return;
  }

  // Supabase implementation
  if (toDeleteIds.length > 0) {
    const { error: delError } = await supabase.from('turnos').delete().in('id', toDeleteIds);
    if (delError) throw new Error(delError.message);
  }
  
  if (toSave.length > 0) {
    // Delete any existing shifts for these employees on these dates to ensure no duplicates
    const employeeIds = Array.from(new Set(toSave.map(s => s.employee_id)));
    const dates = Array.from(new Set(toSave.map(s => s.date)));
    const { error: delError } = await supabase
      .from('turnos')
      .delete()
      .in('employee_id', employeeIds)
      .in('date', dates);
    if (delError) throw new Error(delError.message);

    const adjusted = toSave.map(s => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...rest } = s as any;
      return rest;
    });
    const { error: insError } = await supabase.from('turnos').insert(adjusted);
    if (insError) throw new Error(insError.message);
  }
}

// Save/Update Employee
export async function saveEmployee(employee: Omit<Employee, 'id'> & { id?: string }): Promise<Employee> {
  const isNew = !employee.id;
  const employeeId = employee.id || 'emp-' + Date.now();
  const completedEmployee: Employee = { ...employee, id: employeeId };

  if (isDemoMode || !supabase) {
    let employees = await getEmployees();
    if (isNew) {
      employees.push(completedEmployee);
    } else {
      employees = employees.map(e => e.id === employeeId ? completedEmployee : e);
    }
    saveLocal(STORAGE_KEYS.EMPLOYEES, employees);
    return completedEmployee;
  }

  if (isNew) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...supabaseInsertData } = completedEmployee;
    const { data, error } = await supabase.from('funcionarios').insert([supabaseInsertData]).select();
    if (error) throw new Error(error.message);
    return data[0] as Employee;
  } else {
    const { data, error } = await supabase.from('funcionarios').update(completedEmployee).eq('id', employeeId).select();
    if (error) throw new Error(error.message);
    return data[0] as Employee;
  }
}

// Delete Employee
export async function deleteEmployee(id: string): Promise<void> {
  if (isDemoMode || !supabase) {
    let employees = await getEmployees();
    employees = employees.filter(e => e.id !== id);
    saveLocal(STORAGE_KEYS.EMPLOYEES, employees);
    return;
  }

  const { error } = await supabase.from('funcionarios').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// Reset data back to default values
export async function resetToMockData(): Promise<void> {
  if (isDemoMode || !supabase) {
    saveLocal(STORAGE_KEYS.STORES, defaultStores);
    saveLocal(STORAGE_KEYS.EMPLOYEES, defaultEmployees);
    saveLocal(STORAGE_KEYS.SHIFTS, defaultShifts);
    return;
  }

  // Warning: This deletes everything in Supabase. Only for testing / database init.
  await supabase.from('turnos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('funcionarios').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('lojas').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Insert Lojas
  const { data: insertedLojas } = await supabase.from('lojas').insert(
    defaultStores.map(({ id, ...rest }) => rest)
  ).select();

  if (insertedLojas && insertedLojas.length > 0) {
    // Map old store ids to new database uuids
    const storeMap: Record<string, string> = {};
    defaultStores.forEach((oldStore, index) => {
      storeMap[oldStore.id] = insertedLojas[index].id;
    });

    // Adjust employees and insert
    const adjustedEmployees = defaultEmployees.map(({ id, home_store_id, ...rest }) => ({
      ...rest,
      home_store_id: storeMap[home_store_id] || null
    }));
    
    const { data: insertedEmployees } = await supabase.from('funcionarios').insert(adjustedEmployees).select();
    
    if (insertedEmployees && insertedEmployees.length > 0) {
      const empMap: Record<string, string> = {};
      defaultEmployees.forEach((oldEmp, index) => {
        empMap[oldEmp.id] = insertedEmployees[index].id;
      });

      // Adjust shifts and insert
      const adjustedShifts = defaultShifts.map(({ id, employee_id, store_id, ...rest }) => ({
        ...rest,
        employee_id: empMap[employee_id],
        store_id: storeMap[store_id]
      })).filter(s => s.employee_id && s.store_id); // ensure valid references

      await supabase.from('turnos').insert(adjustedShifts);
    }
  }
}

// Save/Update Store
export async function saveStore(store: Omit<Store, 'id'> & { id?: string }): Promise<Store> {
  const isNew = !store.id;
  const storeId = store.id || 'store-' + Date.now();
  const completedStore: Store = { ...store, id: storeId };

  if (isDemoMode || !supabase) {
    let stores = await getStores();
    if (isNew) {
      stores.push(completedStore);
    } else {
      stores = stores.map(s => s.id === storeId ? completedStore : s);
    }
    saveLocal(STORAGE_KEYS.STORES, stores);
    return completedStore;
  }

  if (isNew) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...supabaseInsertData } = completedStore;
    const { data, error } = await supabase.from('lojas').insert([supabaseInsertData]).select();
    if (error) throw new Error(error.message);
    return data[0] as Store;
  } else {
    const { data, error } = await supabase.from('lojas').update(completedStore).eq('id', storeId).select();
    if (error) throw new Error(error.message);
    return data[0] as Store;
  }
}

// Delete Store
export async function deleteStore(id: string): Promise<void> {
  if (isDemoMode || !supabase) {
    let stores = await getStores();
    stores = stores.filter(s => s.id !== id);
    saveLocal(STORAGE_KEYS.STORES, stores);
    return;
  }

  const { error } = await supabase.from('lojas').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// Setup realtime subscriptions
export function subscribeToRealtime(
  onTableChange: () => void
): { unsubscribe: () => void } | null {
  if (isDemoMode || !supabase) return null;

  const client = supabase;
  const channel = client
    .channel('escala-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'turnos' }, () => {
      onTableChange();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'funcionarios' }, () => {
      onTableChange();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'lojas' }, () => {
      onTableChange();
    })
    .subscribe();

  return {
    unsubscribe: () => {
      client.removeChannel(channel);
    }
  };
}
