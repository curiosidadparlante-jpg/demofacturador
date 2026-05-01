import StatsCards from './StatsCards'
import SalesTable from './SalesTable'
import { Download } from 'lucide-react'
import { exportToExcel } from '../utils/exportUtils'

export default function ContableView({ 
  ventas, 
  onCardClick,
  tableData,
  selectedIds,
  onToggleSelect,
  onToggleAll,
  loading,
  onShowError,
  onRowClick,
  onEdit,
  onSaveEdit,
  onRetry,
  onEmit,
  labels
}) {
  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h2 className="text-lg md:text-xl font-bold text-text-primary uppercase tracking-tight">
          Resumen Contable
        </h2>
        <p className="text-xs text-text-muted mt-1">
          Métricas fiscales y financieras de tu negocio
        </p>
      </div>

      <StatsCards ventas={ventas} onCardClick={onCardClick} activeCard={tableData?.baseTitle} />

      {tableData && (
        <div className="bg-surface rounded-xl border border-border p-4 md:p-6 animate-fade-in shadow-sm mt-8">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => exportToExcel(tableData.ventas)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#316973]/10 border border-[#316973]/20 text-[#316973] text-[9px] font-bold uppercase tracking-widest hover:bg-[#316973]/20 hover:border-[#316973]/40 transition-all cursor-pointer shadow-sm"
            >
              <Download size={13} />
              Exportar
            </button>
          </div>
          <SalesTable 
            ventas={tableData.ventas}
            selectedIds={selectedIds}
            onToggleSelect={onToggleSelect}
            onToggleAll={onToggleAll}
            loading={loading}
            onShowError={onShowError}
            onRowClick={onRowClick}
            onEdit={onEdit}
            onSaveEdit={onSaveEdit}
            onRetry={onRetry}
            onEmit={onEmit}
            labels={labels}
          />
        </div>
      )}
    </div>
  )
}
