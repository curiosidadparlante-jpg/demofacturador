import { useState } from 'react'
import { FileText, Loader2, X } from 'lucide-react'

export default function EmitirFacturaBar({ selectedCount, onEmitir, onClear }) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      await onEmitir()
    } finally {
      setLoading(false)
    }
  }

  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="flex items-center gap-4 bg-surface border border-border rounded-2xl px-6 py-3 shadow-2xl shadow-black/40">
        {/* Count */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent text-white text-xs font-bold">
            {selectedCount}
          </span>
          <span className="text-text-secondary text-sm">
            {selectedCount === 1 ? 'venta seleccionada' : 'ventas seleccionadas'}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-border" />

        {/* Emit button */}
        <button
          id="btn-emitir-factura"
          onClick={handleClick}
          disabled={loading}
          className="
            flex items-center gap-2 px-5 py-2.5 rounded-xl
            bg-accent hover:bg-accent-hover text-white text-sm font-semibold
            uppercase tracking-wider
            transition-all duration-200
            hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/25
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
            cursor-pointer
          "
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <FileText size={16} />
          )}
          Emitir Factura
        </button>

        {/* Clear selection */}
        <button
          onClick={onClear}
          className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
          title="Deseleccionar todo"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
