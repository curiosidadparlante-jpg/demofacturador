import Afip from '@afipsdk/afip.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { ventas } = req.body
    if (!ventas || !Array.isArray(ventas) || ventas.length === 0) {
      return res.status(400).json({ error: 'Lista de ventas vacía o inválida' })
    }

    // Leemos las credenciales desde el panel de Variables de Vercel
    const cuit = process.env.AFIP_CUIT
    const certBase64 = process.env.AFIP_CERT_BASE64
    const keyBase64 = process.env.AFIP_KEY_BASE64
    const isProduction = process.env.AFIP_PRODUCTION === 'true'
    const isSandbox = process.env.AFIP_SANDBOX === 'true'

    // ─── MODO SANDBOX O SIN CREDENCIALES ───
    if (isSandbox || !cuit || !certBase64 || !keyBase64) {
      console.log(isSandbox ? 'MODO SANDBOX ACTIVADO: Generando factura de prueba...' : 'Credenciales no encontradas: Generando factura de prueba...');
      await new Promise(r => setTimeout(r, 1500)); // Delay simulado
      
      const resultadosMock = ventas.map(v => {
        if (v.cliente?.includes('(Test Error)')) {
          return { 
            id: v.id, 
            status: 'error', 
            error_detalle: 'AFIP Mock: El CUIT ingresado no existe o no tiene impuestos activos.' 
          };
        }
        return {
          id: v.id,
          status: 'facturado',
          cae: `7${Math.floor(Math.random() * 10000000000000).toString().padStart(13, '0')}`,
          cae_vto: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          comprobante_numero: `C-0001-${(Math.floor(Math.random() * 9000) + 1000).toString().padStart(8, '0')}`
        };
      });

      return res.status(200).json({ simulado: true, resultados: resultadosMock })
    }

    // ─── INTEGRACIÓN REAL DE AFIP ───
    const cert = Buffer.from(certBase64, 'base64').toString('ascii')
    const key = Buffer.from(keyBase64, 'base64').toString('ascii')

    const afip = new Afip({
      CUIT: parseInt(cuit),
      cert: cert,
      key: key,
      production: process.env.AFIP_PRODUCTION === 'true' // Para usar el server de homologación o producción
    });

    const resultados = [];

    // Por las reglas de factura electrónica, las mandamos 1 a 1 a autorizar
    for (const venta of ventas) {
      try {
        const ptoVta = parseInt(process.env.AFIP_PTO_VTA || '1');
        const tipoComprobante = 11; // 11 = Factura C (por defecto para monotributistas). Cambiar si son Inscriptos (1 o 6).
        
        // Obtener último comprobante para ese punto de venta
        const lastVoucher = await afip.ElectronicBilling.getLastVoucher(ptoVta, tipoComprobante);
        const nextVoucher = lastVoucher + 1;

        const date = new Date(venta.fecha || Date.now());
        const dateFmt = date.toISOString().split('T')[0].replace(/-/g, '');
        
        // Formatear Datos Fiscales
        const docTipo = venta.datos_fiscales?.cuit ? 80 : 99; // 80: CUIT, 99: Consumidor Final (DNI genérico)
        let docNro = 0;
        if (docTipo === 80) {
            docNro = parseInt(venta.datos_fiscales.cuit.replace(/-/g, ''));
        }

        const afipPayload = {
          'CantReg'    : 1, 
          'PtoVta'     : ptoVta,
          'CbteTipo'   : tipoComprobante,
          'Concepto'   : 2, // 1: Productos, 2: Servicios, 3: Ambos
          'DocTipo'    : docTipo,
          'DocNro'     : docNro,
          'CbteDesde'  : nextVoucher,
          'CbteHasta'  : nextVoucher,
          'CbteFch'    : parseInt(dateFmt),
          'ImpTotal'   : venta.monto,
          'ImpTotConc' : 0, // Monto no gravado
          'ImpNeto'    : venta.monto,
          'ImpOpEx'    : 0,
          'ImpIVA'     : 0, // En Factura C el IVA es 0
          'ImpTrib'    : 0,
          'MonId'      : 'PES',
          'MonCotiz'   : 1
        };

        const resAfip = await afip.ElectronicBilling.createVoucher(afipPayload);
        
        resultados.push({
          id: venta.id,
          status: 'facturado',
          cae: resAfip.CAE,
          cae_vto: new Date(resAfip.CAEFchVto.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3")).toISOString(),
          comprobante_numero: `C-${ptoVta.toString().padStart(4, '0')}-${nextVoucher.toString().padStart(8, '0')}`
        });

      } catch (afipErr) {
        console.error(`Error AFIP (Venta ${venta.id}):`, afipErr);
        resultados.push({
          id: venta.id,
          status: 'error',
          error_detalle: afipErr.message || 'Error del servidor de AFIP'
        });
      }
    }

    return res.status(200).json({ simulado: false, resultados })

  } catch (error) {
    console.error('[API AFIP] Error en el puente:', error);
    return res.status(500).json({ error: error.message })
  }
}
