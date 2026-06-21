import { runAllValidations } from './validation';
import { Store, Employee, Shift } from './types';

// Simple lightweight test runner
function runTests() {
  console.log("=== INICIANDO TESTES DA ESCOLA VAREJO ===");

  const mockStores: Store[] = [
    {
      id: 'st-1',
      name: 'Loja Teste A',
      operating_hours: {
        weekday: { open: '10:00', close: '22:00' },
        sunday: { open: '12:00', close: '20:00' }
      }
    }
  ];

  const mockEmployees: Employee[] = [
    { id: 'emp-1', name: 'Ana Silva', role: 'Gerente', home_store_id: 'st-1', weekly_hours_contract: 44, active: true },
    { id: 'emp-2', name: 'Bruno Caixa', role: 'Caixa', home_store_id: 'st-1', weekly_hours_contract: 44, active: true }
  ];

  const currentWeekStart = new Date('2026-06-08T12:00:00');

  // Test Case 1: Inter-journey rest violation (< 11h rest)
  // Bruno works Monday until 22:00 and Tuesday starting at 08:00 (10 hours rest)
  const shifts1: Shift[] = [
    { id: 's1', employee_id: 'emp-2', store_id: 'st-1', date: '2026-06-08', start_time: '14:00', end_time: '22:00', break_duration_minutes: 60, allow_overtime: false },
    { id: 's2', employee_id: 'emp-2', store_id: 'st-1', date: '2026-06-09', start_time: '08:00', end_time: '16:00', break_duration_minutes: 60, allow_overtime: false }
  ];

  const alerts1 = runAllValidations(mockStores, mockEmployees, shifts1, currentWeekStart);
  const hasRestViolation = alerts1.some(a => a.type === 'clt' && a.message.includes('descanso interjornada de apenas'));
  console.log(hasRestViolation ? "✅ Teste 1 (Descanso Interjornada) PASSED" : "❌ Teste 1 (Descanso Interjornada) FAILED");

  // Test Case 2: DSR violation (working 7 days straight without a rest day)
  const shifts2: Shift[] = [
    { id: 's2_1', employee_id: 'emp-1', store_id: 'st-1', date: '2026-06-08', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
    { id: 's2_2', employee_id: 'emp-1', store_id: 'st-1', date: '2026-06-09', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
    { id: 's2_3', employee_id: 'emp-1', store_id: 'st-1', date: '2026-06-10', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
    { id: 's2_4', employee_id: 'emp-1', store_id: 'st-1', date: '2026-06-11', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
    { id: 's2_5', employee_id: 'emp-1', store_id: 'st-1', date: '2026-06-12', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
    { id: 's2_6', employee_id: 'emp-1', store_id: 'st-1', date: '2026-06-13', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false },
    { id: 's2_7', employee_id: 'emp-1', store_id: 'st-1', date: '2026-06-14', start_time: '10:00', end_time: '16:00', break_duration_minutes: 15, allow_overtime: false }
  ];
  
  const alerts2 = runAllValidations(mockStores, mockEmployees, shifts2, currentWeekStart);
  const hasDSRAlert = alerts2.some(a => a.type === 'clt' && a.message.includes('não tem Descanso Semanal Remunerado'));
  console.log(hasDSRAlert ? "✅ Teste 2 (DSR Violado 7 Dias) PASSED" : "❌ Teste 2 (DSR Violado 7 Dias) FAILED");

  // Test Case 3: Daily Limit violation (> 10h worked)
  const shifts3: Shift[] = [
    { id: 's3_1', employee_id: 'emp-1', store_id: 'st-1', date: '2026-06-08', start_time: '08:00', end_time: '20:00', break_duration_minutes: 60, allow_overtime: false } // 12h elapsed - 1h break = 11h worked (> 10h limit)
  ];
  const alerts3 = runAllValidations(mockStores, mockEmployees, shifts3, currentWeekStart);
  const hasDailyLimitAlert = alerts3.some(a => a.type === 'clt' && a.message.includes('excede 10h diárias'));
  console.log(hasDailyLimitAlert ? "✅ Teste 3 (Limite 10h Diárias) PASSED" : "❌ Teste 3 (Limite 10h Diárias) FAILED");

  console.log("=== FIM DOS TESTES ===");
}

// Check if running directly in node environment
if (typeof require !== 'undefined' && require.main === module) {
  runTests();
}
export { runTests };
