import StatsCards from './StatsCards'
import SalesTable from './SalesTable'

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

      <StatsCards ventas={ventas} onCardClick={onCardClick} />

      {tableData && (
        <div className="bg-surface rounded-xl border border-border p-4 md:p-6 animate-fade-in shadow-sm mt-8">
          <h3 className="text-sm md:text-md font-black uppercase tracking-widest text-text-primary mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-accent rounded-full inline-block" />
            {tableData.title}
          </h3>
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
