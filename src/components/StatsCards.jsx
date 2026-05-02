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
      <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
          
          {/* Contenedor 1: TERMÓMETRO Y BOTONES (Izquierda) */}
          <div className="lg:w-1/3 flex flex-col justify-center gap-6 lg:pr-8 lg:border-r border-border/50 py-2 h-auto lg:h-[200px]">
            {/* Sector Termómetro (Oculto si es RI) */}
            {!isRI && (
              <div className="flex flex-col justify-center gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold uppercase tracking-[0.1em] text-[10px] text-text-muted">
                    Límite Cat. {category}
                  </h3>
                  <div className="font-black text-[12px] md:text-sm tracking-tight text-text-primary">
                    {renderMoney(limit)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                      Facturado Anual
                    </span>
                    <span className={`font-black text-sm ${colorClass.split(' ')[0]}`}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-3 w-full bg-surface-alt rounded-full overflow-hidden relative">
                    <div 
                      className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${colorClass.split(' ')[1]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  <div className="text-[9px] font-bold text-text-muted tracking-widest text-right">
                    {renderMoney(facturacionAnual)}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Contenedor 2: Filtros + Facturado + Botones */}
          <div className="flex flex-col gap-4 lg:w-2/3">
            
            {/* Selector de Tiempo (Arriba de Facturado) */}
            <div className="flex justify-center lg:justify-start">
              <div className="flex p-0.5 bg-surface-alt/50 rounded-lg border border-border/40">
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
                      px-3 py-1 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer
                      ${timeframe === option.id 
                        ? 'bg-white text-text-primary shadow-sm ring-1 ring-black/5' 
                        : 'text-text-muted hover:text-text-primary hover:bg-white/40'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Interno: Facturado y 3 Minibotones */}
            <div className="flex flex-col lg:flex-row gap-4 lg:h-[200px]">
              
              {/* FACTURADO (Centro-Izquierda) */}
              <div
                onClick={() => onCardClick('Facturadas', facturadas, timeframe)}
                className={`lg:flex-[2] relative bg-white border rounded-2xl p-4 md:p-5 flex flex-col justify-center items-center text-center transition-all duration-300 hover:border-green hover:shadow-sm outline-none group cursor-pointer overflow-hidden min-h-[140px] ${
                  activeCard === 'Facturadas' ? 'border-accent ring-2 ring-accent/20 bg-accent/5' : 'border-border'
                }`}
              >
                {/* Decorative Waves (Subtle) */}
                <div className="absolute left-8 bottom-6 w-24 h-12 opacity-10 pointer-events-none hidden md:block">
                  <svg viewBox="0 0 100 50" className="w-full h-full stroke-green fill-green/20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M0,50 L20,50 L30,10 L40,50 L50,50 L60,10 L70,50 L100,50" />
                  </svg>
                </div>
                
                <button 
                  onClick={handleToggleValues}
                  className="absolute top-4 right-4 text-text-muted/60 hover:text-text-primary transition-colors p-2 rounded-full hover:bg-surface-alt z-10 cursor-pointer"
                >
                  {showValues ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                
                <div className="bg-green/10 w-10 h-10 flex items-center justify-center rounded-full mb-3 group-hover:scale-110 transition-transform">
                  <TrendingUp size={18} className="text-green" />
                </div>
                
                <h3 className="font-bold uppercase tracking-[0.1em] text-[11px] md:text-[12px] text-text-primary/90 mb-1">
                  Total Facturado
                </h3>
                
                <div className="font-black text-2xl md:text-3xl lg:text-4xl tracking-tighter text-green mb-2 md:mb-3 transition-all">
                  {renderMoney(facturadasAmount)}
                </div>
                
                <div className="font-semibold text-[10px] text-green bg-green-subtle px-3 py-1 rounded-full uppercase tracking-wider">
                  {facturadas.length} {facturadas.length === 1 ? 'exitosa' : 'exitosas'}
                </div>
              </div>

              {/* 3 MINI CARDS (Centro-Derecha) */}
              <div className="lg:flex-1 flex justify-center items-center h-auto lg:h-[200px]">
                <div className="flex flex-row lg:flex-col justify-center items-center gap-2 w-full lg:w-full">
                  
                  {/* Total Ventas */}
                  <button
                    onClick={() => onCardClick('Total Ventas', activas, timeframe)}
                    className={`flex-1 w-full min-h-0 bg-white border rounded-xl px-2 md:px-4 py-2 md:py-3 flex flex-col md:grid md:grid-cols-[70px_1fr_auto] items-center gap-1 md:gap-4 transition-all duration-300 hover:shadow-sm hover:border-blue outline-none cursor-pointer group ${
                      activeCard === 'Total Ventas' ? 'border-accent ring-2 ring-accent/20 bg-accent/5' : 'border-border'
                    }`}
                  >
                    <div className="font-bold uppercase text-[8px] md:text-[10px] text-text-muted tracking-widest leading-tight text-center md:text-left">Total<br className="hidden md:block"/> Movim.</div>
                    
                    <div className="flex items-center justify-center gap-1.5 md:contents">
                      <div className="font-black text-xl md:text-2xl text-text-primary tracking-tighter text-center">{activas.length}</div>
                      <div className="md:hidden text-blue/60">
                         <Activity size={10} />
                      </div>
                    </div>

                    <div className="hidden md:flex items-center gap-2 justify-end">
                       <div className="font-medium text-[9px] md:text-[10px] text-text-secondary tracking-tight">{renderMoney(totalActivasAmount)}</div>
                    </div>
                  </button>

                  {/* Pendientes */}
                  <button
                    onClick={() => onCardClick('Pendientes', pendientes, timeframe)}
                    className={`flex-1 w-full min-h-0 bg-white border rounded-xl px-2 md:px-4 py-2 md:py-3 flex flex-col md:grid md:grid-cols-[70px_1fr_auto] items-center gap-1 md:gap-4 transition-all duration-300 hover:shadow-sm hover:border-amber-400 outline-none cursor-pointer group ${
                      activeCard === 'Pendientes' ? 'border-accent ring-2 ring-accent/20 bg-accent/5' : 'border-border'
                    }`}
                  >
                    <div className="font-bold uppercase text-[8px] md:text-[10px] text-text-muted tracking-widest leading-tight text-center md:text-left">Pendiente<br className="hidden md:block"/> Cobro</div>
                    
                    <div className="flex items-center justify-center gap-1.5 md:contents">
                      <div className="font-black text-xl md:text-2xl text-text-primary tracking-tighter text-center">{pendientes.length}</div>
                      <div className="md:hidden text-amber-500/60">
                         <Clock size={10} />
                      </div>
                    </div>

                    <div className="hidden md:flex items-center gap-2 justify-end">
                       <div className="font-medium text-[9px] md:text-[10px] text-text-secondary tracking-tight">{renderMoney(pendientesAmount)}</div>
                    </div>
                  </button>

                  {/* Con Error */}
                  <button
                    onClick={() => onCardClick('Con Error', conError, timeframe)}
                    className={`flex-1 w-full min-h-0 bg-white border rounded-xl px-2 md:px-4 py-2 md:py-3 flex flex-col md:grid md:grid-cols-[70px_1fr_auto] items-center gap-1 md:gap-4 transition-all duration-300 hover:shadow-sm hover:border-red outline-none cursor-pointer group ${
                      activeCard === 'Con Error' ? 'border-accent ring-2 ring-accent/20 bg-accent/5' : 'border-border'
                    }`}
                  >
                    <div className="font-bold uppercase text-[8px] md:text-[10px] text-text-muted tracking-widest leading-tight text-center md:text-left">Errores<br className="hidden md:block"/> AFIP</div>
                    
                    <div className="flex items-center justify-center gap-1.5 md:contents">
                      <div className="font-black text-xl md:text-2xl text-red tracking-tighter text-center">{conError.length}</div>
                      <div className="md:hidden text-red/60">
                         <AlertCircle size={10} />
                      </div>
                    </div>

                    <div className="hidden md:flex items-center gap-2 justify-end">
                       <div className="font-medium text-[9px] md:text-[10px] text-red opacity-80 tracking-tight">{renderMoney(conErrorAmount)}</div>
                    </div>
                  </button>
                </div>
              </div>

        </div>
      </div>
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
