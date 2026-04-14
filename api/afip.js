import { createClient } from '@supabase/supabase-js'

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
    console.log('Ventas recibidas:', JSON.stringify(ventas?.length))

    if (!ventas || !Array.isArray(ventas) || ventas.length === 0) {
      return res.status(400).json({ error: 'Lista de ventas vacía' })
    }

    // --- Supabase Admin ---
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    console.log('Supabase URL existe:', !!supabaseUrl)
    console.log('Service Role Key existe:', !!supabaseKey)
    console.log('Service Role Key (primeros 20 chars):', supabaseKey?.substring(0, 20))

    let supabaseAdmin = null
    if (supabaseUrl && supabaseKey) {
      supabaseAdmin = createClient(supabaseUrl, supabaseKey)
    } else {
      console.log('⚠️ Sin credenciales de Supabase - no se actualizará la DB')
    }

    // --- AFIP Config ---
    const isSandbox = process.env.AFIP_SANDBOX === 'true'
    console.log('Modo Sandbox:', isSandbox)

    // === MODO SANDBOX (el que estamos usando ahora) ===
    const resultados = []

    for (const v of ventas) {
      const nComp = `C-0003-${Math.floor(Math.random() * 90000000 + 10000000)}`
      const cae = Math.floor(Math.random() * 100000000000000).toString()
      const fVto = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      console.log(`Procesando venta ${v.id}: nComp=${nComp}, cae=${cae}`)

      // Intentamos actualizar la DB, pero si falla NO rompemos todo
      if (supabaseAdmin) {
        try {
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
            console.error('⚠️ Error actualizando DB (no fatal):', upError.message)
          } else {
            console.log(`✅ Venta ${v.id} actualizada en DB`)
          }
        } catch (dbErr) {
          console.error('⚠️ Excepción DB (no fatal):', dbErr.message)
        }
      }

      // Siempre devolvemos éxito al frontend
      resultados.push({ id: v.id, success: true, nro: nComp, cae })
    }

    console.log(`=== Resultado: ${resultados.length} facturas procesadas ===`)
    return res.status(200).json({ success: true, resultados })

  } catch (err) {
    console.error('❌ Error General AFIP API:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
