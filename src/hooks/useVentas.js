import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useVentas() {
  const [ventas, setVentas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchVentas = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('ventas')
        .select('*')
        .order('fecha', { ascending: false })

      if (fetchError) throw fetchError
      setVentas(data || [])
    } catch (err) {
      console.error('[useVentas] Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVentas()

    // ─── Auto-polling cada 30 segundos ───
    const pollInterval = setInterval(() => {
      supabase
        .from('ventas')
        .select('*')
        .order('fecha', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) {
            setVentas(data)
          }
        })
    }, 30000)

    // ─── Realtime subscription ───
    const channel = supabase
      .channel('ventas-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ventas' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setVentas(prev => {
              if (prev.some(v => v.id === payload.new.id)) return prev;
              return [payload.new, ...prev].sort((a,b) => new Date(b.fecha) - new Date(a.fecha))
            })
          } else if (payload.eventType === 'UPDATE') {
            setVentas(prev =>
              prev.map(v => v.id === payload.new.id ? payload.new : v)
            )
          } else if (payload.eventType === 'DELETE') {
            setVentas(prev => prev.filter(v => v.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      clearInterval(pollInterval)
      supabase.removeChannel(channel)
    }
  }, [fetchVentas])

  const updateVentaStatus = useCallback(async (id, status, extraFields = {}) => {
    const { error: updateError } = await supabase
      .from('ventas')
      .update({ status, ...extraFields })
      .eq('id', id)
    if (updateError) throw updateError
  }, [])

  const updateVenta = useCallback(async (id, payload) => {
    const { error: updateError } = await supabase
      .from('ventas')
      .update(payload)
      .eq('id', id)
    if (updateError) throw updateError
  }, [])

  const createVenta = useCallback(async (payload) => {
    const { data, error: createError } = await supabase
      .from('ventas')
      .insert([payload])
      .select()
      .single()
    if (createError) throw createError
    return data
  }, [])

  const deleteVenta = useCallback(async (id) => {
    const { error: deleteError } = await supabase
      .from('ventas')
      .update({ status: 'borrada' })
      .eq('id', id)
    if (deleteError) throw deleteError
  }, [])

  const hardDeleteVenta = useCallback(async (id) => {
    const { error: deleteError } = await supabase
      .from('ventas')
      .delete()
      .eq('id', id)
    if (deleteError) throw deleteError
  }, [])

  const archiveVenta = useCallback(async (id) => {
    const { error: archiveError } = await supabase
      .from('ventas')
      .update({ status: 'archivada' })
      .eq('id', id)
    if (archiveError) throw archiveError
  }, [])

  const bulkCreateVentas = useCallback(async (payloads) => {
    const { data, error: createError } = await supabase
      .from('ventas')
      .insert(payloads)
      .select()
    if (createError) throw createError
    return data
  }, [])

  const updateVentaEtiqueta = useCallback(async (id, etiqueta) => {
     // Nota: La tabla 'ventas' debe tener columna 'etiquetas' (JSONB)
     // Por ahora lo manejamos localmente o actualizamos si existe la columna
     const venta = ventas.find(v => v.id === id)
     if (!venta) return
     
     let next = venta.etiquetas || []
     if (etiqueta === '' || etiqueta === null) next = []
     else if (next.includes(etiqueta)) next = next.filter(e => e !== etiqueta)
     else next = [...next, etiqueta]

     await updateVenta(id, { etiquetas: next })
  }, [ventas, updateVenta])

  return { 
    ventas, 
    setVentas,
    loading, 
    error, 
    refetch: fetchVentas, 
    updateVentaStatus, 
    updateVenta, 
    createVenta, 
    deleteVenta, 
    hardDeleteVenta, 
    archiveVenta, 
    bulkCreateVentas,
    updateVentaEtiqueta
  }
}
