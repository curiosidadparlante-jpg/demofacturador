import { TrendingUp, Clock, FileCheck, Trash2, AlertCircle, Eye, EyeOff, Activity, ChevronDown, ChevronUp, AlertTriangle, Archive } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { filterVentasByTimeframe } from '../utils/dateUtils'
import { useConfig } from '../context/ConfigContext'
import { getMonotributoLimit } from '../utils/afipConstants'

export default function StatsCards({ ventas, onCardClick, activeCard }) {
  const [timeframe, setTimeframe] = useState('all') // 'all', 'year', 'month', 'week', 'day'
  const [showValues, setShowValues] = useState(true)

  const { emisor, isRI } = useConfig()

  const filteredVentas = filterVentasByTimeframe(ventas, timeframe)
  const activas = filteredVentas.filter(v => v.status !== 'borrada')
  
  const facturadas = activas.filter(v => v.status === 'facturado')
  const conError = activas.filter(v => v.status === 'error')
  const pendientes = activas.filter(v => v.status === 'pendiente' || v.status === 'procesando')
  const archivadasAll = ventas.filter(v => v.archivada || v.status === 'archivada' || v.status === 'archivado')
  const borradasAll = ventas.filter(v => v.status === 'borrada')

  const getAmount = (v) => {
    const isCreditNote = [3, 8, 13, 113].includes(v.datos_fiscales?.tipo_cbte);
    const amount = Number(v.monto) || 0;
    return isCreditNote ? -Math.abs(amount) : Math.abs(amount);
  };

  const totalActivasAmount = activas.reduce((s, v) => s + getAmount(v), 0)
  const facturadasAmount = facturadas.reduce((s, v) => s + getAmount(v), 0)
  const pendientesAmount = pendientes.reduce((s, v) => s + getAmount(v), 0)
  const conErrorAmount = conError.reduce((s, v) => s + getAmount(v), 0)

  // ─── Lógica Termómetro Monotributo ───
  // Calculamos la facturación anual (del año en curso) sin importar el timeframe seleccionado
  const facturacionAnual = useMemo(() => {
    if (isRI) return 0;
    const currentYear = new Date().getFullYear();
    const facturadasAnio = ventas.filter(v => 
      v.status === 'facturado' && 
      new Date(v.fecha).getFullYear() === currentYear
    );
    return facturadasAnio.reduce((s, v) => s + getAmount(v), 0);
  }, [ventas, isRI]);

  const category = emisor?.monotributo_categoria || 'A';
  const limit = getMonotributoLimit(category);
  const percentage = Math.min((facturacionAnual / limit) * 100, 100);
  
  // Colores para el termómetro
  const getThermometerColor = (pct) => {
    if (pct >= 90) return 'text-[#C0443C] bg-[#C0443C]'; // Rojo (Peligro)
    if (pct >= 75) return 'text-[#F59E0B] bg-[#F59E0B]'; // Naranja (Advertencia)
    return 'text-[#2D8F5E] bg-[#2D8F5E]'; // Verde (OK)
  };
  const colorClass = getThermometerColor(percentage);

  const handleToggleValues = (e) => {
    e.stopPropagation()
    setShowValues(!showValues)
  }

  // Set 'Facturadas' as default table on mount
  useEffect(() => {
    if (!activeCard && onCardClick) {
      onCardClick('Facturadas', facturadas, timeframe)
    }
  }, []) // Empty dependency array ensures it only runs once on mount

  // Update table when timeframe or data changes
  useEffect(() => {
    if (!activeCard || !onCardClick) return;
    
    let newData = [];
    if (activeCard === 'Facturadas') newData = facturadas;
    else if (activeCard === 'Total Ventas') newData = activas;
    else if (activeCard === 'Pendientes') newData = pendientes;
    else if (activeCard === 'Con Error') newData = conError;
    else return;

    onCardClick(activeCard, newData, timeframe);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe, ventas]);

  const renderMoney = (amount) => {
    return showValues ? formatCurrency(amount) : '$ ***.***'
  }

  return (
    <div className="space-y-4">
      {/* ─── BARRA SUPERIOR: Filtros y Termómetro ─── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-surface-alt/30 p-2 rounded-xl border border-border/40">
        {/* Selector de Tiempo */}
        <div className="flex p-0.5 bg-white rounded-lg border border-border/60 shadow-sm">
          {[
            { id: 'all', label: 'Histórico' },
            { id: 'year', label: 'Año Fiscal' },
            { id: 'month', label: 'Mes' },
            { id: 'week', label: 'Semana' },
            { id: 'day', label: 'Día' }
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setTimeframe(option.id)}
              className={`
                px-3 py-1.5 rounded-md text-[10px] md:text-xs font-semibold transition-all duration-200 cursor-pointer
                ${timeframe === option.id 
                  ? 'bg-blue/10 text-blue shadow-sm' 
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-alt'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Termómetro Monotributo (Oculto si es RI) */}
        {!isRI && (
          <div className="flex items-center gap-4 px-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase text-text-muted">
                Cat. {category} ({renderMoney(limit)})
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-black text-text-primary">
                  {renderMoney(facturacionAnual)}
                </span>
                <span className={`text-[10px] font-bold ${colorClass.split(' ')[0]}`}>
                  {percentage.toFixed(1)}%
                </span>
              </div>
            </div>
            {/* Mini Progress Bar */}
            <div className="h-2 w-24 bg-border/40 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${colorClass.split(' ')[1]}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ─── TARJETAS TIPO SEARCH CONSOLE ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 rounded-xl overflow-hidden border border-border shadow-sm">
        
        {/* 1. FACTURADAS */}
        <button
          onClick={() => onCardClick('Facturadas', facturadas, timeframe)}
          className={`relative p-4 md:p-5 flex flex-col justify-between text-left transition-all duration-300 outline-none cursor-pointer border-r border-b lg:border-b-0 border-border group
            ${activeCard === 'Facturadas' ? 'bg-green text-white' : 'bg-white text-text-primary hover:bg-surface-alt'}
          `}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors
              ${activeCard === 'Facturadas' ? 'bg-white/20 border-white/40' : 'bg-surface border-border'}
            `}>
              {activeCard === 'Facturadas' && <FileCheck size={10} className="text-white" />}
            </div>
            <span className={`text-xs md:text-sm font-semibold ${activeCard === 'Facturadas' ? 'text-white' : 'text-text-secondary'}`}>
              Total Facturado
            </span>
          </div>
          <div className="flex flex-col">
            <span className={`text-2xl md:text-3xl font-black tracking-tight ${activeCard === 'Facturadas' ? 'text-white' : 'text-green'}`}>
              {renderMoney(facturadasAmount)}
            </span>
            <span className={`text-[10px] uppercase tracking-widest mt-1 ${activeCard === 'Facturadas' ? 'text-white/80' : 'text-text-muted'}`}>
              {facturadas.length} mov.
            </span>
          </div>
        </button>

        {/* 2. PENDIENTES */}
        <button
          onClick={() => onCardClick('Pendientes', pendientes, timeframe)}
          className={`relative p-4 md:p-5 flex flex-col justify-between text-left transition-all duration-300 outline-none cursor-pointer border-r border-b lg:border-b-0 border-border group
            ${activeCard === 'Pendientes' ? 'bg-[#F59E0B] text-white' : 'bg-white text-text-primary hover:bg-surface-alt'}
          `}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors
              ${activeCard === 'Pendientes' ? 'bg-white/20 border-white/40' : 'bg-surface border-border'}
            `}>
              {activeCard === 'Pendientes' && <Clock size={10} className="text-white" />}
            </div>
            <span className={`text-xs md:text-sm font-semibold ${activeCard === 'Pendientes' ? 'text-white' : 'text-text-secondary'}`}>
              Pendientes
            </span>
          </div>
          <div className="flex flex-col">
            <span className={`text-2xl md:text-3xl font-black tracking-tight ${activeCard === 'Pendientes' ? 'text-white' : 'text-[#F59E0B]'}`}>
              {renderMoney(pendientesAmount)}
            </span>
            <span className={`text-[10px] uppercase tracking-widest mt-1 ${activeCard === 'Pendientes' ? 'text-white/80' : 'text-text-muted'}`}>
              {pendientes.length} mov.
            </span>
          </div>
        </button>

        {/* 3. ERROR */}
        <button
          onClick={() => onCardClick('Con Error', conError, timeframe)}
          className={`relative p-4 md:p-5 flex flex-col justify-between text-left transition-all duration-300 outline-none cursor-pointer border-r border-border group
            ${activeCard === 'Con Error' ? 'bg-red text-white' : 'bg-white text-text-primary hover:bg-surface-alt'}
          `}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors
              ${activeCard === 'Con Error' ? 'bg-white/20 border-white/40' : 'bg-surface border-border'}
            `}>
              {activeCard === 'Con Error' && <AlertCircle size={10} className="text-white" />}
            </div>
            <span className={`text-xs md:text-sm font-semibold ${activeCard === 'Con Error' ? 'text-white' : 'text-text-secondary'}`}>
              Errores AFIP
            </span>
          </div>
          <div className="flex flex-col">
            <span className={`text-2xl md:text-3xl font-black tracking-tight ${activeCard === 'Con Error' ? 'text-white' : 'text-red'}`}>
              {renderMoney(conErrorAmount)}
            </span>
            <span className={`text-[10px] uppercase tracking-widest mt-1 ${activeCard === 'Con Error' ? 'text-white/80' : 'text-text-muted'}`}>
              {conError.length} mov.
            </span>
          </div>
        </button>

        {/* 4. TOTAL VENTAS */}
        <button
          onClick={() => onCardClick('Total Ventas', activas, timeframe)}
          className={`relative p-4 md:p-5 flex flex-col justify-between text-left transition-all duration-300 outline-none cursor-pointer group
            ${activeCard === 'Total Ventas' ? 'bg-blue text-white' : 'bg-white text-text-primary hover:bg-surface-alt'}
          `}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors
              ${activeCard === 'Total Ventas' ? 'bg-white/20 border-white/40' : 'bg-surface border-border'}
            `}>
              {activeCard === 'Total Ventas' && <Activity size={10} className="text-white" />}
            </div>
            <span className={`text-xs md:text-sm font-semibold ${activeCard === 'Total Ventas' ? 'text-white' : 'text-text-secondary'}`}>
              Total Movimientos
            </span>
          </div>
          <div className="flex flex-col">
            <span className={`text-2xl md:text-3xl font-black tracking-tight ${activeCard === 'Total Ventas' ? 'text-white' : 'text-blue'}`}>
              {renderMoney(totalActivasAmount)}
            </span>
            <span className={`text-[10px] uppercase tracking-widest mt-1 ${activeCard === 'Total Ventas' ? 'text-white/80' : 'text-text-muted'}`}>
              {activas.length} mov.
            </span>
          </div>
        </button>
        
      </div>

      {/* Botón para ocultar valores */}
      <div className="flex justify-end">
        <button 
          onClick={() => setShowValues(!showValues)}
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        >
          {showValues ? <EyeOff size={12} /> : <Eye size={12} />}
          {showValues ? 'Ocultar importes' : 'Mostrar importes'}
        </button>
      </div>

    </div>
  )
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
