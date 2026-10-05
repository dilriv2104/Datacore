import { useState } from 'react';
import Modal from '../../components/Modal';
import type { Cliente } from '../../types';
import ClientesTabla from './Tabla';

type Props = {
  clientes: Cliente[];
  onSave: (datos: any, id?: number) => Promise<void>;
  onToggle: (id: number) => Promise<void>;
};

const FORMULARIO_VACIO = {
  nombre: '',
  correo: '',
  telefono: '',
  direccion: '',
  estado: true,
  id_localidad: null,
};

export default function ClientesInterfaz({ clientes, onSave, onToggle }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [form, setForm] = useState<any>({ ...FORMULARIO_VACIO });

  function abrir(cliente?: Cliente) {
    setEditando(cliente || null);
    setForm(cliente ? { ...cliente } : { ...FORMULARIO_VACIO });
    setAbierto(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    await onSave(
      {
        ...form,
        id_localidad: form.id_localidad ? Number(form.id_localidad) : null,
      },
      editando?.id_cliente
    );
    setAbierto(false);
  }

  return (
    <div>
      <div className="page-title">
        <div>
          <span className="eyebrow">PERSONAS</span>
          <h2>Clientes</h2>
          <p className="muted small">
            Registra las personas o negocios a los que se realizan ventas.
          </p>
        </div>
        <button className="btn primary" onClick={() => abrir()}>
          + Nuevo cliente
        </button>
      </div>

      <ClientesTabla
        clientes={clientes}
        onEdit={abrir}
        onToggle={onToggle}
      />

      {abierto && (
        <Modal
          title={editando ? 'Editar cliente' : 'Nuevo cliente'}
          onClose={() => setAbierto(false)}
        >
          <form className="form-grid" onSubmit={guardar}>
            <label>
              Nombre
              <input
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
            </label>

            <label>
              Correo
              <input
                type="email"
                value={form.correo}
                onChange={(e) => setForm({ ...form, correo: e.target.value })}
              />
            </label>

            <label>
              Teléfono
              <input
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              />
            </label>

            <label>
              Dirección
              <input
                value={form.direccion}
                onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              />
            </label>

            <div className="modal-actions span2">
              <button
                type="button"
                className="btn cancel"
                onClick={() => setAbierto(false)}
              >
                Cancelar
              </button>
              <button className="btn primary">Guardar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
