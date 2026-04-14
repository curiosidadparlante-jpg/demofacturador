import { useState } from 'react';
import Modal from './Modal';
import { Save, Loader2 } from 'lucide-react';

export default function EditSaleModal({ isOpen, onClose, venta, onSave }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cliente: venta?.cliente || '',
    cuit: venta?.datos_fiscales?.cuit || '',
    monto: venta?.monto || 0
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(venta.id, {
        cliente: formData.cliente,
        monto: parseFloat(formData.monto),
        datos_fiscales: {
          ...venta.datos_fiscales,
          cuit: formData.cuit
        }
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error al guardar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!venta) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Datos de Venta">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2" style={{ fontFamily: 'Space Grotesk' }}>
            Nombre del Cliente / Razón Social
          </label>
          <input
            type="text"
            required
            className="w-full bg-base border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-blue transition-colors"
            value={formData.cliente}
            onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2" style={{ fontFamily: 'Space Grotesk' }}>
              CUIT / DNI
            </label>
            <input
              type="text"
              placeholder="Ej: 20-12345678-9"
              className="w-full bg-base border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-blue transition-colors"
              value={formData.cuit}
              onChange={(e) => setFormData({ ...formData, cuit: e.target.value })}
            />
            <p className="text-[10px] text-text-muted mt-1">Si está vacío, AFIP lo tomará como Consumidor Final.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2" style={{ fontFamily: 'Space Grotesk' }}>
              Monto (ARS)
            </label>
            <input
              type="number"
              required
              step="0.01"
              className="w-full bg-base border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-blue transition-colors"
              value={formData.monto}
              onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-lg font-black uppercase tracking-widest hover:-translate-y-1 transition-all shadow-xl disabled:opacity-50 disabled:transform-none cursor-pointer"
            style={{ fontFamily: 'Montserrat' }}
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
            {loading ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
