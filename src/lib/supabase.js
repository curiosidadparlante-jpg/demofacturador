import { createClient } from '@supabase/supabase-js'

// Fallback a las variables directas en caso de que Vercel compile sin el archivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://seiurmfdeuoxdwlddons.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_NLdOKBI3jlmY0h1nWxllYQ_ypekbRXD'

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Comand] Supabase no configurado. Agregá VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY a tu .env'
  )
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)
