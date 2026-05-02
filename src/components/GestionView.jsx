import { useState } from 'react'
import { 
  FileCheck, Clock, AlertCircle, Archive, Trash2, 
  FolderKanban, FolderPlus, Tag, X, Plus, ChevronRight
} from 'lucide-react'
import { LABEL_COLORS } from '../config/colors'

export default function GestionView({ 
  ventas = [],
  customFolders = [],
  labels = [],
  onCreateFolder,
  onDeleteFolder,
  onCreateLabel,
  onDeleteLabel,
  onNavigate,
}) {
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewLabel, setShowNewLabel] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0].id)

  // Counts
  const counts = {
    facturadas: ventas.filter(v => v.status === 'facturado').length,
    pendientes: ventas.filter(v => v.status === 'pendiente' || v.status === 'procesando').length,
    error: ventas.filter(v => v.status === 'error').length,
    archivadas: ventas.filter(v => v.archivada || v.status === 'archivada' || v.status === 'archivado').length,
    papelera: ventas.filter(v => v.status === 'borrada').length,
  }

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder?.(newFolderName.trim())
      setNewFolderName('')
      setShowNewFolder(false)
    }
  }

  const handleCreateLabel = () => {
    if (newLabelName.trim()) {
      onCreateLabel?.({ name: newLabelName.trim(), colorId: newLabelColor })
      setNewLabelName('')
      setNewLabelColor(LABEL_COLORS[0].id)
      setShowNewLabel(false)
    }
  }

  const systemFolders = [
    { icon: <FileCheck size={18} />, label: 'Facturadas', count: counts.facturadas, color: '#2D8F5E', filter: { type: 'status', value: 'facturado' } },
    { icon: <Clock size={18} />, label: 'Pendientes', count: counts.pendientes, color: '#F59E0B', filter: { type: 'status', value: 'pendiente' } },
    { icon: <AlertCircle size={18} />, label: 'Error', count: counts.error, color: '#C0443C', filter: { type: 'status', value: 'error' } },
    { icon: <Archive size={18} />, label: 'Archivo', count: counts.archivadas, color: '#8E8A81', filter: { type: 'status', value: 'archivada' } },
    { icon: <Trash2 size={18} />, label: 'Papelera', count: counts.papelera, color: '#8E8A81', filter: { type: 'status', value: 'borrada' } },
  ]

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-lg md:text-xl font-bold text-text-primary uppercase tracking-tight">
          Gestión
        </h2>
        <p className="text-xs text-text-muted mt-1">
          Organizá tus ventas con carpetas y etiquetas
        </p>
      </div>

      {/* System Folders — Card Grid */}
      <div className="mb-8">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-4 px-1">
          Carpetas del Sistema
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {systemFolders.map((folder) => (
            <button
              key={folder.label}
              onClick={() => onNavigate?.('facturas', folder.filter)}
              className="bg-white border border-border/40 rounded-2xl p-4 flex flex-col items-center gap-3 hover:shadow-md hover:-translate-y-0.5 hover:border-border transition-all cursor-pointer group"
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: folder.color + '15', color: folder.color }}
              >
                {folder.icon}
              </div>
              <div className="text-center">
                <div className="text-[11px] font-bold text-text-primary">{folder.label}</div>
                <div className="text-lg font-black text-text-primary tracking-tight mt-0.5">{folder.count}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Folders */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
            Carpetas Personalizadas
          </h3>
          <button
            onClick={() => setShowNewFolder(true)}
            className="flex items-center gap-1 text-[10px] font-bold text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <FolderPlus size={14} />
            Nueva
          </button>
        </div>

        {showNewFolder && (
          <div className="bg-white border border-border/40 rounded-xl p-3 mb-3 flex items-center gap-2 animate-slide-down">
            <FolderKanban size={16} className="text-text-muted" />
            <input
              autoFocus
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
              placeholder="Nombre de la carpeta..."
              className="flex-1 bg-surface-alt border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent"
            />
            <button onClick={handleCreateFolder} className="px-3 py-1.5 bg-text-primary text-white rounded-lg text-[10px] font-bold uppercase cursor-pointer hover:bg-text-primary/90 transition-colors">Crear</button>
            <button onClick={() => setShowNewFolder(false)} className="p-1.5 text-text-muted hover:text-red cursor-pointer"><X size={14} /></button>
          </div>
        )}

        {customFolders.length === 0 && !showNewFolder ? (
          <div className="bg-white border border-border/40 border-dashed rounded-xl p-6 text-center">
            <FolderKanban size={24} className="text-text-muted mx-auto mb-2" />
            <p className="text-xs text-text-muted">No tenés carpetas personalizadas.</p>
            <button
              onClick={() => setShowNewFolder(true)}
              className="mt-2 text-[10px] font-bold text-accent hover:text-accent/80 cursor-pointer uppercase tracking-widest"
            >
              + Crear primera carpeta
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            {customFolders.map(folder => (
              <div key={folder.id} className="group">
                <button
                  onClick={() => onNavigate?.('facturas', { type: 'folder', value: folder.id })}
                  className="w-full bg-white border border-border/40 rounded-xl px-4 py-3 flex items-center gap-3 hover:shadow-sm hover:border-border transition-all cursor-pointer"
                >
                  <FolderKanban size={16} className="text-text-muted" />
                  <span className="flex-1 text-left text-sm font-semibold text-text-primary">{folder.name}</span>
                  <span className="text-xs text-text-muted tabular-nums">{ventas.filter(v => v.folder === folder.id).length}</span>
                  <ChevronRight size={14} className="text-text-muted" />
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteFolder?.(folder.id) }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-text-muted hover:text-red transition-all cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Labels */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
            Etiquetas
          </h3>
          <button
            onClick={() => setShowNewLabel(true)}
            className="flex items-center gap-1 text-[10px] font-bold text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <Tag size={14} />
            Nueva
          </button>
        </div>

        {showNewLabel && (
          <div className="bg-white border border-border/40 rounded-xl p-4 mb-3 space-y-3 animate-slide-down">
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-text-muted" />
              <input
                autoFocus
                value={newLabelName}
                onChange={e => setNewLabelName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateLabel()}
                placeholder="Nombre de la etiqueta..."
                className="flex-1 bg-surface-alt border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mr-1">Color:</span>
              {LABEL_COLORS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setNewLabelColor(c.id)}
                  className={`w-6 h-6 rounded-full transition-all cursor-pointer ${newLabelColor === c.id ? 'ring-2 ring-offset-2 ring-text-primary scale-110' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c.color }}
                  title={c.name}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreateLabel} className="px-4 py-1.5 bg-text-primary text-white rounded-lg text-[10px] font-bold uppercase cursor-pointer hover:bg-text-primary/90 transition-colors">Crear Etiqueta</button>
              <button onClick={() => setShowNewLabel(false)} className="px-3 py-1.5 text-[10px] font-bold text-text-muted hover:text-red cursor-pointer">Cancelar</button>
            </div>
          </div>
        )}

        {labels.length === 0 && !showNewLabel ? (
          <div className="bg-white border border-border/40 border-dashed rounded-xl p-6 text-center">
            <Tag size={24} className="text-text-muted mx-auto mb-2" />
            <p className="text-xs text-text-muted">No tenés etiquetas creadas.</p>
            <button
              onClick={() => setShowNewLabel(true)}
              className="mt-2 text-[10px] font-bold text-accent hover:text-accent/80 cursor-pointer uppercase tracking-widest"
            >
              + Crear primera etiqueta
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {labels.map(label => {
              const colorObj = LABEL_COLORS.find(c => c.id === label.colorId) || LABEL_COLORS[0]
              const count = ventas.filter(v => v.etiqueta === label.name).length
              return (
                <div key={label.id} className="group relative">
                  <button
                    onClick={() => onNavigate?.('facturas', { type: 'label', value: label.name })}
                    className="w-full bg-white border border-border/40 rounded-xl px-3 py-3 flex items-center gap-2.5 hover:shadow-sm hover:border-border transition-all cursor-pointer"
                  >
                    <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: colorObj.color }} />
                    <span className="flex-1 text-left text-xs font-semibold text-text-primary truncate">{label.name}</span>
                    {count > 0 && <span className="text-[10px] text-text-muted font-bold tabular-nums">{count}</span>}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteLabel?.(label.id) }}
                    className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 w-5 h-5 rounded-full bg-white border border-border flex items-center justify-center text-text-muted hover:text-red hover:border-red/30 transition-all cursor-pointer shadow-sm"
                  >
                    <X size={10} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
