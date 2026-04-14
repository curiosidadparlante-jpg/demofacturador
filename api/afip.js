import { createClient } from '@supabase/supabase-js'
import Afip from '@afipsdk/afip.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { ventas } = req.body
    if (!ventas || !Array.isArray(ventas) || ventas.length === 0) {
      return res.status(400).json({ error: 'Lista de ventas vacía' })
    }

    // Inicializamos Supabase con la llave maestra (para evitar el 401)
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Faltan credenciales de Supabase en el servidor.')
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

    // Credenciales de AFIP
    const cuit = process.env.AFIP_CUIT
    const certBase64 = process.env.AFIP_CERT_BASE64
    const keyBase64 = process.env.AFIP_KEY_BASE64
    const isSandbox = process.env.AFIP_SANDBOX === 'true'
    const isProduction = process.env.AFIP_PRODUCTION === 'true'

    // ─── MODO SANDBOX ───
    if (isSandbox || !cuit || !certBase64 || !keyBase64) {
      console.log('--- MODO SANDBOX ACTIVO ---')
      const resultadosMock = []

      for (const v of ventas) {
        const nComp = `C-0003-${Math.floor(Math.random() * 90000000 + 10000000)}`
        const cae = Math.floor(Math.random() * 100000000000000).toString()
        const fVto = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

        // Actualizamos la DB desde el servidor (esto no falla con 401)
        const { error: upError } = await supabaseAdmin
          .from('ventas')
          .update({ 
            status: 'facturado', 
            cae: cae, 
            nro_comprobante: nComp,
            vto_cae: fVto 
          })
          .eq('id', v.id)

        if (upError) throw upError
        resultadosMock.push({ id: v.id, success: true, nro: nComp, cae })
      }

      return res.status(200).json({ success: true, resultados: resultadosMock })
    }

    // ─── MODO REAL ───
    const cert = Buffer.from(certBase64, 'base64').toString('ascii')
    const key = Buffer.from(keyBase64, 'base64').toString('ascii')

    const afip = new Afip({
      CUIT: parseInt(cuit),
      cert: cert,
      key: key,
      production: isProduction
    })

    const resultadosReales = []

    for (const v of ventas) {
      try {
        const ptoVta = parseInt(process.env.AFIP_PTO_VTA || '1')
        const lastVoucher = await afip.ElectronicBilling.getLastVoucher(ptoVta, 11)
        const nextVoucher = lastVoucher + 1

        const data = {
          'CantReg': 1,
          'PtoVta': ptoVta,
          'CbteTipo': 11,
          'Concepto': 1,
          'DocTipo': v.datos_fiscales?.cuit ? 80 : 99,
          'DocNro': v.datos_fiscales?.cuit ? parseInt(v.datos_fiscales.cuit.replace(/-/g, '')) : 0,
          'CbteDesde': nextVoucher,
          'CbteHasta': nextVoucher,
          'CbteFch': parseInt(new Date().toISOString().split('T')[0].replace(/-/g, '')),
          'ImpTotal': v.monto,
          'ImpTotConc': 0,
          'ImpNeto': v.monto,
          'ImpOpEx': 0,
          'ImpIVA': 0,
          'ImpTrib': 0,
          'MonId': 'PES',
          'MonCotiz': 1,
        }

        const resAFIP = await afip.ElectronicBilling.createVoucher(data)
        
        // Actualizamos la DB
        const { error: upError } = await supabaseAdmin
          .from('ventas')
          .update({ 
            status: 'facturado', 
            cae: resAFIP.CAE, 
            nro_comprobante: nextVoucher.toString(),
            vto_cae: resAFIP.CAEFchVto
          })
          .eq('id', v.id)

        if (upError) throw upError
        resultadosReales.push({ id: v.id, success: true, nro: nextVoucher.toString(), cae: resAFIP.CAE })

      } catch (err) {
        console.error('Error factura individual:', err)
        resultadosReales.push({ id: v.id, success: false, error: err.message })
      }
    }

    return res.status(200).json({ success: true, resultados: resultadosReales })

  } catch (err) {
    console.error('Error General AFIP API:', err)
    return res.status(500).json({ error: err.message })
  }
}
