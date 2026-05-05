import FilterBar from './FilterBar'
import SalesTable from './SalesTable'
import { Plus } from 'lucide-react'

export default function FacturasView({
  ventas,
  filteredVentas,
  filters,
  onFilterChange,
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
  onBulkImport,
  onNewVenta,
  activeFilter,
  labels = [],
  customFolders = [],
}) {

  // Determine title based on active filter
  const getTitle = () => {
    if (!activeFilter) return 'Lista Facturas'
    switch (activeFilter.type) {
      case 'status':
        const statusLabels = {
          'facturado': 'Facturadas',
          'pendiente': 'Pendientes',
          'error': 'Con Error',
          'archivada': 'Archivadas',
          'borrada': 'Papelera',
        }
        return statusLabels[activeFilter.value] || 'Lista Facturas'
      case 'folder':
        const folder = customFolders.find(f => f.id === activeFilter.value)
        return `Carpeta: ${folder ? folder.name : ''}`
      case 'label':
        return `Etiqueta: ${activeFilter.value}`
      case 'cliente':
        return `Cliente: ${activeFilter.value}`
      default:
        return 'Lista Facturas'
    }
  }

  return (
    <div>
      {/* Header + Nueva Venta */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-lg md:text-xl font-bold text-text-primary uppercase tracking-tight">
          {getTitle()}
        </h2>
        
        <button
          onClick={onNewVenta}
          className="
            flex items-center justify-center gap-2 px-4 py-2 rounded-xl
            bg-[#cfad3b]/10 border border-[#cfad3b]/20 text-[#cfad3b] text-[9px] font-bold uppercase tracking-widest
            hover:bg-[#cfad3b]/20 hover:border-[#cfad3b]/40
            transition-all duration-300 cursor-pointer w-full md:w-auto h-[38px] shadow-sm
          "
        >
          <Plus size={13} />
          Nueva Venta
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <FilterBar
          filters={filters}
          onFilterChange={onFilterChange}
          totalCount={ventas.length}
          filteredCount={filteredVentas.length}
        />
      </div>

      {/* Table */}
      <SalesTable
        ventas={filteredVentas}
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
        customFolders={customFolders}
        onBulkImport={onBulkImport}
      />
    </div>
  )
}
