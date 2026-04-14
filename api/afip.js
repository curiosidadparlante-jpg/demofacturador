import { createClient } from '@supabase/supabase-js'
import Afip from '@afipsdk/afip.js'

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  console.log('=== AFIP API LLAMADA ===')

  try {
    const { ventas } = req.body

    if (!ventas || !Array.isArray(ventas) || ventas.length === 0) {
      return res.status(400).json({ error: 'Lista de ventas vacía' })
    }

    console.log(`Ventas recibidas: ${ventas.length}`)

    // ─── Supabase Admin (escritura con service_role) ───
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Faltan credenciales de Supabase en el servidor (VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)' })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

    // ─── Config AFIP ───
    const cuit = process.env.AFIP_CUIT
    const certBase64 = process.env.AFIP_CERT_BASE64
    const keyBase64 = process.env.AFIP_KEY_BASE64
    const ptoVta = parseInt(process.env.AFIP_PTO_VTA || '1')
    const isProduction = process.env.AFIP_PRODUCTION === 'true'
    const isSandbox = process.env.AFIP_SANDBOX === 'true'

    console.log(`Config: CUIT=${cuit}, PtoVta=${ptoVta}, Production=${isProduction}, Sandbox=${isSandbox}`)

    // ══════════════════════════════════════════════
    //  MODO SANDBOX — Simula sin tocar AFIP
    // ══════════════════════════════════════════════
    if (isSandbox) {
      console.log('--- MODO SANDBOX ACTIVO ---')
      const resultados = []

      for (const v of ventas) {
        const nComp = `SB-${ptoVta}-${Math.floor(Math.random() * 90000000 + 10000000)}`
        const cae = Math.floor(Math.random() * 100000000000000).toString()
        const fVto = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

        const { error: upError } = await supabaseAdmin
          .from('ventas')
          .update({
            status: 'facturado',
            cae: cae,
            nro_comprobante: nComp,
            vto_cae: fVto
          })
          .eq('id', v.id)

        if (upError) {
          console.error(`❌ DB error para venta ${v.id}:`, upError.message)
          resultados.push({ id: v.id, success: false, error: 'Error guardando en DB: ' + upError.message })
        } else {
          console.log(`✅ Sandbox OK: ${v.id} → ${nComp}`)
          resultados.push({ id: v.id, success: true, nro: nComp, cae })
        }
      }

      return res.status(200).json({ success: true, resultados })
    }

    // ══════════════════════════════════════════════
    //  MODO REAL — Facturación electrónica con AFIP
    // ══════════════════════════════════════════════
    if (!cuit || !certBase64 || !keyBase64) {
      return res.status(500).json({
        error: 'Faltan credenciales de AFIP (AFIP_CUIT, AFIP_CERT_BASE64, AFIP_KEY_BASE64). Configurá las variables en Vercel.'
      })
    }

    const cert = Buffer.from(certBase64, 'base64').toString('ascii')
    const key = Buffer.from(keyBase64, 'base64').toString('ascii')
    const sdkToken = process.env.AFIP_SDK_TOKEN

    if (!sdkToken) {
      return res.status(500).json({
        error: 'Falta la variable AFIP_SDK_TOKEN en Vercel. Registrate en app.afipsdk.com para obtener tu token.'
      })
    }

    const afip = new Afip({
      CUIT: parseInt(cuit),
      cert: cert,
      key: key,
      production: isProduction,
      access_token: sdkToken
    })

    console.log('AFIP SDK inicializado correctamente')

    const resultados = []

    for (const v of ventas) {
      try {
        // Obtener último comprobante y calcular el siguiente
        const lastVoucher = await afip.ElectronicBilling.getLastVoucher(ptoVta, 11)
        const nextVoucher = lastVoucher + 1

        console.log(`Venta ${v.id}: último comprobante=${lastVoucher}, siguiente=${nextVoucher}`)

        // Determinar tipo de documento del receptor
        const cuitCliente = v.datos_fiscales?.cuit?.replace(/-/g, '')
        const docTipo = cuitCliente && cuitCliente.length >= 10 ? 80 : 99  // 80=CUIT, 99=Consumidor Final
        const docNro = docTipo === 80 ? parseInt(cuitCliente) : 0

        // Armar el comprobante (Factura C - tipo 11)
        const data = {
          'CantReg': 1,
          'PtoVta': ptoVta,
          'CbteTipo': 11,              // Factura C
          'Concepto': 1,               // Productos
          'DocTipo': docTipo,
          'DocNro': docNro,
          'CbteDesde': nextVoucher,
          'CbteHasta': nextVoucher,
          'CbteFch': parseInt(new Date().toISOString().split('T')[0].replace(/-/g, '')),
          'ImpTotal': parseFloat(v.monto),
          'ImpTotConc': 0,
          'ImpNeto': parseFloat(v.monto),
          'ImpOpEx': 0,
          'ImpIVA': 0,
          'ImpTrib': 0,
          'MonId': 'PES',
          'MonCotiz': 1,
        }

        console.log(`Enviando comprobante a AFIP...`)
        const resAFIP = await afip.ElectronicBilling.createVoucher(data)
        console.log(`✅ AFIP OK: CAE=${resAFIP.CAE}, Vto=${resAFIP.CAEFchVto}`)

        // Guardar resultado en Supabase
        const nroComprobante = `${String(ptoVta).padStart(4, '0')}-${String(nextVoucher).padStart(8, '0')}`

        // ─── Generar PDF oficial con AFIP SDK ───
        let pdfUrl = null
        try {
          const pdfRes = await afip.ElectronicBilling.createPDF({
            html: `
              <p><b>Razón Social:</b> ${v.cliente || 'Consumidor Final'}</p>
              <p><b>CUIT:</b> ${v.datos_fiscales?.cuit || 'N/A'}</p>
              <p><b>Forma de Pago:</b> ${v.datos_fiscales?.forma_pago || 'Contado'}</p>
            `,
            file_name: `Factura_${nroComprobante}.pdf`,
            copy: 1,
            voucher_info: {
              PtoVta: ptoVta,
              CbteTipo: 11,
              CbteNro: nextVoucher
            }
          })
          pdfUrl = pdfRes?.file || null
          console.log(`📄 PDF generado: ${pdfUrl}`)
        } catch (pdfErr) {
          console.error(`⚠️ Error generando PDF (no fatal):`, pdfErr.message)
        }

        const { error: upError } = await supabaseAdmin
          .from('ventas')
          .update({
            status: 'facturado',
            cae: resAFIP.CAE,
            nro_comprobante: nroComprobante,
            vto_cae: resAFIP.CAEFchVto,
            pdf_url: pdfUrl
          })
          .eq('id', v.id)

        if (upError) {
          console.error(`⚠️ Factura emitida pero error guardando en DB:`, upError.message)
        }

        resultados.push({
          id: v.id,
          success: true,
          nro: nroComprobante,
          cae: resAFIP.CAE,
          pdf_url: pdfUrl
        })

      } catch (err) {
        console.error(`❌ Error facturando venta ${v.id}:`, err.message)

        // Marcar como error en DB
        const { error: dbErr } = await supabaseAdmin
          .from('ventas')
          .update({
            status: 'error',
            datos_fiscales: {
              ...v.datos_fiscales,
              error_detalle: err.message
            }
          })
          .eq('id', v.id)

        if (dbErr) {
          console.error('Error secundario (DB):', dbErr.message)
        }

        resultados.push({ id: v.id, success: false, error: err.message })
      }
    }

    const okCount = resultados.filter(r => r.success).length
    console.log(`=== Resultado: ${okCount}/${resultados.length} facturas emitidas ===`)
    return res.status(200).json({ success: true, resultados })

  } catch (err) {
    console.error('❌ Error General AFIP API:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
