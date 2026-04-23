import { createContext, useContext, useState, useEffect } from 'react'

const ConfigContext = createContext(null)

export function ConfigProvider({ children }) {
  const [emisor, setEmisor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulamos carga de config emisor
    const loadEmisor = async () => {
      setLoading(true)
      await new Promise(r => setTimeout(r, 300))
      
      const stored = localStorage.getItem('demo_emisor')
      if (stored) {
        setEmisor(JSON.parse(stored))
      } else {
        // Default demo emisor
        const defaultEmisor = {
          id: 'demo-emisor',
          razon_social: 'Empresa Demo SRL',
          cuit: '30111111118',
          condicion_iva: 'IVA Responsable Inscripto',
          inicio_actividades: '2020-01-01',
          pto_vta: 3,
          certificado_crt: 'demo.crt',
          certificado_key: 'demo.key',
          env: 'production'
        }
        setEmisor(defaultEmisor)
        localStorage.setItem('demo_emisor', JSON.stringify(defaultEmisor))
      }
      setLoading(false)
    }

    loadEmisor()
  }, [])

  const saveConfig = async (config) => {
    const updated = { ...emisor, ...config }
    setEmisor(updated)
    localStorage.setItem('demo_emisor', JSON.stringify(updated))
    return true
  }

  const value = {
    emisor,
    loading,
    needsSetup: !emisor || !emisor.pto_vta || !emisor.certificado_crt || !emisor.certificado_key,
    saveConfig
  }

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  const context = useContext(ConfigContext)
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider')
  }
  return context
}
