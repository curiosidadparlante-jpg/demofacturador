import { useState } from 'react'
import { useVentas } from '../hooks/useVentas'
import StatsCards from '../components/StatsCards'
import SalesTable from '../components/SalesTable'
import EmitirFacturaBar from '../components/EmitirFacturaBar'
import SummaryModal from '../components/SummaryModal'
import Layout from '../components/Layout'
import { RefreshCw } from 'lucide-react'

export default function Home() {
  const { ventas, loading, error, refetch, updateVentaStatus, deleteVenta } = useVentas()
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [toast, setToast] = useState(null)
  
  // ─── Modal State ───
  const [isModalOpen, setIsModalOpen] = useState(false)
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
    const n8nUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://n8n.tudominio.com/webhook/test-afip'
    const isMock = !n8nUrl || n8nUrl.includes('test-afip')

    const selectedVentas = ventas.filter(v => selectedIds.has(v.id) && v.status !== 'facturado')
    if (selectedVentas.length === 0) {
      showToast('No hay ventas pendientes o con error seleccionadas', 'error')
      return
    }

    // Mark as 'procesando'
    for (const venta of selectedVentas) {
      try {
        await updateVentaStatus(venta.id, 'procesando')
      } catch (err) {
        console.error(`Error actualizando status de venta ${venta.id}:`, err)
      }
    }

    try {
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

      console.log('Enviando a API AFIP interna...');
      const response = await fetch('/api/afip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error API status ${response.status}`);
      }

      const { resultados } = data;
      let successCount = 0;
      let errorCount = 0;

      for (const resItem of resultados) {
        try {
          if (resItem.status === 'error') {
             const ventaOriginal = selectedVentas.find(v => v.id === resItem.id);
             const nuevosDatos = { ...ventaOriginal?.datos_fiscales, error_detalle: resItem.error_detalle };
             await updateVentaStatus(resItem.id, 'error', { datos_fiscales: nuevosDatos });
             errorCount++;
          } else if (resItem.status === 'facturado') {
             const ventaOriginal = selectedVentas.find(v => v.id === resItem.id);
             const nuevosDatos = { ...ventaOriginal?.datos_fiscales, comprobante_numero: resItem.comprobante_numero };
             
             await updateVentaStatus(resItem.id, 'facturado', {
                cae: resItem.cae,
                cae_vto: resItem.cae_vto,
                datos_fiscales: nuevosDatos
             });
             successCount++;
          }
        } catch (updateErr) {
          console.error(`Error de UI actualizando BD (Venta ${resItem.id}):`, updateErr);
        }
      }

      if (errorCount > 0) {
         showToast(`Proceso completado: ${successCount} ok, ${errorCount} errores.`, 'error');
      } else if (successCount > 0) {
         showToast(`${successCount} ${successCount === 1 ? 'factura procesada' : 'facturas procesadas'} con éxito`, 'success');
      }

      setSelectedIds(new Set())
      
    } catch (err) {
      console.error('[handleInvoice] Falló la emisión:', err.message)
      showToast(err.message, 'error')

      for (const venta of selectedVentas) {
        const nuevosDatos = { ...venta.datos_fiscales, error_detalle: err.message }
        await updateVentaStatus(venta.id, 'error', { datos_fiscales: nuevosDatos })
      }
    }
  }

  // ─── Create Test Sale handler ───
  const handleCreateTestSale = async (shouldFail = false) => {
    try {
      const { supabase } = await import('../lib/supabase')
      const name = shouldFail 
        ? 'Empresa con CUIT Inválido (Test Error)' 
        : ['Juan Pérez', 'María García', 'Carlos Rodríguez', 'Ana López'][Math.floor(Math.random() * 4)]
      
      const { error: insertError } = await supabase
        .from('ventas')
        .insert([{
          cliente: name,
          monto: Math.floor(Math.random() * 50000) + 1000,
          status: 'pendiente',
          datos_fiscales: { 
            cuit: shouldFail ? '99-99999999-9' : '20-12345678-9', 
            force_fail: shouldFail 
          }
        }])

      if (insertError) throw insertError
      showToast(shouldFail ? 'Venta propensa a error creada' : 'Venta de prueba creada', 'success')
    } catch (err) {
      console.error('Error al crear venta de prueba:', err)
      showToast('Error al crear venta: ' + err.message, 'error')
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
        {/* ─── Header ─── */}
        <div className="flex items-end justify-end">
        <div className="flex gap-3">
          <button
            onClick={() => handleCreateTestSale(true)}
            className="
              flex items-center gap-2 px-4 py-2 rounded-lg
              bg-red-subtle border border-red/20
              text-red text-sm font-medium
              hover:bg-red/20
              transition-all duration-200
              cursor-pointer
            "
          >
            + Venta Fallida
          </button>
          <button
            onClick={() => handleCreateTestSale(false)}
            className="
              flex items-center gap-2 px-4 py-2 rounded-lg
              bg-accent/10 border border-accent/20
              text-accent text-sm font-medium
              hover:bg-accent/20
              transition-all duration-200
              cursor-pointer
            "
          >
            + Venta de Prueba
          </button>
        </div>
      </div>

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
          <span className="text-xs text-text-muted">{ventas.length} registros</span>
        </div>
        <SalesTable
          ventas={ventas}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleAll={handleToggleAll}
          loading={loading}
          onShowError={(msg) => showToast(msg, 'error')}
        />
      </div>

      {/* ─── Floating action bar ─── */}
      <EmitirFacturaBar
        selectedCount={selectedIds.size}
        onEmitir={handleInvoice}
        onClear={handleClearSelection}
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
          ${toast.type === 'error'
            ? 'bg-red-subtle border border-red/20 text-red'
            : 'bg-green-subtle border border-green/20 text-green'
          }
        `}>
          {toast.message}
        </div>
      )}
      </div>
    </Layout>
  )
}
