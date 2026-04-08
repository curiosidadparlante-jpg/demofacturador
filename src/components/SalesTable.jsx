import StatusBadge from './StatusBadge'
import { AlertCircle } from 'lucide-react'

export default function SalesTable({ ventas, selectedIds, onToggleSelect, onToggleAll, loading, onShowError }) {
  const pendientes = ventas.filter(v => v.status !== 'facturado')
  const allSelected = pendientes.length > 0 && selectedIds.size === pendientes.length

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(Number(amount) || 0)
  }

  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="p-12 text-center">
          <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-text-muted text-sm">Cargando ventas...</p>
        </div>
      </div>
    )
  }

  if (!ventas.length) {
    return (
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="p-12 text-center">
          <div className="text-4xl mb-3 opacity-30">📋</div>
          <p className="text-text-secondary text-sm font-medium">No hay ventas registradas</p>
          <p className="text-text-muted text-xs mt-1">
            Las ventas aparecerán aquí cuando se registren pagos desde Mercado Pago
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="w-12 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleAll}
                  className="w-4 h-4 rounded border-border bg-surface-alt accent-accent cursor-pointer"
                  id="select-all-checkbox"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Monto
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Factura
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                CAE
              </th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((venta, i) => {
              const isSelected = selectedIds.has(venta.id)
              return (
                <tr
                  key={venta.id}
                  onClick={() => venta.status !== 'facturado' && onToggleSelect(venta.id)}
                    className={`
                      border-b border-border transition-colors duration-150
                      ${venta.status === 'facturado' ? 'cursor-default opacity-80' : 'cursor-pointer hover:bg-surface-alt hover:opacity-90'}
                      ${isSelected ? 'bg-[#EAE4D3]' : ''}
                    `}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={venta.status === 'facturado'}
                      onChange={() => onToggleSelect(venta.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-border bg-surface-alt accent-accent cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-text-primary font-medium">{formatDate(venta.fecha)}</div>
                    <div className="text-text-muted text-xs">{formatTime(venta.fecha)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-text-primary">{venta.cliente || '—'}</div>
                    {venta.mp_payment_id && (
                      <div className="text-text-muted text-xs font-mono">
                        MP #{venta.mp_payment_id}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-text-primary font-semibold tabular-nums">
                      {formatCurrency(venta.monto)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={venta.status} />
                      {venta.status === 'error' && venta.datos_fiscales?.error_detalle && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onShowError(venta.datos_fiscales.error_detalle) }}
                          className="text-red hover:text-red-400 transition-colors p-1"
                          title="Ver motivo de rechazo"
                        >
                          <AlertCircle size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-text-primary text-xs font-mono whitespace-nowrap">
                      {venta.datos_fiscales?.comprobante_numero || <span className="text-text-muted">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {venta.cae ? (
                      <div>
                        <div className="text-text-primary text-xs font-mono">{venta.cae}</div>
                        {venta.cae_vto && (
                          <div className="text-text-muted text-xs">
                            Vto: {formatDate(venta.cae_vto)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-text-muted text-xs">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
