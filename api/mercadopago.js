import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || 'https://seiurmfdeuoxdwlddons.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const body = req.body
    const { type, data } = body

    // ─── Solo procesamos notificaciones de pago de Mercado Pago ───
    if (type !== 'payment' || !data?.id) {
      return res.status(200).json({ received: true, processed: false })
    }

    const paymentId = String(data.id)
    const webhookSecret = process.env.MP_WEBHOOK_SECRET
    
    // ─── Validación de Firma HMAC de Mercado Pago ───
    if (webhookSecret) {
      const xSignature = req.headers['x-signature']
      const xRequestId = req.headers['x-request-id']

      if (xSignature && xRequestId) {
        const parts = xSignature.split(',')
        const tsEntry = parts.find(p => p.trim().startsWith('ts='))
        const v1Entry = parts.find(p => p.trim().startsWith('v1='))

        if (tsEntry && v1Entry) {
          const ts = tsEntry.split('=')[1]
          const v1 = v1Entry.split('=')[1]

          const manifest = `id:${paymentId};request-id:${xRequestId};ts:${ts};`
          const hmac = crypto.createHmac('sha256', webhookSecret)
          hmac.update(manifest)
          const expectedSignature = hmac.digest('hex')

          if (expectedSignature !== v1) {
            console.warn('[Webhook MP] Firma inválida reportada')
            return res.status(403).json({ error: 'Invalid signature' })
          }
        }
      }
    }

    // ─── Control de duplicados (Idempotencia) ───
    const { data: existing } = await supabaseAdmin
      .from('ventas')
      .select('id')
      .eq('mp_payment_id', paymentId)
      .maybeSingle()

    if (existing) {
      return res.status(200).json({ received: true, duplicate: true })
    }

    // ─── Registro en Base de Datos ───
    // MP no manda tooooooda la info en el Webhook. Si queremos todos los datos del pagador (CUIT, etc) 
    // en producción habría que hacer un fetch a la API de Mercado Pago con el paymentId.
    // Para simplificar la demo, usamos la metadata extra si existe.
    
    const ventaRecord = {
      fecha: new Date().toISOString(),
      cliente: body.additional_info?.payer?.first_name 
        ? `${body.additional_info.payer.first_name} ${body.additional_info.payer.last_name || ''}`.trim()
        : `Venta MP #${paymentId}`,
      monto: body.transaction_amount || 0,
      status: 'pendiente',
      mp_payment_id: paymentId,
      datos_fiscales: body.additional_info?.payer || {},
    }

    const { error } = await supabaseAdmin.from('ventas').insert([ventaRecord])
    if (error) throw error

    return res.status(200).json({ received: true, processed: true })

  } catch (err) {
    console.error('[Webhook MP] Error Crítico:', err)
    return res.status(500).json({ error: err.message })
  }
}
