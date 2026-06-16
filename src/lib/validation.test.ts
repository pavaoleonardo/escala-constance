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
        sunday: { open: '12:00', close: '21:00' }
      }
    }
  ];

  const mockEmployees: Employee[] = [
    { id: 'emp-1', name: 'Ana Silva', role: 'Gerente', home_store_id: 'st-1', weekly_hours_contract: 44, active: true },
    { id: 'emp-2', name: 'Bruno Caixa', role: 'Caixa', home_store_id: 'st-1', weekly_hours_contract: 44, active: true }
  ];

  // Test Case 1: Inter-journey rest violation (< 11h rest)
  // Bruno works Monday until 22:00 and Tuesday starting at 08:00 (10 hours rest)
  const shifts1: Shift[] = [
    { id: 's1', employee_id: 'emp-2', store_id: 'st-1', date: '2026-06-08', start_time: '14:00', end_time: '22:00', break_duration_minutes: 60, allow_overtime: false },
    { id: 's2', employee_id: 'emp-2', store_id: 'st-1', date: '2026-06-09', start_time: '08:00', end_time: '16:00', break_duration_minutes: 60, allow_overtime: false }
  ];

  const currentWeekStart = new Date('2026-06-08T12:00:00');
  const alerts1 = runAllValidations(mockStores, mockEmployees, shifts1, currentWeekStart);

  const hasRestViolation = alerts1.some(a => a.type === 'clt' && a.message.includes('Descanso interjornada insuficiente'));
  console.log(hasRestViolation ? "✅ Teste 1 (Descanso Interjornada) PASSED" : "❌ Teste 1 (Descanso Interjornada) FAILED");

  // Test Case 2: Store Coverage gaps (Loja A has no Cashier)
  // Only Manager scheduled on Monday. No cashier scheduled.
  const shifts2: Shift[] = [
    { id: 's3', employee_id: 'emp-1', store_id: 'st-1', date: '2026-06-08', start_time: '10:00', end_time: '18:00', break_duration_minutes: 60, allow_overtime: false }
  ];
  
  const alerts2 = runAllValidations(mockStores, mockEmployees, shifts2, currentWeekStart);
  const hasCoverageGap = alerts2.some(a => a.type === 'coverage' && a.message.includes('sem Caixa'));
  console.log(hasCoverageGap ? "✅ Teste 2 (Falta de Caixa/Cobertura) PASSED" : "❌ Teste 2 (Falta de Caixa/Cobertura) FAILED");

  // Test Case 3: Overtime Limit Exceeded (Shift > 8h without overtime allowed flag)
  const shifts3: Shift[] = [
    { id: 's4', employee_id: 'emp-1', store_id: 'st-1', date: '2026-06-08', start_time: '10:00', end_time: '20:00', break_duration_minutes: 60, allow_overtime: false } // 9 hours work
  ];
  const alerts3 = runAllValidations(mockStores, mockEmployees, shifts3, currentWeekStart);
  const hasOvertimeAlert = alerts3.some(a => a.type === 'clt' && a.message.includes('excede o limite diário'));
  console.log(hasOvertimeAlert ? "✅ Teste 3 (Limite de Horas Diárias) PASSED" : "❌ Teste 3 (Limite de Horas Diárias) FAILED");

  console.log("=== FIM DOS TESTES ===");
}

// Check if running directly in node environment
if (typeof require !== 'undefined' && require.main === module) {
  runTests();
}
export { runTests };
