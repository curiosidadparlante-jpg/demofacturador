import { useState } from 'react'
import { FileText, Loader2, X, Download, Trash2, RotateCcw, Archive, FolderKanban, Tag, ChevronDown, AlertTriangle } from 'lucide-react'

export default function EmitirFacturaBar({ 
  selectedCount, 
  selectedVentas = [], 
  onEmitir, 
  onClear, 
  onExport, 
  onBulkDelete, 
  onBulkRetry, 
  onBulkArchive,
  customFolders = [],
  labels = [],
  onBulkMove,
  onBulkTag,
  onPermanentDelete,
}) {
  const [loading, setLoading] = useState(false)
  const [showFolderMenu, setShowFolderMenu] = useState(false)
  const [showLabelMenu, setShowLabelMenu] = useState(false)
  const [confirmPermanent, setConfirmPermanent] = useState(false)

  const handleEmitir = async () => {
    setLoading(true)
    try {
      await onEmitir()
    } finally {
      setLoading(false)
    }
  }

  if (selectedCount === 0) return null

  const hasErrors = selectedVentas.some(v => v.status === 'error')
  const hasPendientes = selectedVentas.some(v => v.status === 'pendiente')

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
        <div className="flex items-center gap-3 bg-[#121212] border border-white/10 rounded-2xl px-5 py-3 shadow-2xl shadow-black/40">
          {/* Count */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent text-white text-xs font-bold">
              {selectedCount}
            </span>
            <span className="text-white/70 text-sm hidden lg:inline">
              {selectedCount === 1 ? 'seleccionada' : 'seleccionadas'}
            </span>
          </div>

          <div className="w-px h-8 bg-white/20" />

          {/* Emit */}
          {hasPendientes && (
            <button
              id="btn-emitir-factura"
              onClick={handleEmitir}
              disabled={loading}
              className="
                flex items-center gap-2 px-4 py-2 rounded-xl
                bg-red-subtle border border-red/20 text-red text-xs font-bold
                uppercase tracking-wider transition-all duration-200
                hover:bg-red/10 active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed
                cursor-pointer
              "
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
              <span className="hidden sm:inline">Facturar</span>
            </button>
          )}

          {/* Retry errors */}
          {hasErrors && onBulkRetry && (
            <button
              onClick={onBulkRetry}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-subtle border border-yellow/20 text-yellow text-xs font-bold uppercase tracking-wider active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">Reintentar</span>
            </button>
          )}

          {/* Export */}
          {onExport && (
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider active:scale-95 hover:bg-white/20 transition-all cursor-pointer"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Exportar</span>
            </button>
          )}

          {/* Archive / Unarchive */}
          {onBulkArchive && (() => {
            const allArchived = selectedVentas.every(v => v.archivada)
            return (
              <button
                onClick={onBulkArchive}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple/10 border border-purple/20 text-purple text-xs font-bold uppercase tracking-wider active:scale-95 transition-all cursor-pointer"
              >
                <Archive size={14} />
                <span className="hidden sm:inline">{allArchived ? 'Desarchivar' : 'Archivar'}</span>
              </button>
            )
          })()}

          {/* Delete (soft) */}
          {onBulkDelete && (
            <button
              onClick={onBulkDelete}
              className="
                flex items-center gap-2 px-4 py-2 rounded-xl
                bg-accent hover:bg-accent-hover text-white text-xs font-bold
                uppercase tracking-wider active:scale-95 transition-all cursor-pointer
              "
            >
              <Trash2 size={14} />
              <span className="hidden sm:inline">Eliminar</span>
            </button>
          )}

          {/* Permanent Delete (trash view) */}
          {onPermanentDelete && (
            <button
              onClick={() => setConfirmPermanent(true)}
              className="
                flex items-center gap-2 px-4 py-2 rounded-xl
                bg-[#C0443C] hover:bg-[#a83830] text-white text-xs font-bold
                uppercase tracking-wider active:scale-95 transition-all cursor-pointer
              "
            >
              <Trash2 size={14} />
              <span className="hidden sm:inline">Borrar definitivamente</span>
            </button>
          )}

          {/* Clear */}
          <button
            onClick={onClear}
            className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Deseleccionar todo"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Permanent Delete Confirmation Modal */}
      {confirmPermanent && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]" onClick={() => setConfirmPermanent(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-[90%] max-w-[400px] bg-white rounded-2xl shadow-2xl border border-border/40 animate-scale-up overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#C0443C]/10 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-[#C0443C]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Borrar definitivamente</h3>
                  <p className="text-[11px] text-text-muted mt-0.5">Esta acción no se puede deshacer</p>
                </div>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Estás por eliminar <strong>{selectedCount} venta(s)</strong> de forma permanente. 
                No podrás recuperarlas después de confirmar.
              </p>
            </div>
            <div className="flex items-center gap-2 px-6 py-4 bg-surface-alt/30 border-t border-border/40">
              <button
                onClick={() => setConfirmPermanent(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-alt transition-colors cursor-pointer uppercase tracking-wider"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setConfirmPermanent(false)
                  onPermanentDelete()
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#C0443C] hover:bg-[#a83830] text-white text-xs font-bold cursor-pointer uppercase tracking-wider transition-colors"
              >
                Sí, borrar
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
