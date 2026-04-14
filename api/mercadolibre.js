import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const body = req.body

    // ─── Mercado Libre manda validaciones de endpoint sin topic a veces ───
    if (!body || !body.topic || !body.resource) {
      // Retornar 200 rápido si es un ping o payload vacío
      return res.status(200).json({ received: true, processed: false, reason: 'Invalid payload' })
    }

    // ─── Solo procesamos órdenes (ventas) ───
    if (body.topic !== 'orders_v2') {
      return res.status(200).json({ received: true, processed: false, topic: body.topic })
    }

    const orderResourceUrl = body.resource // ej: /orders/2000000000
    const orderId = orderResourceUrl.split('/').pop()
    
    // ─── Control de duplicados (Idempotencia) ───
    const { data: existing } = await supabaseAdmin
      .from('ventas')
      .select('id')
      .eq('mp_payment_id', orderId) // Podemos seguir usando esta columna o crear una meli_order_id. Por simpleza reciclo la existente.
      .maybeSingle()

    if (existing) {
      return res.status(200).json({ received: true, duplicate: true })
    }

    // ─── Obtener detalles de la orden desde MeLi API ───
    const meliAccessToken = process.env.MELI_ACCESS_TOKEN
    let orderData = null

    if (meliAccessToken) {
      try {
        const response = await fetch(`https://api.mercadolibre.com${orderResourceUrl}`, {
          headers: {
            'Authorization': `Bearer ${meliAccessToken}`
          }
        })
        
        if (!response.ok) {
          throw new Error(`MeLi API status: ${response.status} - ${await response.text()}`)
        }
        
        orderData = await response.json()
      } catch (meliErr) {
        console.error('[Webhook MeLi] Error obteniendo orden:', orderId, meliErr.message)
      }
    } else {
      console.warn('[Webhook MeLi] No hay MELI_ACCESS_TOKEN configurado.')
    }

    // Construcción del registro
    const clienteNombre = orderData?.buyer?.first_name 
      ? `${orderData.buyer.first_name} ${orderData.buyer.last_name || ''}`.trim()
      : orderData?.buyer?.nickname || `Venta MeLi #${orderId}`

    const monto = orderData?.total_amount || 0

    // Extraemos el DNI/CUIT de billing_info
    const docNumber = orderData?.buyer?.billing_info?.doc_number || orderData?.buyer?.identification?.number || ''

    const ventaRecord = {
      fecha: orderData?.date_created || new Date().toISOString(),
      cliente: clienteNombre,
      monto: monto,
      status: 'pendiente',
      mp_payment_id: orderId, // guardamos el orderId acá para reuso
      datos_fiscales: {
        email: orderData?.buyer?.email,
        identification: {
           type: orderData?.buyer?.billing_info?.doc_type || 'DNI',
           number: docNumber
        },
        cuit: docNumber, // Campo importante para la afip_api
        shipping_id: orderData?.shipping?.id,
        meli_status: orderData?.status
      },
    }

    const { error } = await supabaseAdmin.from('ventas').insert([ventaRecord])
    if (error) throw error

    return res.status(200).json({ received: true, processed: true })

  } catch (err) {
    console.error('[Webhook MeLi] Error Crítico:', err)
    return res.status(500).json({ error: err.message })
  }
}
