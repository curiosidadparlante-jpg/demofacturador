import crypto from 'crypto'
import { supabaseAdmin } from '../lib/supabaseServer.js'

export async function webhookMercadoPago(req, res) {
  try {
    // ─── Parse the raw body ───
    const rawBody = req.body
    const body = typeof rawBody === 'string'
      ? JSON.parse(rawBody)
      : JSON.parse(rawBody.toString('utf8'))

    const { type, data, action } = body

    // ─── Only process payment notifications ───
    if (type !== 'payment' || !data?.id) {
      return res.status(200).json({ received: true, processed: false })
    }

    const paymentId = String(data.id)

    // ─── Validate x-signature (HMAC SHA256) ───
    const webhookSecret = process.env.MP_WEBHOOK_SECRET
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
            console.warn('[Webhook MP] Firma inválida — descartando request')
            return res.status(403).json({ error: 'Invalid signature' })
          }
        }
      }
    }

    // ─── Idempotency: check if payment already exists ───
    const { data: existing } = await supabaseAdmin
      .from('ventas')
      .select('id')
      .eq('mp_payment_id', paymentId)
      .maybeSingle()

    if (existing) {
      console.log(`[Webhook MP] Payment ${paymentId} already registered — skipping`)
      return res.status(200).json({ received: true, duplicate: true })
    }

    // ─── Fetch payment details from MercadoPago API ───
    // In production, you'd fetch from MP API to get billing_info
    // For now we build the record from the webhook payload
    const now = new Date().toISOString()

    const ventaRecord = {
      fecha: now,
      cliente: body.additional_info?.payer?.first_name
        ? `${body.additional_info.payer.first_name} ${body.additional_info.payer.last_name || ''}`.trim()
        : `Cliente MP #${paymentId}`,
      monto: body.transaction_amount || 0,
      status: 'pendiente',
      mp_payment_id: paymentId,
      datos_fiscales: body.additional_info?.payer || {},
      cae: null,
      cae_vto: null,
    }

    // ─── Insert into Supabase ───
    const { error } = await supabaseAdmin
      .from('ventas')
      .insert([ventaRecord])

    if (error) {
      console.error('[Webhook MP] Error al insertar en Supabase:', error)
      return res.status(500).json({ error: 'Database insert failed' })
    }

    console.log(`[Webhook MP] Venta registrada: Payment ${paymentId}`)
    return res.status(200).json({ received: true, processed: true })

  } catch (err) {
    console.error('[Webhook MP] Error procesando webhook:', err)
    return res.status(200).json({ received: true, error: err.message })
  }
}
