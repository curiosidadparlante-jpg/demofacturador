import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ConfigContext = createContext(null)

export function ConfigProvider({ children }) {
  const [emisor, setEmisor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEmisor = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('config_emisor')
        .select('*')
        .maybeSingle()

      if (!error && data) {
        setEmisor(data)
      }
      setLoading(false)
    }

    loadEmisor()
  }, [])

  const saveConfig = async (config) => {
    const { data, error } = await supabase
      .from('config_emisor')
      .upsert({ ...config, id: emisor?.id || undefined })
      .select()
      .single()

    if (error) throw error
    setEmisor(data)
    return true
  }

  const value = {
    emisor,
    loading,
    isRI: emisor?.condicion_iva?.includes('Inscripto'),
    needsSetup: !emisor || !emisor.pto_vta,
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
