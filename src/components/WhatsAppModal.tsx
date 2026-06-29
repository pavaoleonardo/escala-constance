import React, { useState, useEffect } from 'react';
import { Store, Employee, Shift } from '../lib/types';
import { formatToDayMonth, getUniqueShifts, isDateInMonth } from '../lib/validation';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  stores: Store[];
  employees: Employee[];
  shifts: Shift[];
  monthlyWeeks: (string | null)[][];
  activeYear: number;
  activeMonthIndex: number;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  stores,
  employees,
  shifts,
  monthlyWeeks,
  activeYear,
  activeMonthIndex,
}) => {
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [exportText, setExportText] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [pdfGenerating, setPdfGenerating] = useState<boolean>(false);
  const [previewTab, setPreviewTab] = useState<'text' | 'pdf'>('text');

  const loadHtml2Pdf = () => {
    return new Promise<any>((resolve, reject) => {
      if ((window as any).html2pdf) {
        resolve((window as any).html2pdf);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => resolve((window as any).html2pdf);
      script.onerror = (e) => reject(e);
      document.head.appendChild(script);
    });
  };

  const generatePDFBlob = async (): Promise<{ blob: Blob; filename: string } | null> => {
    try {
      const html2pdf = await loadHtml2Pdf();
      const element = document.getElementById('pdf-export-container');
      if (!element) return null;

      const store = stores.find(s => s.id === selectedStoreId);
      const storeName = store ? store.name.replace('Constance ', '') : 'Loja';
      const monthLabel = new Date(activeYear, activeMonthIndex, 1)
        .toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
        .replace(/^\w/, c => c.toUpperCase());
      const filename = `Escala_${storeName.replace(/\s+/g, '_')}_${monthLabel.replace(/\s+/g, '_')}.pdf`;

      const opt = {
        margin: [0.3, 0.3, 0.3, 0.3],
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false, width: 1000 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      const pdf = html2pdf().set(opt).from(element);
      const blob = await pdf.outputPdf('blob');
      return { blob, filename };
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Erro ao gerar o PDF.');
      return null;
    }
  };

  const handleDownloadPDF = async () => {
    setPdfGenerating(true);
    const result = await generatePDFBlob();
    setPdfGenerating(false);
    if (!result) return;

    const { blob, filename } = result;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSharePDF = async () => {
    setPdfGenerating(true);
    const result = await generatePDFBlob();
    setPdfGenerating(false);
    if (!result) return;

    const { blob, filename } = result;
    const file = new File([blob], filename, { type: 'application/pdf' });

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Escala de Trabalho',
          text: `Escala de Trabalho - ${stores.find(s => s.id === selectedStoreId)?.name}`
        });
      } catch (err) {
        console.log('Share cancelled or failed:', err);
      }
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Open WhatsApp Web in a new tab
      window.open('https://web.whatsapp.com/', '_blank');

      alert(
        "PDF baixado com sucesso!\n\nAbrimos o WhatsApp Web em uma nova aba. Para enviar no grupo da loja, basta anexar ou arrastar o arquivo de escala baixado diretamente na conversa."
      );
    }
  };

  // Set default store and period when modal opens
  useEffect(() => {
    if (isOpen && stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(stores[0].id);
    }
    if (isOpen) {
      setSelectedPeriod('all');
    }
  }, [isOpen, stores, selectedStoreId]);

  const getWeekOptionLabel = (week: (string | null)[], idx: number) => {
    const dates = week.filter((d): d is string => {
      if (!d) return false;
      const parts = d.split('-');
      const y = parseInt(parts[0]);
      const m = parseInt(parts[1]) - 1;
      return y === activeYear && m === activeMonthIndex;
    });
    if (dates.length === 0) return `Semana ${idx + 1}`;
    const start = formatToDayMonth(dates[0]);
    const end = formatToDayMonth(dates[dates.length - 1]);
    return `Semana ${idx + 1} (${start} a ${end})`;
  };

  // Generate the formatted WhatsApp copy-paste text
  useEffect(() => {
    const store = stores.find(s => s.id === selectedStoreId);
    if (!store) return;

    const franchiseName = (typeof window !== 'undefined' ? localStorage.getItem('escala_varejo_franchise_name') : null) || 'Varejo';
    let text = `🗓️ ESCALA ${franchiseName.toUpperCase()} - ${store.name.toUpperCase()}\n`;

    const homeEmployees = employees.filter(emp => emp.active && emp.home_store_id === selectedStoreId);
    const uniqueShifts = getUniqueShifts(shifts);
    const DAY_NAMES_SEG_DOM = ['Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado', 'Domingo'];

    // Gather all target dates to format based on selection
    interface DayToFormat {
      date: string;
      weekdayIdx: number;
    }
    let daysToFormat: DayToFormat[] = [];

    if (selectedPeriod === 'all') {
      // Collect all dates from all weeks that belong to this month
      const seenDates = new Set<string>();
      monthlyWeeks.forEach(week => {
        week.forEach((date, idx) => {
          if (!date) return;
          const parts = date.split('-');
          const y = parseInt(parts[0]);
          const m = parseInt(parts[1]) - 1;
          if (y === activeYear && m === activeMonthIndex && !seenDates.has(date)) {
            seenDates.add(date);
            
            // Calculate weekday index from date
            const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            const dayOfWeekVal = d.getDay();
            const weekdayIdx = dayOfWeekVal === 0 ? 6 : dayOfWeekVal - 1;
            
            daysToFormat.push({ date, weekdayIdx });
          }
        });
      });
      // Sort days chronologically
      daysToFormat.sort((a, b) => a.date.localeCompare(b.date));
    } else {
      // Specific week selection
      const weekIdx = parseInt(selectedPeriod) || 0;
      const week = monthlyWeeks[weekIdx];
      if (week) {
        week.forEach((date, idx) => {
          if (!date) return;
          const parts = date.split('-');
          const y = parseInt(parts[0]);
          const m = parseInt(parts[1]) - 1;
          if (y === activeYear && m === activeMonthIndex) {
            daysToFormat.push({ date, weekdayIdx: idx });
          }
        });
      }
    }

    if (daysToFormat.length === 0) {
      setExportText('');
      return;
    }

    const startDayFormatted = formatToDayMonth(daysToFormat[0].date);
    const endDayFormatted = formatToDayMonth(daysToFormat[daysToFormat.length - 1].date);
    text += `Período: ${startDayFormatted} a ${endDayFormatted}\n\n`;

    daysToFormat.forEach(({ date, weekdayIdx }) => {
      text += `${DAY_NAMES_SEG_DOM[weekdayIdx]} (${formatToDayMonth(date)}):\n`;

      // Active shifts scheduled at this store on this day
      const storeShifts = uniqueShifts.filter(
        s =>
          s.store_id === selectedStoreId &&
          s.date === date &&
          !((s.start_time === '00:00' && s.end_time === '00:00') || !s.start_time)
      );

      if (storeShifts.length === 0) {
        text += `- Loja Fechada ou Sem Escala\n`;
      } else {
        storeShifts.forEach(shift => {
          const emp = employees.find(e => e.id === shift.employee_id);
          if (emp) {
            text += `- ${emp.name} (${emp.role}): ${shift.start_time} - ${shift.end_time}\n`;
          }
        });
      }

      // Calculate folgas & férias
      const folgas: string[] = [];
      const ferias: string[] = [];
      homeEmployees.forEach(emp => {
        const empShiftsOnDay = uniqueShifts.filter(s => s.employee_id === emp.id && s.date === date);

        if (empShiftsOnDay.length === 0) {
          folgas.push(emp.name);
        } else {
          const isFeriasVal = empShiftsOnDay.some(s => s.start_time === 'FERIAS');
          if (isFeriasVal) {
            ferias.push(emp.name);
          } else {
            const isExplicitFolga = empShiftsOnDay.every(
              s => (s.start_time === '00:00' && s.end_time === '00:00') || !s.start_time
            );

            if (isExplicitFolga) {
              folgas.push(emp.name);
            }
          }
        }
      });

      if (folgas.length > 0) {
        text += `Folgas: ${folgas.join(', ')}\n`;
      }
      if (ferias.length > 0) {
        text += `Férias: ${ferias.join(', ')}\n`;
      }

      text += `\n`;
    });

    setExportText(text);
  }, [selectedStoreId, selectedPeriod, stores, employees, shifts, monthlyWeeks, activeYear, activeMonthIndex]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(exportText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  return (
    <div className="modal-backdrop active">
      <div className="modal-content card">
        <div className="modal-header">
          <h2>Exportar Escala para WhatsApp</h2>
          <button className="modal-close" onClick={onClose} type="button">
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="export-store">Selecione a Loja para Exportação</label>
            <select
              id="export-store"
              value={selectedStoreId}
              onChange={e => setSelectedStoreId(e.target.value)}
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
            <label htmlFor="export-period">Selecione o Período</label>
            <select
              id="export-period"
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(e.target.value)}
              required
            >
              <option value="all">Mês Inteiro</option>
              {monthlyWeeks.map((week, idx) => (
                <option key={idx} value={String(idx)}>
                  {getWeekOptionLabel(week, idx)}
                </option>
              ))}
            </select>
            <span className="input-tip">
              Escolha se deseja exportar a escala do mês inteiro ou de uma semana específica.
            </span>
          </div>

          <div className="employee-tabs" style={{ marginBottom: '1rem', display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={`tab-button ${previewTab === 'text' ? 'active' : ''}`}
              onClick={() => setPreviewTab('text')}
              style={{ flex: 1, padding: '0.4rem 0' }}
            >
              Texto WhatsApp
            </button>
            <button
              type="button"
              className={`tab-button ${previewTab === 'pdf' ? 'active' : ''}`}
              onClick={() => setPreviewTab('pdf')}
              style={{ flex: 1, padding: '0.4rem 0' }}
            >
              Visualizar PDF
            </button>
          </div>

          {previewTab === 'text' ? (
            <div className="form-group">
              <label>Visualização do Texto</label>
              <textarea
                className="whatsapp-preview-area"
                value={exportText}
                readOnly
                rows={12}
                style={{ width: '100%', fontFamily: 'monospace', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', resize: 'vertical' }}
              />
            </div>
          ) : (
            <div className="form-group">
              <label>Pré-visualização do PDF</label>
              <div
                style={{
                  width: '100%',
                  maxHeight: '320px',
                  overflowY: 'auto',
                  overflowX: 'auto',
                  backgroundColor: 'var(--bg-secondary, #f8fafc)',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ minWidth: '960px', backgroundColor: '#ffffff', color: '#0f172a', fontFamily: 'system-ui, sans-serif', padding: '15px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                  {/* Print Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #af8f56', paddingBottom: '12px', marginBottom: '15px' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>
                        🗓️ Escala {stores.find(s => s.id === selectedStoreId)?.name || 'Loja'}
                      </h4>
                      <p style={{ fontSize: '11px', margin: '4px 0 0 0', color: '#64748b' }}>
                        Período: {new Date(activeYear, activeMonthIndex, 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Render Weeks inside preview */}
                  {monthlyWeeks.map((week, wIdx) => {
                    const datesInMonth = week.filter((d): d is string => d !== null && isDateInMonth(d, activeYear, activeMonthIndex));
                    if (datesInMonth.length === 0) return null;

                    const firstDate = datesInMonth[0] || week.find(d => d !== null);
                    const lastDate = datesInMonth[datesInMonth.length - 1] || [...week].reverse().find(d => d !== null);
                    const fDay = firstDate ? parseInt(firstDate.split('-')[2]) : '';
                    const lDay = lastDate ? parseInt(lastDate.split('-')[2]) : '';

                    const weekEmployees = employees.filter(emp => emp.active && emp.home_store_id === selectedStoreId);

                    return (
                      <div key={wIdx} style={{ marginBottom: '20px' }}>
                        <h5 style={{ fontSize: '11px', margin: '0 0 6px 0', color: '#80612c', backgroundColor: 'rgba(175, 143, 86, 0.06)', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Semana {wIdx + 1} {fDay && lDay && `(${fDay} a ${lDay})`}
                        </h5>

                        <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', border: '1px solid #cbd5e1', fontSize: '10px', wordBreak: 'break-word' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f8fafc' }}>
                              <th style={{ width: '155px', padding: '5px 6px', border: '1px solid #cbd5e1', textAlign: 'left', wordWrap: 'break-word', whiteSpace: 'normal' }}>Funcionário / Cargo</th>
                              {week.map((date, dIdx) => {
                                const dayLabel = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][dIdx];
                                let dateLabel = '';
                                if (date) {
                                  const parts = date.split('-');
                                  dateLabel = `${parts[2]}/${parts[1]}`;
                                }
                                const isSunday = dIdx === 6;
                                return (
                                  <th key={dIdx} style={{ width: '115px', padding: '5px 6px', border: '1px solid #cbd5e1', textAlign: 'center', backgroundColor: isSunday ? '#e2f9e6' : undefined, color: isSunday ? '#2b8a3e' : undefined }}>
                                    {dayLabel} {dateLabel}
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>
                          <tbody>
                            {weekEmployees.map(emp => {
                              return (
                                <tr key={emp.id}>
                                  <td style={{ padding: '5px 6px', border: '1px solid #cbd5e1', fontWeight: 'bold', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                                    <div>{emp.name}</div>
                                    <div style={{ fontSize: '8px', fontWeight: 'normal', color: '#64748b', marginTop: '1px' }}>{emp.role}</div>
                                  </td>
                                  {week.map((date, dIdx) => {
                                    const isSunday = dIdx === 6;
                                    if (!date) {
                                      return <td key={dIdx} style={{ border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', opacity: 0.5 }} />;
                                    }

                                    const dayShifts = getUniqueShifts(shifts).filter(
                                      s => s.employee_id === emp.id && s.date === date
                                    );

                                    if (dayShifts.length === 0) {
                                      return (
                                        <td key={dIdx} style={{ padding: '5px', border: '1px solid #cbd5e1', textAlign: 'center', color: isSunday ? '#2b8a3e' : '#64748b', backgroundColor: isSunday ? '#ebfbee' : undefined }}>
                                          Folga
                                        </td>
                                      );
                                    }

                                    const shift = dayShifts[0];
                                    const isFolga = (shift.start_time === '00:00' && shift.end_time === '00:00') || !shift.start_time;
                                    const isFerias = shift.start_time === 'FERIAS';

                                    if (isFerias) {
                                      return (
                                        <td key={dIdx} style={{ padding: '5px', border: '1px solid #cbd5e1', textAlign: 'center', backgroundColor: '#fef3c7', color: '#80612c', fontWeight: 'bold' }}>
                                          Férias
                                        </td>
                                      );
                                    }

                                    if (isFolga) {
                                      return (
                                        <td key={dIdx} style={{ padding: '5px', border: '1px solid #cbd5e1', textAlign: 'center', color: isSunday ? '#2b8a3e' : '#64748b', backgroundColor: isSunday ? '#ebfbee' : undefined }}>
                                          Folga
                                        </td>
                                      );
                                    }

                                    const storeShort = stores.find(s => s.id === shift.store_id)?.name.replace('Constance ', '') || 'Loja';
                                    const isOtherStore = shift.store_id !== selectedStoreId;

                                    return (
                                      <td key={dIdx} style={{ padding: '3px 4px', border: '1px solid #cbd5e1', textAlign: 'center', backgroundColor: isOtherStore ? '#f1f5f9' : (isSunday ? '#ffffff' : undefined), color: isOtherStore ? '#475569' : undefined }}>
                                        <div style={{ fontWeight: 'bold' }}>{shift.start_time} – {shift.end_time}</div>
                                        {isOtherStore && <div style={{ fontSize: '8px', color: '#64748b', marginTop: '1px' }}>{storeShort}</div>}
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* PDF Exporter Section */}
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              Exportar Calendário Mensal (PDF Visual)
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
              Gere um documento PDF em formato Paisagem (A4) correspondente ao calendário visual do app para imprimir ou compartilhar.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleDownloadPDF}
                disabled={pdfGenerating}
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.82rem' }}
              >
                📥 {pdfGenerating ? 'Gerando...' : 'Baixar PDF'}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSharePDF}
                disabled={pdfGenerating}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  fontSize: '0.82rem',
                  background: 'linear-gradient(135deg, var(--color-gold), #d4af37)',
                  border: 'none',
                  color: '#fff'
                }}
              >
                📤 {pdfGenerating ? 'Gerando...' : 'Enviar no WhatsApp'}
              </button>
            </div>
          </div>

          <div className="modal-footer">
            {copySuccess && (
              <span className="copy-success-message" style={{ color: 'var(--color-success)', marginRight: 'auto', fontSize: '0.85rem' }}>Copiado para a área de transferência! 👍</span>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Fechar
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleCopy}>
              Copiar Texto
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={() => {
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(exportText)}`, '_blank');
              }}
              style={{
                backgroundColor: '#25D366',
                color: 'white',
                borderColor: '#25D366',
                boxShadow: '0 2px 8px rgba(37, 211, 102, 0.2)'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
              <span>Enviar no WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Print-optimized monthly calendar (permanently rendered at zero-height to allow correct layout reflow without squishing) */}
      <div 
        id="pdf-export-wrapper" 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '1000px', 
          height: 0, 
          overflow: 'hidden', 
          pointerEvents: 'none', 
          zIndex: -9999 
        }}
      >
        <div
          id="pdf-export-container"
          style={{
            width: '1000px',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            fontFamily: 'system-ui, sans-serif',
            padding: '20px',
            boxSizing: 'border-box',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #af8f56', paddingBottom: '12px', marginBottom: '15px' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>
                🗓️ Escala {stores.find(s => s.id === selectedStoreId)?.name || 'Loja'}
              </h1>
              <p style={{ fontSize: '12px', margin: '4px 0 0 0', color: '#64748b' }}>
                Período: {new Date(activeYear, activeMonthIndex, 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Stacked Weeks */}
          {monthlyWeeks.map((week, wIdx) => {
            // Check if week has any dates in target month
            const datesInMonth = week.filter((d): d is string => d !== null && isDateInMonth(d, activeYear, activeMonthIndex));

            if (datesInMonth.length === 0) return null;

            const firstDate = datesInMonth[0] || week.find(d => d !== null);
            const lastDate = datesInMonth[datesInMonth.length - 1] || [...week].reverse().find(d => d !== null);
            const fDay = firstDate ? parseInt(firstDate.split('-')[2]) : '';
            const lDay = lastDate ? parseInt(lastDate.split('-')[2]) : '';

            const weekEmployees = employees.filter(emp => emp.active && emp.home_store_id === selectedStoreId);

            return (
              <div 
                key={wIdx} 
                style={{ 
                  marginBottom: '15px', 
                  pageBreakAfter: (wIdx % 2 === 1 && wIdx < monthlyWeeks.length - 1) ? 'always' : 'auto',
                  pageBreakInside: 'avoid'
                }}
              >
                <h3 style={{ fontSize: '11px', margin: '0 0 4px 0', color: '#80612c', backgroundColor: 'rgba(175, 143, 86, 0.08)', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Semana {wIdx + 1} {fDay && lDay && `(${fDay} a ${lDay})`}
                </h3>

                <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', border: '1px solid #cbd5e1', fontSize: '9px', wordBreak: 'break-word' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                      <th style={{ width: '155px', padding: '4px 6px', border: '1px solid #cbd5e1', textAlign: 'left', wordWrap: 'break-word', whiteSpace: 'normal' }}>Funcionário / Cargo</th>
                      {week.map((date, dIdx) => {
                        const dayLabel = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][dIdx];
                        let dateLabel = '';
                        if (date) {
                          const parts = date.split('-');
                          dateLabel = `${parts[2]}/${parts[1]}`;
                        }
                        const isSunday = dIdx === 6;
                        return (
                          <th key={dIdx} style={{ width: '115px', padding: '4px 6px', border: '1px solid #cbd5e1', textAlign: 'center', backgroundColor: isSunday ? '#e2f9e6' : undefined, color: isSunday ? '#2b8a3e' : undefined }}>
                            {dayLabel} {dateLabel}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {weekEmployees.map(emp => {
                      return (
                        <tr key={emp.id}>
                          <td style={{ padding: '4px 6px', border: '1px solid #cbd5e1', fontWeight: 'bold', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                            <div>{emp.name}</div>
                            <div style={{ fontSize: '7.5px', fontWeight: 'normal', color: '#64748b', marginTop: '1px' }}>{emp.role}</div>
                          </td>
                          {week.map((date, dIdx) => {
                            const isSunday = dIdx === 6;
                            if (!date) {
                              return <td key={dIdx} style={{ border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', opacity: 0.5 }} />;
                            }

                            const dayShifts = getUniqueShifts(shifts).filter(
                              s => s.employee_id === emp.id && s.date === date
                            );

                            if (dayShifts.length === 0) {
                              return (
                                <td key={dIdx} style={{ padding: '4px', border: '1px solid #cbd5e1', textAlign: 'center', color: isSunday ? '#2b8a3e' : '#64748b', backgroundColor: isSunday ? '#ebfbee' : undefined }}>
                                  Folga
                                </td>
                              );
                            }

                            const shift = dayShifts[0];
                            const isFolga = (shift.start_time === '00:00' && shift.end_time === '00:00') || !shift.start_time;
                            const isFerias = shift.start_time === 'FERIAS';

                            if (isFerias) {
                              return (
                                <td key={dIdx} style={{ padding: '4px', border: '1px solid #cbd5e1', textAlign: 'center', backgroundColor: '#fef3c7', color: '#80612c', fontWeight: 'bold' }}>
                                  Férias
                                </td>
                              );
                            }

                            if (isFolga) {
                              return (
                                <td key={dIdx} style={{ padding: '4px', border: '1px solid #cbd5e1', textAlign: 'center', color: isSunday ? '#2b8a3e' : '#64748b', backgroundColor: isSunday ? '#ebfbee' : undefined }}>
                                  Folga
                                </td>
                              );
                            }

                            const storeShort = stores.find(s => s.id === shift.store_id)?.name.replace('Constance ', '') || 'Loja';
                            const isOtherStore = shift.store_id !== selectedStoreId;

                            return (
                              <td key={dIdx} style={{ padding: '3px 4px', border: '1px solid #cbd5e1', textAlign: 'center', backgroundColor: isOtherStore ? '#f1f5f9' : (isSunday ? '#ffffff' : undefined), color: isOtherStore ? '#475569' : undefined }}>
                                <div style={{ fontWeight: 'bold' }}>{shift.start_time} – {shift.end_time}</div>
                                {isOtherStore && <div style={{ fontSize: '7.5px', color: '#64748b', marginTop: '1px' }}>{storeShort}</div>}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
