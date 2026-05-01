import FilterBar from './FilterBar'
import SalesTable from './SalesTable'
import { Download, ChevronDown, Plus } from 'lucide-react'
import { useState } from 'react'
import { exportToCSV, exportToExcel } from '../utils/exportUtils'

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
  onExportAll,
  onBulkImport,
  onNewVenta,
  activeFilter,
  labels = [],
  customFolders = [],
}) {
  const [exportMenuOpen, setExportMenuOpen] = useState(false)

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
        return `Carpeta: ${activeFilter.value}`
      case 'label':
        return `Etiqueta: ${activeFilter.value}`
      default:
        return 'Lista Facturas'
    }
  }

  return (
    <div>
      {/* Header + Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-lg md:text-xl font-bold text-text-primary uppercase tracking-tight">
          {getTitle()}
        </h2>
        
        {/* Actions (Right) */}
        <div className="grid grid-cols-2 md:flex items-center gap-2 w-full md:w-auto">
          {/* Export dropdown */}
          <div className="relative w-full md:w-auto">
            <button
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#316973]/10 border border-[#316973]/20 text-[#316973] text-[9px] font-bold uppercase tracking-widest hover:bg-[#316973]/20 hover:border-[#316973]/40 transition-all cursor-pointer w-full md:w-auto h-[38px] shadow-sm"
            >
              <Download size={13} />
              <span className="truncate">Exportar</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${exportMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {exportMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setExportMenuOpen(false)} />
                <div className="absolute right-0 mt-2 bg-white border border-border/40 rounded-xl shadow-xl z-50 min-w-[140px] overflow-hidden animate-slide-down">
                  <button
                    onClick={() => { onExportAll?.('csv'); setExportMenuOpen(false) }}
                    className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-text-primary hover:bg-blue/5 hover:text-blue transition-colors cursor-pointer"
                  >
                    Archivo CSV
                  </button>
                  <div className="h-px bg-border/20 mx-2" />
                  <button
                    onClick={() => { onExportAll?.('xlsx'); setExportMenuOpen(false) }}
                    className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-text-primary hover:bg-blue/5 hover:text-blue transition-colors cursor-pointer"
                  >
                    Excel (.xlsx)
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={onBulkImport}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#7a4bf0]/10 border border-[#7a4bf0]/20 text-[#7a4bf0] text-[9px] font-bold uppercase tracking-widest hover:bg-[#7a4bf0]/20 hover:border-[#7a4bf0]/40 transition-all cursor-pointer w-full md:w-auto h-[38px] shadow-sm"
          >
            <Download size={13} />
            Carga Masiva
          </button>

          <button
            onClick={onNewVenta}
            className="
              flex items-center justify-center gap-2 px-4 py-2 rounded-xl
              bg-[#cfad3b]/10 border border-[#cfad3b]/20 text-[#cfad3b] text-[9px] font-bold uppercase tracking-widest
              hover:bg-[#cfad3b]/20 hover:border-[#cfad3b]/40
              transition-all duration-300 cursor-pointer w-full md:w-auto h-[38px]
              col-span-2 md:col-span-1 shadow-sm
            "
          >
            <Plus size={13} />
            Nueva Venta
          </button>
        </div>
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
      />
    </div>
  )
}
