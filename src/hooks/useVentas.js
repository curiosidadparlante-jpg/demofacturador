import { useState, useEffect, useCallback } from 'react'

const DUMMY_VENTAS = [
  {
    id: '1',
    fecha: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    cliente: 'Gaston Giraudo',
    monto: 15500,
    status: 'facturado',
    cae: '73123456789012',
    nro_comprobante: '0003-00000123',
    vto_cae: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(),
    mp_payment_id: '1234567890',
    datos_fiscales: {
      cuit: '20111111112',
      condicion_iva: 'Consumidor Final',
      forma_pago: 'efectivo',
      origen: 'manual'
    }
  },
  {
    id: '2',
    fecha: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    cliente: 'Constructora CMD SA',
    monto: 125000,
    status: 'pendiente',
    cae: null,
    nro_comprobante: null,
    vto_cae: null,
    mp_payment_id: null,
    datos_fiscales: {
      cuit: '30555555556',
      condicion_iva: 'IVA Responsable Inscripto',
      forma_pago: 'transferencia',
      origen: 'manual'
    }
  },
  {
    id: '3',
    fecha: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    cliente: 'Maria Lopez',
    monto: 8900,
    status: 'error',
    cae: null,
    nro_comprobante: null,
    vto_cae: null,
    mp_payment_id: 'order-987654321',
    datos_fiscales: {
      cuit: '27222222223',
      condicion_iva: 'Consumidor Final',
      forma_pago: 'tarjeta',
      origen: 'mercadolibre',
      error_detalle: 'El CUIT ingresado no se encuentra en el padrón.'
    }
  },
  {
    id: '4',
    fecha: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    cliente: 'Tech Solutions SRL',
    monto: 45000,
    status: 'facturado',
    cae: '73123456789099',
    nro_comprobante: '0003-00000124',
    vto_cae: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    mp_payment_id: null,
    datos_fiscales: {
      cuit: '30777777778',
      condicion_iva: 'IVA Responsable Inscripto',
      forma_pago: 'transferencia',
      origen: 'manual'
    }
  },
  {
    id: '5',
    fecha: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    cliente: 'Ana Martinez',
    monto: 3200,
    status: 'pendiente',
    cae: null,
    nro_comprobante: null,
    vto_cae: null,
    mp_payment_id: '5566778899',
    datos_fiscales: {
      cuit: '27444444445',
      condicion_iva: 'Consumidor Final',
      forma_pago: 'dinero en cuenta',
      origen: 'mercadopago'
    }
  }
];

export function useVentas() {
  const [ventas, setVentas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchVentas = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const stored = localStorage.getItem('demo_ventas');
      if (stored && stored !== 'undefined' && stored !== 'null') {
        try {
          const parsed = JSON.parse(stored);
          setVentas(Array.isArray(parsed) ? parsed : DUMMY_VENTAS);
        } catch (e) {
          console.error('[useVentas] Parse error, resetting to dummy:', e);
          setVentas(DUMMY_VENTAS);
        }
      } else {
        localStorage.setItem('demo_ventas', JSON.stringify(DUMMY_VENTAS));
        setVentas(DUMMY_VENTAS);
      }
    } catch (err) {
      console.error('[useVentas] Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVentas()
  }, [fetchVentas])

  const saveToLocal = (update) => {
    setVentas(prev => {
      const next = typeof update === 'function' ? update(prev) : update;
      localStorage.setItem('demo_ventas', JSON.stringify(next));
      return next;
    });
  }

  // Debug helper
  useEffect(() => {
    window.VentasDebug = { ventas, setVentas: saveToLocal };
  }, [ventas]);

  const updateVentaStatus = useCallback(async (id, status, extraFields = {}) => {
    saveToLocal(prev => prev.map(v => String(v.id) === String(id) ? { ...v, status, ...extraFields } : v));
  }, [])

  const updateVenta = useCallback(async (id, payload) => {
    saveToLocal(prev => prev.map(v => String(v.id) === String(id) ? { ...v, ...payload } : v));
  }, [])

  const createVenta = useCallback(async (payload) => {
    const newVenta = {
      ...payload,
      id: Math.random().toString(36).substr(2, 9),
      fecha: payload.fecha || new Date().toISOString(),
      status: payload.status || 'pendiente'
    };
    
    setVentas(prev => {
      const next = [newVenta, ...prev];
      localStorage.setItem('demo_ventas', JSON.stringify(next));
      return next;
    });
    
    return newVenta;
  }, [])

  const deleteVenta = useCallback(async (id) => {
    setVentas(prev => {
      const next = prev.map(v => String(v.id) === String(id) ? { ...v, status: 'borrada' } : v);
      localStorage.setItem('demo_ventas', JSON.stringify(next));
      return next;
    });
  }, [])

  const hardDeleteVenta = useCallback(async (id) => {
    saveToLocal(prev => prev.filter(v => String(v.id) !== String(id)));
  }, [])

  const archiveVenta = useCallback(async (id) => {
    saveToLocal(prev => prev.map(v => String(v.id) === String(id) ? { ...v, archivada: true } : v));
  }, [])

  const updateVentaEtiqueta = useCallback(async (id, etiqueta) => {
    saveToLocal(prev => prev.map(v => String(v.id) === String(id) ? { ...v, etiqueta } : v));
  }, [])

  const bulkCreateVentas = useCallback(async (payloads) => {
    const newVentas = payloads.map(p => ({
      ...p,
      id: Math.random().toString(36).substr(2, 9),
      fecha: p.fecha || new Date().toISOString(),
      status: p.status || 'pendiente'
    }));

    setVentas(prev => {
      const next = [...newVentas, ...prev];
      localStorage.setItem('demo_ventas', JSON.stringify(next));
      return next;
    });
    
    return newVentas;
  }, [])

  return { 
    ventas, 
    setVentas: saveToLocal, 
    loading, 
    error, 
    refetch: fetchVentas, 
    updateVentaStatus, 
    updateVenta, 
    createVenta, 
    deleteVenta, 
    hardDeleteVenta, 
    archiveVenta,
    updateVentaEtiqueta,
    bulkCreateVentas 
  }
}
