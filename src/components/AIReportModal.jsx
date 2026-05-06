import { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import { Sparkles, TrendingUp, ShieldCheck, Target, Zap, Loader2, ChevronRight, FileText } from 'lucide-react';

export default function AIReportModal({ isOpen, onClose, type, data }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setIsGenerating(true);
      setReport(null);
      // Simulate AI thinking
      const timer = setTimeout(() => {
        generateReport();
        setIsGenerating(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, type, data]);

  const generateReport = () => {
    if (type === 'fiscal') {
      const { category, limit, annualTotal, tableTotal } = data;
      const percentage = (annualTotal / limit) * 100;
      const remaining = limit - annualTotal;
      const avgMonthly = annualTotal / (new Date().getMonth() + 1);
      const projection = avgMonthly * 12;
      const willExceed = projection > limit;

      setReport({
        title: 'Diagnóstico de Salud Fiscal',
        subtitle: `Análisis para Categoría ${category}`,
        sections: [
          {
            title: 'Estado de Escala',
            icon: ShieldCheck,
            color: 'text-green',
            content: `Tu facturación anual acumulada es de $${annualTotal.toLocaleString('es-AR')}, lo que representa el ${percentage.toFixed(1)}% de tu límite de categoría (${category}). Te quedan $${remaining.toLocaleString('es-AR')} de margen para el resto del año fiscal.`
          },
          {
            title: 'Proyección y Riesgo',
            icon: TrendingUp,
            color: willExceed ? 'text-coral' : 'text-blue',
            content: willExceed 
              ? `ALERTA: Basado en tu promedio mensual de $${avgMonthly.toLocaleString('es-AR')}, proyectamos un cierre anual de $${projection.toLocaleString('es-AR')}. Esto supera el límite de tu categoría actual. Recomendamos evaluar el salto a la siguiente escala o regular la facturación en el último trimestre.`
              : `Tu ritmo actual proyecta un total anual de $${projection.toLocaleString('es-AR')}. Estás en una "zona segura", operando cómodamente dentro de los límites de la Categoría ${category}.`
          },
          {
            title: 'Impacto de Selección',
            icon: Zap,
            color: 'text-purple',
            content: tableTotal > 0 
              ? `Las ventas seleccionadas actualmente representan un impacto de $${tableTotal.toLocaleString('es-AR')} (${((tableTotal/limit)*100).toFixed(2)}%) sobre tu tope anual. Facturar estos movimientos ahora es fiscalmente viable sin comprometer tu escala inmediata.`
              : `No hay una selección activa de impacto. Recordá que cada factura emitida consume parte de tu cupo anual; usá el termómetro para medir el impacto antes de emitir en masa.`
          }
        ],
        advice: 'Tu salud fiscal es estable. Mantené un seguimiento mensual para evitar recategorizaciones de oficio por parte de AFIP.'
      });
    } else {
      // Analytics mode
      const { kpi, chartData, compareEnabled } = data;
      const growth = kpi.change || 0;
      const avgTicket = kpi.monto / (kpi.facturadas || 1);
      
      setReport({
        title: 'Reporte de Rendimiento Comercial',
        subtitle: 'Insights de operaciones y crecimiento',
        sections: [
          {
            title: 'Análisis de Crecimiento',
            icon: TrendingUp,
            color: growth >= 0 ? 'text-green' : 'text-coral',
            content: compareEnabled 
              ? `Este período muestra un ${growth >= 0 ? 'incremento' : 'descenso'} del ${Math.abs(growth)}% en facturación respecto al período anterior. ${growth > 10 ? 'El crecimiento es robusto y supera la media del sector.' : 'Se observa una estabilidad operativa con variaciones menores.'}`
              : `Has facturado un total de $${kpi.monto.toLocaleString('es-AR')} en este período. El volumen de operaciones pendientes (${kpi.pendientes}) sugiere una carga de trabajo activa para los próximos días.`
          },
          {
            title: 'Eficiencia de Venta',
            icon: Target,
            color: 'text-blue',
            content: `Tu ticket promedio por factura emitida es de $${avgTicket.toLocaleString('es-AR')}. ${avgTicket > 50000 ? 'Tu perfil de cliente es de ticket alto, lo que reduce costos operativos por operación.' : 'Tenés un alto volumen de transacciones menores, ideal para diversificar riesgo de cobranza.'}`
          },
          {
            title: 'Tendencias Detectadas',
            icon: Zap,
            color: 'text-yellow',
            content: `Detectamos una concentración de ventas hacia el final del período. La proyección para el próximo ciclo es ${growth >= 0 ? 'positiva' : 'conservadora'}, con un potencial de facturación base de $${(kpi.monto * 1.05).toLocaleString('es-AR')} si se mantienen los ratios actuales.`
          }
        ],
        advice: 'Sugerencia IA: Enfocá tus esfuerzos en convertir las ventas pendientes actuales para maximizar el flujo de caja antes del cierre de mes.'
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Inteligencia Artificial CMD">
      <div className="min-h-[400px] flex flex-col">
        {isGenerating ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 animate-pulse">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-purple/20 rounded-full blur-xl animate-ping" />
              <div className="relative w-16 h-16 bg-gradient-to-tr from-purple to-blue rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles size={32} className="text-white animate-spin-slow" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-text-primary uppercase tracking-tighter">Procesando Datos...</h3>
            <p className="text-xs text-text-muted mt-2 font-medium">La IA está analizando tus métricas en tiempo real</p>
          </div>
        ) : report ? (
          <div className="animate-fade-in space-y-6 pb-4">
            {/* Header Report */}
            <div className="bg-gradient-to-r from-purple/10 to-blue/10 p-6 rounded-2xl border border-purple/10">
              <div className="flex items-center gap-2 text-purple mb-1">
                <Sparkles size={16} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Brief Ejecutivo</span>
              </div>
              <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight leading-none mb-1">{report.title}</h2>
              <p className="text-xs text-text-secondary font-medium">{report.subtitle}</p>
            </div>

            {/* Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.sections.map((section, idx) => {
                const Icon = section.icon;
                return (
                  <div key={idx} className={`p-5 rounded-2xl border border-border bg-surface-alt/30 hover:bg-surface-alt/50 transition-all duration-300 ${idx === 0 ? 'md:col-span-2' : ''}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg bg-white shadow-sm ${section.color}`}>
                        <Icon size={18} />
                      </div>
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-text-primary">{section.title}</h4>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed font-medium">
                      {section.content}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* AI Advice Footer */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-text-primary text-white shadow-xl shadow-black/10">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <FileText size={20} className="text-blue" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue/80">Recomendación Estratégica</span>
                <p className="text-xs mt-1 font-medium leading-relaxed italic opacity-90">"{report.advice}"</p>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-[9px] text-center text-text-muted italic px-6">
              * Este reporte es generado automáticamente por IA con fines informativos. No constituye asesoramiento contable legal.
            </p>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
