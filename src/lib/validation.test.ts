import { runAllValidations, runMonthlyValidations } from './validation';
import { Store, Employee, Shift } from './types';

// Simple lightweight test runner
function runTests() {
  console.log('=== INICIANDO TESTES DA ESCOLA VAREJO ===');

  const mockStores: Store[] = [
    {
      id: 'st-1',
      name: 'Loja Teste A',
      operating_hours: {
        weekday: { open: '10:00', close: '22:00' },
        sunday: { open: '12:00', close: '20:00' },
      },
    },
  ];

  const mockEmployees: Employee[] = [
    {
      id: 'emp-1',
      name: 'Ana Silva',
      role: 'Gerente',
      home_store_id: 'st-1',
      weekly_hours_contract: 44,
      active: true,
    },
    {
      id: 'emp-2',
      name: 'Bruno Caixa',
      role: 'Caixa',
      home_store_id: 'st-1',
      weekly_hours_contract: 44,
      active: true,
    },
  ];

  const currentWeekStart = new Date('2026-06-08T12:00:00');

  // Test Case 1: Inter-journey rest violation (< 11h rest)
  // Bruno works Monday until 22:00 and Tuesday starting at 08:00 (10 hours rest)
  const shifts1: Shift[] = [
    {
      id: 's1',
      employee_id: 'emp-2',
      store_id: 'st-1',
      date: '2026-06-08',
      start_time: '14:00',
      end_time: '22:00',
      break_duration_minutes: 60,
      allow_overtime: false,
    },
    {
      id: 's2',
      employee_id: 'emp-2',
      store_id: 'st-1',
      date: '2026-06-09',
      start_time: '08:00',
      end_time: '16:00',
      break_duration_minutes: 60,
      allow_overtime: false,
    },
  ];

  const alerts1 = runAllValidations(
    mockStores,
    mockEmployees,
    shifts1,
    currentWeekStart,
  );
  const hasRestViolation = alerts1.some(
    (a) =>
      a.type === 'clt' && a.message.includes('descanso interjornada de apenas'),
  );
  console.log(
    hasRestViolation
      ? '✅ Teste 1 (Descanso Interjornada) PASSED'
      : '❌ Teste 1 (Descanso Interjornada) FAILED',
  );

  // Test Case 2: DSR violation (working 7 days straight without a rest day)
  const shifts2: Shift[] = [
    {
      id: 's2_1',
      employee_id: 'emp-1',
      store_id: 'st-1',
      date: '2026-06-08',
      start_time: '10:00',
      end_time: '16:00',
      break_duration_minutes: 15,
      allow_overtime: false,
    },
    {
      id: 's2_2',
      employee_id: 'emp-1',
      store_id: 'st-1',
      date: '2026-06-09',
      start_time: '10:00',
      end_time: '16:00',
      break_duration_minutes: 15,
      allow_overtime: false,
    },
    {
      id: 's2_3',
      employee_id: 'emp-1',
      store_id: 'st-1',
      date: '2026-06-10',
      start_time: '10:00',
      end_time: '16:00',
      break_duration_minutes: 15,
      allow_overtime: false,
    },
    {
      id: 's2_4',
      employee_id: 'emp-1',
      store_id: 'st-1',
      date: '2026-06-11',
      start_time: '10:00',
      end_time: '16:00',
      break_duration_minutes: 15,
      allow_overtime: false,
    },
    {
      id: 's2_5',
      employee_id: 'emp-1',
      store_id: 'st-1',
      date: '2026-06-12',
      start_time: '10:00',
      end_time: '16:00',
      break_duration_minutes: 15,
      allow_overtime: false,
    },
    {
      id: 's2_6',
      employee_id: 'emp-1',
      store_id: 'st-1',
      date: '2026-06-13',
      start_time: '10:00',
      end_time: '16:00',
      break_duration_minutes: 15,
      allow_overtime: false,
    },
    {
      id: 's2_7',
      employee_id: 'emp-1',
      store_id: 'st-1',
      date: '2026-06-14',
      start_time: '10:00',
      end_time: '16:00',
      break_duration_minutes: 15,
      allow_overtime: false,
    },
  ];

  const alerts2 = runAllValidations(
    mockStores,
    mockEmployees,
    shifts2,
    currentWeekStart,
  );
  const hasDSRAlert = alerts2.some(
    (a) =>
      a.type === 'clt' &&
      a.message.includes('não tem Descanso Semanal Remunerado'),
  );
  console.log(
    hasDSRAlert
      ? '✅ Teste 2 (DSR Violado 7 Dias) PASSED'
      : '❌ Teste 2 (DSR Violado 7 Dias) FAILED',
  );

  // Test Case 3: Daily Limit violation (> 10h worked)
  const shifts3: Shift[] = [
    {
      id: 's3_1',
      employee_id: 'emp-1',
      store_id: 'st-1',
      date: '2026-06-08',
      start_time: '08:00',
      end_time: '20:00',
      break_duration_minutes: 60,
      allow_overtime: false,
    }, // 12h elapsed - 1h break = 11h worked (> 10h limit)
  ];
  const alerts3 = runAllValidations(
    mockStores,
    mockEmployees,
    shifts3,
    currentWeekStart,
  );
  const hasDailyLimitAlert = alerts3.some(
    (a) => a.type === 'clt' && a.message.includes('excede 10h diárias'),
  );
  console.log(
    hasDailyLimitAlert
      ? '✅ Teste 3 (Limite 10h Diárias) PASSED'
      : '❌ Teste 3 (Limite 10h Diárias) FAILED',
  );

  // Test Case 4: Sunday worked but no Monday/Tuesday/Wednesday off in the
  // FOLLOWING week (compensatory rest after a worked Sunday).
  // Employee works on Sunday (2026-06-14) and also works the following week's
  // Monday (06-15), Tuesday (06-16), and Wednesday (06-17) → should alert.
  const shifts4: Shift[] = [
    {
      id: 's4_1',
      employee_id: 'emp-1',
      store_id: 'st-1',
      date: '2026-06-14',
      start_time: '12:00',
      end_time: '20:00',
      break_duration_minutes: 60,
      allow_overtime: false,
    },
    {
      id: 's4_2',
      employee_id: 'emp-1',
      store_id: 'st-1',
      date: '2026-06-15',
      start_time: '10:00',
      end_time: '16:00',
      break_duration_minutes: 15,
      allow_overtime: false,
    },
    {
      id: 's4_3',
      employee_id: 'emp-1',
      store_id: 'st-1',
      date: '2026-06-16',
      start_time: '10:00',
      end_time: '16:00',
      break_duration_minutes: 15,
      allow_overtime: false,
    },
    {
      id: 's4_4',
      employee_id: 'emp-1',
      store_id: 'st-1',
      date: '2026-06-17',
      start_time: '10:00',
      end_time: '16:00',
      break_duration_minutes: 15,
      allow_overtime: false,
    },
  ];

  const alerts4 = runAllValidations(
    mockStores,
    mockEmployees,
    shifts4,
    currentWeekStart,
  );
  const hasSundayWorkOffAlert = alerts4.some(
    (a) =>
      a.type === 'clt' &&
      a.message.includes(
        'precisa de folga na segunda, terça ou quarta-feira da semana seguinte',
      ),
  );

  console.log(
    hasSundayWorkOffAlert
      ? '✅ Teste 4 (Folga Seg/Ter/Qua após Domingo) PASSED'
      : '❌ Teste 4 (Folga Seg/Ter/Qua após Domingo) FAILED',
  );

  // Test Case 5: Consecutive Sundays off in month (June 2026 has Sundays on 7, 14, 21, 28)
  const mockStoresMonthly: Store[] = [
    {
      id: 'st-1',
      name: 'Loja Teste A',
      operating_hours: {
        weekday: { open: '10:00', close: '22:00' },
        sunday: { open: '12:00', close: '20:00' },
      },
    },
  ];
  const mockEmployeesMonthly: Employee[] = [
    {
      id: 'emp-1',
      name: 'Ana Silva',
      role: 'Gerente',
      home_store_id: 'st-1',
      weekly_hours_contract: 44,
      active: true,
    },
  ];
  const shifts5: Shift[] = [
    {
      id: 's5_1',
      employee_id: 'emp-1',
      store_id: 'st-1',
      date: '2026-06-07',
      start_time: '00:00',
      end_time: '00:00',
      break_duration_minutes: 0,
      allow_overtime: false,
    },
    {
      id: 's5_2',
      employee_id: 'emp-1',
      store_id: 'st-1',
      date: '2026-06-14',
      start_time: '00:00',
      end_time: '00:00',
      break_duration_minutes: 0,
      allow_overtime: false,
    },
  ];
  const alerts5 = runMonthlyValidations(
    mockStoresMonthly,
    mockEmployeesMonthly,
    shifts5,
    2026,
    5,
  );
  const hasConsecutiveSundaysOffAlert = alerts5.some(
    (a) =>
      a.type === 'sunday' &&
      a.message.includes('folgou em domingos consecutivos'),
  );
  console.log(
    hasConsecutiveSundaysOffAlert
      ? '✅ Teste 5 (Domingos Consecutivos Off) PASSED'
      : '❌ Teste 5 (Domingos Consecutivos Off) FAILED',
  );

  // Test Case 6: Consecutive Sundays worked in month (June 2026 has Sundays on 7, 14)
  const shifts6: Shift[] = [
    {
      id: 's6_1',
      employee_id: 'emp-1',
      store_id: 'st-1',
      date: '2026-06-07',
      start_time: '12:00',
      end_time: '20:00',
      break_duration_minutes: 60,
      allow_overtime: false,
    },
    {
      id: 's6_2',
      employee_id: 'emp-1',
      store_id: 'st-1',
      date: '2026-06-14',
      start_time: '12:00',
      end_time: '20:00',
      break_duration_minutes: 60,
      allow_overtime: false,
    },
  ];
  const alerts6 = runMonthlyValidations(
    mockStoresMonthly,
    mockEmployeesMonthly,
    shifts6,
    2026,
    5,
  );
  const hasConsecutiveSundaysWorkedAlert = alerts6.some(
    (a) =>
      a.type === 'sunday' &&
      a.message.includes('trabalhou em domingos consecutivos'),
  );
  console.log(
    hasConsecutiveSundaysWorkedAlert
      ? '✅ Teste 6 (Domingos Consecutivos Trabalhados) PASSED'
      : '❌ Teste 6 (Domingos Consecutivos Trabalhados) FAILED',
  );

  // Test Case 7: No false positive when an employee rests one Sunday and works
  // the next (Karine scenario). Rest on 09/08, work on 16/08 → should NOT alert
  // "rested consecutive Sundays".
  const shifts7: Shift[] = [
    {
      id: 's7_1',
      employee_id: 'emp-1',
      store_id: 'st-1',
      date: '2026-08-09',
      start_time: '00:00',
      end_time: '00:00',
      break_duration_minutes: 0,
      allow_overtime: false,
    },
    {
      id: 's7_2',
      employee_id: 'emp-1',
      store_id: 'st-1',
      date: '2026-08-16',
      start_time: '12:00',
      end_time: '20:00',
      break_duration_minutes: 60,
      allow_overtime: false,
    },
  ];
  const alerts7 = runMonthlyValidations(
    mockStoresMonthly,
    mockEmployeesMonthly,
    shifts7,
    2026,
    7,
  );
  const hasFalseConsecutiveRestAlert = alerts7.some(
    (a) =>
      a.type === 'sunday' &&
      a.message.includes('folgou em domingos consecutivos'),
  );
  console.log(
    !hasFalseConsecutiveRestAlert
      ? '✅ Teste 7 (Sem Falso Positivo Domingos Consecutivos Off) PASSED'
      : '❌ Teste 7 (Sem Falso Positivo Domingos Consecutivos Off) FAILED',
  );

  // Test Case 8: Missing shift on a Sunday should NOT be treated as rest
  // (prevents false "rested consecutive Sundays" when data is incomplete).
  const shifts8: Shift[] = [
    {
      id: 's8_1',
      employee_id: 'emp-1',
      store_id: 'st-1',
      date: '2026-08-09',
      start_time: '00:00',
      end_time: '00:00',
      break_duration_minutes: 0,
      allow_overtime: false,
    },
    // No shift record for 2026-08-16 (missing data)
  ];
  const alerts8 = runMonthlyValidations(
    mockStoresMonthly,
    mockEmployeesMonthly,
    shifts8,
    2026,
    7,
  );
  const hasMissingShiftRestAlert = alerts8.some(
    (a) =>
      a.type === 'sunday' &&
      a.message.includes('folgou em domingos consecutivos'),
  );
  console.log(
    !hasMissingShiftRestAlert
      ? '✅ Teste 8 (Turno Ausente Não Conta Como Folga) PASSED'
      : '❌ Teste 8 (Turno Ausente Não Conta Como Folga) FAILED',
  );

  console.log('=== FIM DOS TESTES ===');
}


// Check if running directly in node environment
if (typeof require !== 'undefined' && require.main === module) {
  runTests();
}
export { runTests };
