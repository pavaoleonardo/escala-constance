export interface Store {
  id: string;
  name: string;
  operating_hours: {
    weekday: { open: string; close: string };
    sunday: { open: string; close: string };
  };
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  home_store_id: string;
  weekly_hours_contract: number;
  active: boolean;
}

export interface Shift {
  id: string;
  employee_id: string;
  store_id: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  break_duration_minutes: number;
  allow_overtime: boolean;
}

export interface ScheduleAlert {
  type: 'clt' | 'coverage' | 'conflict' | 'sunday';
  message: string;
  employeeId?: string;
  storeId?: string;
  date?: string;
}
