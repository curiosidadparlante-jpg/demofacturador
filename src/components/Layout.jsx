import { LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Layout({ children, headerActions }) {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-base py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* ─── Top Header ─── */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Command Logo" className="h-8 w-auto object-contain" />
            <span className="text-xs font-black text-text-primary uppercase tracking-widest ml-1 border-l-2 border-border pl-3" style={{fontFamily: 'Montserrat'}}>
              Facturador Automático
            </span>
          </div>
          
          <div className="flex items-center gap-4 bg-white px-5 py-2.5 rounded-full border border-border shadow-sm">
            {headerActions}
            <span className="hidden sm:block text-xs font-semibold text-text-secondary truncate max-w-[200px]" style={{fontFamily: 'Space Grotesk'}}>
               {user?.email || 'admin@comand.app'}
            </span>
            <div className="w-[1px] h-4 bg-border hidden sm:block"></div>
            <button
              onClick={signOut}
              className="text-text-muted hover:text-card-red transition-colors cursor-pointer flex items-center gap-2"
              title="Cerrar sesión"
            >
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest" style={{fontFamily: 'Space Grotesk'}}>Salir</span>
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* ─── Main Content ─── */}
        <main>
          {children}
        </main>
      </div>
    </div>
  )
}
