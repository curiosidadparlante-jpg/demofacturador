import { useState, useEffect, useCallback } from 'react'
import { getEtiquetas } from '../utils/labelHelpers'

const DUMMY_VENTAS = [
  {
    "id": "30",
    "fecha": "2026-04-30T02:21:52.096Z",
    "cliente": "Bazar El Turco",
    "monto": 141510,
    "status": "facturado",
    "cae": "73276502529859",
    "nro_comprobante": "0003-00076091",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": null,
    "datos_fiscales": {
      "cuit": "30888888889",
      "condicion_iva": "IVA Responsable Inscripto",
      "forma_pago": "dinero en cuenta",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "41",
    "fecha": "2026-04-29T20:45:46.564Z",
    "cliente": "Juan Perez",
    "monto": 137801,
    "status": "pendiente",
    "cae": null,
    "nro_comprobante": null,
    "vto_cae": null,
    "mp_payment_id": "1227613965",
    "datos_fiscales": {
      "cuit": "20333333334",
      "condicion_iva": "Consumidor Final",
      "forma_pago": "tarjeta",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "33",
    "fecha": "2026-04-29T04:26:06.306Z",
    "cliente": "Tech Solutions SRL",
    "monto": 52054,
    "status": "facturado",
    "cae": "73709774246727",
    "nro_comprobante": "0003-00097226",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": "5257222489",
    "datos_fiscales": {
      "cuit": "30777777778",
      "condicion_iva": "IVA Responsable Inscripto",
      "forma_pago": "tarjeta",
      "origen": "mercadolibre",
      "error_detalle": null
    }
  },
  {
    "id": "1",
    "fecha": "2026-04-28T15:37:05.062Z",
    "cliente": "Tech Solutions SRL",
    "monto": 108089,
    "status": "pendiente",
    "cae": null,
    "nro_comprobante": null,
    "vto_cae": null,
    "mp_payment_id": "5575534714",
    "datos_fiscales": {
      "cuit": "30777777778",
      "condicion_iva": "IVA Responsable Inscripto",
      "forma_pago": "efectivo",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "17",
    "fecha": "2026-04-28T14:51:11.550Z",
    "cliente": "Tech Solutions SRL",
    "monto": 138371,
    "status": "pendiente",
    "cae": null,
    "nro_comprobante": null,
    "vto_cae": null,
    "mp_payment_id": null,
    "datos_fiscales": {
      "cuit": "30777777778",
      "condicion_iva": "IVA Responsable Inscripto",
      "forma_pago": "dinero en cuenta",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "52",
    "fecha": "2026-04-28T13:48:00.821Z",
    "cliente": "Gaston Giraudo",
    "monto": 58085,
    "status": "facturado",
    "cae": "73259403933840",
    "nro_comprobante": "0003-00013127",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": "5393724650",
    "datos_fiscales": {
      "cuit": "20111111112",
      "condicion_iva": "Consumidor Final",
      "forma_pago": "tarjeta",
      "origen": "mercadolibre",
      "error_detalle": null
    }
  },
  {
    "id": "35",
    "fecha": "2026-04-28T08:28:14.669Z",
    "cliente": "Estudio Juridico Lopez",
    "monto": 65014,
    "status": "facturado",
    "cae": "73331692135169",
    "nro_comprobante": "0003-00074617",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": null,
    "datos_fiscales": {
      "cuit": "30222222221",
      "condicion_iva": "IVA Responsable Inscripto",
      "forma_pago": "transferencia",
      "origen": "mercadolibre",
      "error_detalle": null
    }
  },
  {
    "id": "39",
    "fecha": "2026-04-27T23:09:53.658Z",
    "cliente": "Gaston Giraudo",
    "monto": 67987,
    "status": "facturado",
    "cae": "73687534430668",
    "nro_comprobante": "0003-00001140",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": "3216905565",
    "datos_fiscales": {
      "cuit": "20111111112",
      "condicion_iva": "Consumidor Final",
      "forma_pago": "dinero en cuenta",
      "origen": "mercadolibre",
      "error_detalle": null
    }
  },
  {
    "id": "26",
    "fecha": "2026-04-27T16:56:11.902Z",
    "cliente": "Tech Solutions SRL",
    "monto": 132246,
    "status": "pendiente",
    "cae": null,
    "nro_comprobante": null,
    "vto_cae": null,
    "mp_payment_id": null,
    "datos_fiscales": {
      "cuit": "30777777778",
      "condicion_iva": "IVA Responsable Inscripto",
      "forma_pago": "tarjeta",
      "origen": "mercadopago",
      "error_detalle": null
    }
  },
  {
    "id": "20",
    "fecha": "2026-04-26T11:35:27.224Z",
    "cliente": "Tech Solutions SRL",
    "monto": 3447,
    "status": "pendiente",
    "cae": null,
    "nro_comprobante": null,
    "vto_cae": null,
    "mp_payment_id": "1811886797",
    "datos_fiscales": {
      "cuit": "30777777778",
      "condicion_iva": "IVA Responsable Inscripto",
      "forma_pago": "dinero en cuenta",
      "origen": "mercadolibre",
      "error_detalle": null
    }
  },
  {
    "id": "42",
    "fecha": "2026-04-26T09:58:54.009Z",
    "cliente": "Estudio Juridico Lopez",
    "monto": 138743,
    "status": "pendiente",
    "cae": null,
    "nro_comprobante": null,
    "vto_cae": null,
    "mp_payment_id": "1468698173",
    "datos_fiscales": {
      "cuit": "30222222221",
      "condicion_iva": "IVA Responsable Inscripto",
      "forma_pago": "efectivo",
      "origen": "mercadopago",
      "error_detalle": null
    }
  },
  {
    "id": "50",
    "fecha": "2026-04-26T02:46:31.500Z",
    "cliente": "Maria Lopez",
    "monto": 107467,
    "status": "pendiente",
    "cae": null,
    "nro_comprobante": null,
    "vto_cae": null,
    "mp_payment_id": null,
    "datos_fiscales": {
      "cuit": "27222222223",
      "condicion_iva": "Consumidor Final",
      "forma_pago": "dinero en cuenta",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "5",
    "fecha": "2026-04-23T20:14:49.901Z",
    "cliente": "Gaston Giraudo",
    "monto": 50806,
    "status": "facturado",
    "cae": "73540723636646",
    "nro_comprobante": "0003-00023549",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": null,
    "datos_fiscales": {
      "cuit": "20111111112",
      "condicion_iva": "Consumidor Final",
      "forma_pago": "transferencia",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "15",
    "fecha": "2026-04-23T10:05:22.610Z",
    "cliente": "Maria Lopez",
    "monto": 56025,
    "status": "facturado",
    "cae": "73691412472774",
    "nro_comprobante": "0003-00062804",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": null,
    "datos_fiscales": {
      "cuit": "27222222223",
      "condicion_iva": "Consumidor Final",
      "forma_pago": "tarjeta",
      "origen": "mercadolibre",
      "error_detalle": null
    }
  },
  {
    "id": "45",
    "fecha": "2026-04-22T05:34:18.496Z",
    "cliente": "Constructora CMD SA",
    "monto": 118811,
    "status": "pendiente",
    "cae": null,
    "nro_comprobante": null,
    "vto_cae": null,
    "mp_payment_id": null,
    "datos_fiscales": {
      "cuit": "30555555556",
      "condicion_iva": "IVA Responsable Inscripto",
      "forma_pago": "dinero en cuenta",
      "origen": "mercadolibre",
      "error_detalle": null
    }
  },
  {
    "id": "23",
    "fecha": "2026-04-22T03:56:09.660Z",
    "cliente": "Maria Lopez",
    "monto": 52303,
    "status": "facturado",
    "cae": "73814799759327",
    "nro_comprobante": "0003-00064004",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": "7654441908",
    "datos_fiscales": {
      "cuit": "27222222223",
      "condicion_iva": "Consumidor Final",
      "forma_pago": "tarjeta",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "25",
    "fecha": "2026-04-20T13:20:56.410Z",
    "cliente": "Ana Martinez",
    "monto": 59363,
    "status": "pendiente",
    "cae": null,
    "nro_comprobante": null,
    "vto_cae": null,
    "mp_payment_id": "163103320",
    "datos_fiscales": {
      "cuit": "27444444445",
      "condicion_iva": "Consumidor Final",
      "forma_pago": "dinero en cuenta",
      "origen": "mercadopago",
      "error_detalle": null
    }
  },
  {
    "id": "48",
    "fecha": "2026-04-20T06:24:54.381Z",
    "cliente": "Bazar El Turco",
    "monto": 97719,
    "status": "facturado",
    "cae": "73383370953139",
    "nro_comprobante": "0003-00023895",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": null,
    "datos_fiscales": {
      "cuit": "30888888889",
      "condicion_iva": "IVA Responsable Inscripto",
      "forma_pago": "tarjeta",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "58",
    "fecha": "2026-04-20T00:02:48.074Z",
    "cliente": "Bazar El Turco",
    "monto": 81241,
    "status": "facturado",
    "cae": "73277357852414",
    "nro_comprobante": "0003-00057788",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": null,
    "datos_fiscales": {
      "cuit": "30888888889",
      "condicion_iva": "IVA Responsable Inscripto",
      "forma_pago": "dinero en cuenta",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "8",
    "fecha": "2026-04-19T14:03:08.132Z",
    "cliente": "Gaston Giraudo",
    "monto": 12627,
    "status": "pendiente",
    "cae": null,
    "nro_comprobante": null,
    "vto_cae": null,
    "mp_payment_id": null,
    "datos_fiscales": {
      "cuit": "20111111112",
      "condicion_iva": "Consumidor Final",
      "forma_pago": "tarjeta",
      "origen": "mercadopago",
      "error_detalle": null
    }
  },
  {
    "id": "59",
    "fecha": "2026-04-18T21:15:22.174Z",
    "cliente": "Juan Perez",
    "monto": 58053,
    "status": "facturado",
    "cae": "73284021438248",
    "nro_comprobante": "0003-00006900",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": null,
    "datos_fiscales": {
      "cuit": "20333333334",
      "condicion_iva": "Consumidor Final",
      "forma_pago": "efectivo",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "9",
    "fecha": "2026-04-18T02:13:07.256Z",
    "cliente": "Estudio Juridico Lopez",
    "monto": 67818,
    "status": "pendiente",
    "cae": null,
    "nro_comprobante": null,
    "vto_cae": null,
    "mp_payment_id": null,
    "datos_fiscales": {
      "cuit": "30222222221",
      "condicion_iva": "IVA Responsable Inscripto",
      "forma_pago": "tarjeta",
      "origen": "mercadolibre",
      "error_detalle": null
    }
  },
  {
    "id": "40",
    "fecha": "2026-04-17T21:34:41.534Z",
    "cliente": "Bazar El Turco",
    "monto": 124040,
    "status": "facturado",
    "cae": "73581092385059",
    "nro_comprobante": "0003-00048707",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": "6078543939",
    "datos_fiscales": {
      "cuit": "30888888889",
      "condicion_iva": "IVA Responsable Inscripto",
      "forma_pago": "efectivo",
      "origen": "mercadolibre",
      "error_detalle": null
    }
  },
  {
    "id": "4",
    "fecha": "2026-04-17T16:07:12.625Z",
    "cliente": "Tech Solutions SRL",
    "monto": 22942,
    "status": "pendiente",
    "cae": null,
    "nro_comprobante": null,
    "vto_cae": null,
    "mp_payment_id": null,
    "datos_fiscales": {
      "cuit": "30777777778",
      "condicion_iva": "IVA Responsable Inscripto",
      "forma_pago": "tarjeta",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "28",
    "fecha": "2026-04-16T18:59:44.388Z",
    "cliente": "Maria Lopez",
    "monto": 85298,
    "status": "facturado",
    "cae": "73364642467337",
    "nro_comprobante": "0003-00071105",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": null,
    "datos_fiscales": {
      "cuit": "27222222223",
      "condicion_iva": "Consumidor Final",
      "forma_pago": "efectivo",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "29",
    "fecha": "2026-04-16T16:36:09.371Z",
    "cliente": "Ana Martinez",
    "monto": 135282,
    "status": "facturado",
    "cae": "73818762862128",
    "nro_comprobante": "0003-00017021",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": null,
    "datos_fiscales": {
      "cuit": "27444444445",
      "condicion_iva": "Consumidor Final",
      "forma_pago": "transferencia",
      "origen": "mercadopago",
      "error_detalle": null
    }
  },
  {
    "id": "10",
    "fecha": "2026-04-15T11:35:22.051Z",
    "cliente": "Tech Solutions SRL",
    "monto": 128704,
    "status": "pendiente",
    "cae": null,
    "nro_comprobante": null,
    "vto_cae": null,
    "mp_payment_id": null,
    "datos_fiscales": {
      "cuit": "30777777778",
      "condicion_iva": "IVA Responsable Inscripto",
      "forma_pago": "dinero en cuenta",
      "origen": "mercadopago",
      "error_detalle": null
    }
  },
  {
    "id": "12",
    "fecha": "2026-04-14T19:07:26.327Z",
    "cliente": "Estudio Juridico Lopez",
    "monto": 42203,
    "status": "facturado",
    "cae": "73495600975228",
    "nro_comprobante": "0003-00015493",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": null,
    "datos_fiscales": {
      "cuit": "30222222221",
      "condicion_iva": "IVA Responsable Inscripto",
      "forma_pago": "efectivo",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "2",
    "fecha": "2026-04-13T21:27:00.795Z",
    "cliente": "Bazar El Turco",
    "monto": 97586,
    "status": "facturado",
    "cae": "73357285590206",
    "nro_comprobante": "0003-00062394",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": "2529813622",
    "datos_fiscales": {
      "cuit": "30888888889",
      "condicion_iva": "IVA Responsable Inscripto",
      "forma_pago": "dinero en cuenta",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "7",
    "fecha": "2026-04-11T13:30:50.422Z",
    "cliente": "Constructora CMD SA",
    "monto": 125722,
    "status": "facturado",
    "cae": "73605588586660",
    "nro_comprobante": "0003-00057707",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": "1113839338",
    "datos_fiscales": {
      "cuit": "30555555556",
      "condicion_iva": "IVA Responsable Inscripto",
      "forma_pago": "transferencia",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "3",
    "fecha": "2026-04-11T05:34:46.507Z",
    "cliente": "Tech Solutions SRL",
    "monto": 26175,
    "status": "pendiente",
    "cae": null,
    "nro_comprobante": null,
    "vto_cae": null,
    "mp_payment_id": null,
    "datos_fiscales": {
      "cuit": "30777777778",
      "condicion_iva": "IVA Responsable Inscripto",
      "forma_pago": "dinero en cuenta",
      "origen": "mercadolibre",
      "error_detalle": null
    }
  },
  {
    "id": "22",
    "fecha": "2026-04-09T06:05:57.739Z",
    "cliente": "Estudio Juridico Lopez",
    "monto": 84364,
    "status": "pendiente",
    "cae": null,
    "nro_comprobante": null,
    "vto_cae": null,
    "mp_payment_id": "3873893256",
    "datos_fiscales": {
      "cuit": "30222222221",
      "condicion_iva": "IVA Responsable Inscripto",
      "forma_pago": "efectivo",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "60",
    "fecha": "2026-04-08T14:23:47.597Z",
    "cliente": "Gaston Giraudo",
    "monto": 109465,
    "status": "facturado",
    "cae": "73702423241706",
    "nro_comprobante": "0003-00012918",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": null,
    "datos_fiscales": {
      "cuit": "20111111112",
      "condicion_iva": "Consumidor Final",
      "forma_pago": "tarjeta",
      "origen": "mercadolibre",
      "error_detalle": null
    }
  },
  {
    "id": "18",
    "fecha": "2026-04-08T06:34:29.763Z",
    "cliente": "Juan Perez",
    "monto": 111730,
    "status": "facturado",
    "cae": "73198381086391",
    "nro_comprobante": "0003-00046456",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": "2345565245",
    "datos_fiscales": {
      "cuit": "20333333334",
      "condicion_iva": "Consumidor Final",
      "forma_pago": "tarjeta",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "49",
    "fecha": "2026-04-08T03:20:23.919Z",
    "cliente": "Maria Lopez",
    "monto": 115049,
    "status": "facturado",
    "cae": "73579724428585",
    "nro_comprobante": "0003-00091888",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": "4816037586",
    "datos_fiscales": {
      "cuit": "27222222223",
      "condicion_iva": "Consumidor Final",
      "forma_pago": "transferencia",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "38",
    "fecha": "2026-04-06T14:45:23.678Z",
    "cliente": "Ana Martinez",
    "monto": 96335,
    "status": "facturado",
    "cae": "73850985683007",
    "nro_comprobante": "0003-00044153",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": "3703640271",
    "datos_fiscales": {
      "cuit": "27444444445",
      "condicion_iva": "Consumidor Final",
      "forma_pago": "efectivo",
      "origen": "mercadolibre",
      "error_detalle": null
    }
  },
  {
    "id": "51",
    "fecha": "2026-04-05T10:01:32.757Z",
    "cliente": "Juan Perez",
    "monto": 148670,
    "status": "facturado",
    "cae": "73293819999341",
    "nro_comprobante": "0003-00092799",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": "3359944121",
    "datos_fiscales": {
      "cuit": "20333333334",
      "condicion_iva": "Consumidor Final",
      "forma_pago": "tarjeta",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "44",
    "fecha": "2026-04-04T08:39:54.112Z",
    "cliente": "Gaston Giraudo",
    "monto": 13470,
    "status": "pendiente",
    "cae": null,
    "nro_comprobante": null,
    "vto_cae": null,
    "mp_payment_id": "1314916033",
    "datos_fiscales": {
      "cuit": "20111111112",
      "condicion_iva": "Consumidor Final",
      "forma_pago": "tarjeta",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "13",
    "fecha": "2026-04-01T01:48:09.184Z",
    "cliente": "Bazar El Turco",
    "monto": 142427,
    "status": "facturado",
    "cae": "73459703772141",
    "nro_comprobante": "0003-00018686",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": "1865268644",
    "datos_fiscales": {
      "cuit": "30888888889",
      "condicion_iva": "IVA Responsable Inscripto",
      "forma_pago": "transferencia",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "31",
    "fecha": "2026-03-31T16:45:14.004Z",
    "cliente": "Gaston Giraudo",
    "monto": 5498,
    "status": "pendiente",
    "cae": null,
    "nro_comprobante": null,
    "vto_cae": null,
    "mp_payment_id": "5253218708",
    "datos_fiscales": {
      "cuit": "20111111112",
      "condicion_iva": "Consumidor Final",
      "forma_pago": "efectivo",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "56",
    "fecha": "2026-03-31T12:50:39.435Z",
    "cliente": "Tech Solutions SRL",
    "monto": 45039,
    "status": "facturado",
    "cae": "73190683008990",
    "nro_comprobante": "0003-00015481",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": "1873302399",
    "datos_fiscales": {
      "cuit": "30777777778",
      "condicion_iva": "IVA Responsable Inscripto",
      "forma_pago": "transferencia",
      "origen": "mercadolibre",
      "error_detalle": null
    }
  },
  {
    "id": "19",
    "fecha": "2026-03-30T14:46:27.839Z",
    "cliente": "Ana Martinez",
    "monto": 101937,
    "status": "pendiente",
    "cae": null,
    "nro_comprobante": null,
    "vto_cae": null,
    "mp_payment_id": "6697904938",
    "datos_fiscales": {
      "cuit": "27444444445",
      "condicion_iva": "Consumidor Final",
      "forma_pago": "efectivo",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "32",
    "fecha": "2026-03-29T01:27:03.070Z",
    "cliente": "Gaston Giraudo",
    "monto": 81617,
    "status": "facturado",
    "cae": "73906884612647",
    "nro_comprobante": "0003-00037064",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": null,
    "datos_fiscales": {
      "cuit": "20111111112",
      "condicion_iva": "Consumidor Final",
      "forma_pago": "transferencia",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "11",
    "fecha": "2026-03-28T14:18:30.992Z",
    "cliente": "Tech Solutions SRL",
    "monto": 28371,
    "status": "facturado",
    "cae": "73189923733040",
    "nro_comprobante": "0003-00081476",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": null,
    "datos_fiscales": {
      "cuit": "30777777778",
      "condicion_iva": "IVA Responsable Inscripto",
      "forma_pago": "dinero en cuenta",
      "origen": "mercadolibre",
      "error_detalle": null
    }
  },
  {
    "id": "16",
    "fecha": "2026-03-27T21:07:12.110Z",
    "cliente": "Constructora CMD SA",
    "monto": 150966,
    "status": "facturado",
    "cae": "73175036743166",
    "nro_comprobante": "0003-00017355",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": "383915704",
    "datos_fiscales": {
      "cuit": "30555555556",
      "condicion_iva": "IVA Responsable Inscripto",
      "forma_pago": "transferencia",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "57",
    "fecha": "2026-03-26T12:26:01.091Z",
    "cliente": "Juan Perez",
    "monto": 76744,
    "status": "facturado",
    "cae": "73426809900208",
    "nro_comprobante": "0003-00085260",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": "8338878809",
    "datos_fiscales": {
      "cuit": "20333333334",
      "condicion_iva": "Consumidor Final",
      "forma_pago": "transferencia",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "43",
    "fecha": "2026-03-25T09:40:44.783Z",
    "cliente": "Bazar El Turco",
    "monto": 49809,
    "status": "pendiente",
    "cae": null,
    "nro_comprobante": null,
    "vto_cae": null,
    "mp_payment_id": null,
    "datos_fiscales": {
      "cuit": "30888888889",
      "condicion_iva": "IVA Responsable Inscripto",
      "forma_pago": "dinero en cuenta",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "46",
    "fecha": "2026-03-25T09:14:52.338Z",
    "cliente": "Juan Perez",
    "monto": 105243,
    "status": "facturado",
    "cae": "73719763106592",
    "nro_comprobante": "0003-00064721",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": "5823294872",
    "datos_fiscales": {
      "cuit": "20333333334",
      "condicion_iva": "Consumidor Final",
      "forma_pago": "efectivo",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "36",
    "fecha": "2026-03-24T16:49:12.953Z",
    "cliente": "Gaston Giraudo",
    "monto": 148673,
    "status": "pendiente",
    "cae": null,
    "nro_comprobante": null,
    "vto_cae": null,
    "mp_payment_id": null,
    "datos_fiscales": {
      "cuit": "20111111112",
      "condicion_iva": "Consumidor Final",
      "forma_pago": "efectivo",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "47",
    "fecha": "2026-03-24T14:10:12.939Z",
    "cliente": "Bazar El Turco",
    "monto": 143449,
    "status": "facturado",
    "cae": "73277905463607",
    "nro_comprobante": "0003-00052046",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": "923010297",
    "datos_fiscales": {
      "cuit": "30888888889",
      "condicion_iva": "IVA Responsable Inscripto",
      "forma_pago": "efectivo",
      "origen": "mercadopago",
      "error_detalle": null
    }
  },
  {
    "id": "6",
    "fecha": "2026-03-23T16:13:52.479Z",
    "cliente": "Maria Lopez",
    "monto": 135008,
    "status": "facturado",
    "cae": "73822040453578",
    "nro_comprobante": "0003-00062378",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": "370040255",
    "datos_fiscales": {
      "cuit": "27222222223",
      "condicion_iva": "Consumidor Final",
      "forma_pago": "transferencia",
      "origen": "mercadopago",
      "error_detalle": null
    }
  },
  {
    "id": "55",
    "fecha": "2026-03-23T08:00:03.577Z",
    "cliente": "Maria Lopez",
    "monto": 139236,
    "status": "facturado",
    "cae": "73935221529362",
    "nro_comprobante": "0003-00043831",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": null,
    "datos_fiscales": {
      "cuit": "27222222223",
      "condicion_iva": "Consumidor Final",
      "forma_pago": "transferencia",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "24",
    "fecha": "2026-03-23T07:18:49.401Z",
    "cliente": "Bazar El Turco",
    "monto": 70562,
    "status": "facturado",
    "cae": "73582718886229",
    "nro_comprobante": "0003-00080637",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": "6727802443",
    "datos_fiscales": {
      "cuit": "30888888889",
      "condicion_iva": "IVA Responsable Inscripto",
      "forma_pago": "efectivo",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "37",
    "fecha": "2026-03-23T06:45:32.066Z",
    "cliente": "Ana Martinez",
    "monto": 92518,
    "status": "facturado",
    "cae": "73551914128680",
    "nro_comprobante": "0003-00030246",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": "168090609",
    "datos_fiscales": {
      "cuit": "27444444445",
      "condicion_iva": "Consumidor Final",
      "forma_pago": "dinero en cuenta",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "14",
    "fecha": "2026-03-23T01:29:05.847Z",
    "cliente": "Constructora CMD SA",
    "monto": 87454,
    "status": "pendiente",
    "cae": null,
    "nro_comprobante": null,
    "vto_cae": null,
    "mp_payment_id": null,
    "datos_fiscales": {
      "cuit": "30555555556",
      "condicion_iva": "IVA Responsable Inscripto",
      "forma_pago": "efectivo",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "21",
    "fecha": "2026-03-21T21:45:50.210Z",
    "cliente": "Ana Martinez",
    "monto": 79356,
    "status": "pendiente",
    "cae": null,
    "nro_comprobante": null,
    "vto_cae": null,
    "mp_payment_id": "6424841873",
    "datos_fiscales": {
      "cuit": "27444444445",
      "condicion_iva": "Consumidor Final",
      "forma_pago": "dinero en cuenta",
      "origen": "mercadopago",
      "error_detalle": null
    }
  },
  {
    "id": "53",
    "fecha": "2026-03-21T13:57:00.252Z",
    "cliente": "Gaston Giraudo",
    "monto": 127016,
    "status": "error",
    "cae": null,
    "nro_comprobante": null,
    "vto_cae": null,
    "mp_payment_id": null,
    "datos_fiscales": {
      "cuit": "20111111112",
      "condicion_iva": "Consumidor Final",
      "forma_pago": "dinero en cuenta",
      "origen": "manual",
      "error_detalle": "Error simulado de AFIP."
    }
  },
  {
    "id": "54",
    "fecha": "2026-03-21T10:41:19.759Z",
    "cliente": "Bazar El Turco",
    "monto": 86614,
    "status": "error",
    "cae": null,
    "nro_comprobante": null,
    "vto_cae": null,
    "mp_payment_id": null,
    "datos_fiscales": {
      "cuit": "30888888889",
      "condicion_iva": "IVA Responsable Inscripto",
      "forma_pago": "efectivo",
      "origen": "mercadolibre",
      "error_detalle": "Error simulado de AFIP."
    }
  },
  {
    "id": "27",
    "fecha": "2026-03-20T13:35:34.615Z",
    "cliente": "Estudio Juridico Lopez",
    "monto": 82673,
    "status": "facturado",
    "cae": "73816609183875",
    "nro_comprobante": "0003-00080999",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": "4830410520",
    "datos_fiscales": {
      "cuit": "30222222221",
      "condicion_iva": "IVA Responsable Inscripto",
      "forma_pago": "tarjeta",
      "origen": "manual",
      "error_detalle": null
    }
  },
  {
    "id": "34",
    "fecha": "2026-03-18T10:03:48.932Z",
    "cliente": "Tech Solutions SRL",
    "monto": 99497,
    "status": "facturado",
    "cae": "73480308507572",
    "nro_comprobante": "0003-00090868",
    "vto_cae": "2026-05-12T05:15:00.954Z",
    "mp_payment_id": null,
    "datos_fiscales": {
      "cuit": "30777777778",
      "condicion_iva": "IVA Responsable Inscripto",
      "forma_pago": "tarjeta",
      "origen": "mercadolibre",
      "error_detalle": null
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
    saveToLocal(prev => prev.map(v => {
      if (String(v.id) !== String(id)) return v
      const current = getEtiquetas(v)
      let next
      if (etiqueta === '' || etiqueta === null) {
        next = [] // clear all
      } else if (current.includes(etiqueta)) {
        next = current.filter(e => e !== etiqueta) // toggle off
      } else {
        next = [...current, etiqueta] // toggle on
      }
      return { ...v, etiquetas: next, etiqueta: next[0] || '' }
    }));
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
