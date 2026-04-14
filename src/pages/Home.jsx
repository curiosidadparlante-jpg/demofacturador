import { useState } from 'react'
import { useVentas } from '../hooks/useVentas'
import StatsCards from '../components/StatsCards'
import SalesTable from '../components/SalesTable'
import EmitirFacturaBar from '../components/EmitirFacturaBar'
import SummaryModal from '../components/SummaryModal'
import Layout from '../components/Layout'
import { RefreshCw, Plus } from 'lucide-react'
import EditSaleModal from '../components/EditSaleModal'
import AddSaleModal from '../components/AddSaleModal'

export default function Home() {
  const { ventas, setVentas, loading, error, refetch, updateVentaStatus, updateVenta, createVenta, deleteVenta } = useVentas()
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [toast, setToast] = useState(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  
  // ─── Modal State ───
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVenta, setEditingVenta] = useState(null)
  const [modalData, setModalData] = useState({ title: '', ventas: [] })

  const handleCardClick = (title, filteredVentas, timeframe) => {
    let tfLabel = ''
    if (timeframe === 'day') tfLabel = ' (Hoy)'
    if (timeframe === 'week') tfLabel = ' (Esta Sem)'
    if (timeframe === 'month') tfLabel = ' (Este Mes)'
    if (timeframe === 'all') tfLabel = ' (Histórico)'

    setModalData({ title: `${title}${tfLabel}`, ventas: filteredVentas })
    setIsModalOpen(true)
  }

  // ─── Selection handlers ───
  const handleToggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleToggleAll = () => {
    const seleccionables = ventas.filter(v => v.status !== 'facturado')
    if (selectedIds.size === seleccionables.length && seleccionables.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(seleccionables.map(v => v.id)))
    }
  }

  const handleClearSelection = () => {
    setSelectedIds(new Set())
  }

  // ─── Show toast ───
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  // ─── Delete handler for Modal ───
  const handleDeleteVenta = async (id) => {
    try {
      await deleteVenta(id)
      showToast('Venta eliminada del sistema', 'success')
      // Update modal data to remove the deleted item from the view immediately
      setModalData(prev => ({
        ...prev,
        ventas: prev.ventas.filter(v => v.id !== id)
      }))
    } catch (err) {
      console.error('Error al eliminar:', err)
      showToast('Error al eliminar: ' + err.message, 'error')
    }
  }

  // ─── Emitir Factura handler ───
  const handleInvoice = async () => {
    const selectedVentas = ventas.filter(v => selectedIds.has(v.id) && v.status !== 'facturado')
    if (selectedVentas.length === 0) {
      showToast('No hay ventas pendientes o con error seleccionadas', 'error')
      return
    }

    try {
      showToast('Emitiendo factura...', 'info')
      
      // 1. Actualización local al instante para feedback visual (procesando...) y evitamos 401
      setVentas(prev => prev.map(v => 
        selectedIds.has(v.id) ? { ...v, status: 'procesando' } : v
      ))
      
      const payload = {
        ventas: selectedVentas.map(v => ({
          id: v.id,
          fecha: v.fecha,
          cliente: v.cliente,
          monto: v.monto,
          datos_fiscales: v.datos_fiscales || {},
          mp_payment_id: v.mp_payment_id,
        })),
      }

      const response = await fetch('/api/afip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json()
      const resultados = data.resultados || []
      const successCount = resultados.filter(r => r.success).length
      
      // 2. Actualizamos solo las filas afectadas localmente con el resultado real
      setVentas(prev => prev.map(v => {
        const res = resultados.find(r => r.id === v.id)
        if (res) {
          if (res.success) {
            return { 
              ...v, 
              status: 'facturado', 
              cae: res.cae, 
              nro_comprobante: res.nro 
            }
          } else {
            return { 
              ...v, 
              status: 'error',
              datos_fiscales: { 
                ...v.datos_fiscales, 
                error_detalle: res.error 
              }
            }
          }
        }
        return v
      }))

      setSelectedIds(new Set())
      
      if (successCount === resultados.length) {
        showToast(`Se emitieron ${successCount} comprobantes con éxito`, 'success')
      } else {
        showToast(`Se procesaron ${successCount} de ${resultados.length} correctamente.`, 'warning')
      }

    } catch (err) {
      console.error('[handleInvoice] Error:', err.message)
      showToast('Error al procesar facturas: ' + err.message, 'error')
      
      // Revertimos a pendiente localmente en caso de fallo general
      setVentas(prev => prev.map(v => 
        v.status === 'procesando' ? { ...v, status: 'pendiente' } : v
      ))
    }
  }

  const handleEditVenta = async (id, payload) => {
    try {
      await updateVenta(id, payload)
      showToast('Datos actualizados correctamente', 'success')
    } catch (err) {
      console.error('Error al actualizar venta:', err)
      showToast('Error al actualizar: ' + err.message, 'error')
    }
  }

  const handleCreateVenta = async (payload) => {
    try {
      await createVenta(payload)
      showToast('Venta agregada correctamente', 'success')
    } catch (err) {
      console.error('Error al crear venta:', err)
      showToast('Error al crear venta: ' + err.message, 'error')
      throw err
    }
  }

  const headerActions = (
    <button
      onClick={refetch}
      disabled={loading}
      className="
        flex items-center gap-2 px-3 py-1.5 rounded-full
        bg-surface border border-border mr-2
        text-text-secondary text-[11px] font-bold tracking-widest uppercase
        hover:bg-surface-alt hover:text-text-primary
        transition-all duration-200
        disabled:opacity-50 cursor-pointer
      "
      style={{fontFamily: 'Space Grotesk'}}
    >
      <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
      <span className="hidden sm:inline">ACTUALIZAR</span>
    </button>
  )

  return (
    <Layout headerActions={headerActions}>
      <div className="space-y-6">

      {/* ─── Error banner ─── */}
      {error && (
        <div className="bg-red-subtle border border-red/20 rounded-xl px-4 py-3 text-red text-sm animate-slide-down">
          Error cargando ventas: {error}
        </div>
      )}

      {/* ─── Stats ─── */}
      <StatsCards ventas={ventas} onCardClick={handleCardClick} />

      {/* ─── Table section ─── */}
      <div>
        <div className="flex items-center justify-between mb-3 mt-6">
          <h2 className="text-xl font-black text-text-secondary uppercase tracking-wider" style={{fontFamily: 'Montserrat'}}>
            Lista Facturas
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted">{ventas.length} registros</span>
            <button
              onClick={() => setAddModalOpen(true)}
              className="
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                bg-black text-white text-xs font-bold uppercase tracking-wider
                hover:-translate-y-0.5 hover:shadow-lg
                transition-all duration-200 cursor-pointer
              "
              style={{ fontFamily: 'Space Grotesk' }}
            >
              <Plus size={14} />
              Nueva Venta
            </button>
          </div>
        </div>
        <SalesTable
          ventas={ventas}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleAll={handleToggleAll}
          loading={loading}
          onShowError={(msg) => showToast(msg, 'error')}
          onEdit={(venta) => setEditingVenta(venta)}
        />
      </div>

      {/* ─── Floating action bar ─── */}
      <EmitirFacturaBar
        selectedCount={selectedIds.size}
        onEmitir={handleInvoice}
        onClear={handleClearSelection}
      />

      {/* ─── Edit Modal ─── */}
      <EditSaleModal
        isOpen={!!editingVenta}
        onClose={() => setEditingVenta(null)}
        venta={editingVenta}
        onSave={handleEditVenta}
      />

      {/* ─── Add Sale Modal ─── */}
      <AddSaleModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleCreateVenta}
      />

      {/* ─── Summary Modal ─── */}
      <SummaryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalData.title}
        ventas={modalData.ventas}
        onDelete={handleDeleteVenta}
        onShowError={(msg) => showToast(msg, 'error')}
      />

      {/* ─── Toast ─── */}
      {toast && (
        <div className={`
          fixed top-6 right-6 z-50 animate-slide-down
          px-4 py-3 rounded-xl text-sm font-medium shadow-xl shadow-black/30
          ${
            toast.type === 'error'   ? 'bg-red-subtle border border-red/20 text-red' :
            toast.type === 'warning' ? 'bg-yellow-subtle border border-yellow/20 text-yellow' :
            toast.type === 'info'    ? 'bg-accent-subtle border border-accent/20 text-accent' :
                                       'bg-green-subtle border border-green/20 text-green'
          }
        `}>
          {toast.message}
        </div>
      )}
      </div>
    </Layout>
  )
}
