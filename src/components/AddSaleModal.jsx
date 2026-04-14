import { useState } from 'react';
import Modal from './Modal';
import { Plus, Loader2 } from 'lucide-react';

const FORMAS_PAGO = [
  'Contado - Efectivo',
  'Transferencia Bancaria',
  'Tarjeta de Débito',
  'Tarjeta de Crédito',
  'Mercado Pago',
  'Otro',
];

export default function AddSaleModal({ isOpen, onClose, onSave }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cliente: '',
    cuit: '',
    monto: '',
    formaPago: 'Contado - Efectivo',
  });

  const resetForm = () => {
    setFormData({ cliente: '', cuit: '', monto: '', formaPago: 'Contado - Efectivo' });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        fecha: new Date().toISOString(),
        cliente: formData.cliente.trim(),
        monto: parseFloat(formData.monto),
        status: 'pendiente',
        datos_fiscales: {
          cuit: formData.cuit.trim() || null,
          forma_pago: formData.formaPago,
        },
      });
      resetForm();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error al crear venta: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Agregar Venta Manual">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2" style={{ fontFamily: 'Space Grotesk' }}>
            Nombre del Cliente / Razón Social
          </label>
          <input
            type="text"
            required
            placeholder="Ej: Juan Pérez"
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
            <p className="text-[10px] text-text-muted mt-1">Opcional. Si está vacío, AFIP lo tomará como Consumidor Final.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2" style={{ fontFamily: 'Space Grotesk' }}>
              Monto (ARS)
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="1"
              placeholder="0.00"
              className="w-full bg-base border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-blue transition-colors"
              value={formData.monto}
              onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
            />
          </div>
        </div>

        {/* Forma de Pago */}
        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2" style={{ fontFamily: 'Space Grotesk' }}>
            Forma de Pago
          </label>
          <select
            value={formData.formaPago}
            onChange={(e) => setFormData({ ...formData, formaPago: e.target.value })}
            className="w-full bg-base border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-blue transition-colors cursor-pointer"
          >
            {FORMAS_PAGO.map(fp => (
              <option key={fp} value={fp}>{fp}</option>
            ))}
          </select>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-lg font-black uppercase tracking-widest hover:-translate-y-1 transition-all shadow-xl disabled:opacity-50 disabled:transform-none cursor-pointer"
            style={{ fontFamily: 'Montserrat' }}
          >
            {loading ? <Loader2 className="animate-spin" /> : <Plus size={18} />}
            {loading ? 'CREANDO...' : 'AGREGAR VENTA'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
