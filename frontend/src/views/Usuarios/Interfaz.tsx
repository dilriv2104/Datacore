import { useState } from 'react';
import Modal from '../../components/Modal';
import type { Rol, Usuario } from '../../types';
import UsuariosTabla from './Tabla';

type FormularioUsuario = {
  nombre: string;
  correo: string;
  contrasena: string;
  telefono: string;
  direccion: string;
  rol: Rol;
};

type Props = {
  usuarios: Usuario[];
  onCreate: (datos: FormularioUsuario) => Promise<void>;
  onToggle: (id: number) => Promise<void>;
};

const FORMULARIO_VACIO: FormularioUsuario = {
  nombre: '',
  correo: '',
  contrasena: '',
  telefono: '',
  direccion: '',
  rol: 'vendedor',
};

export default function UsuariosInterfaz({
  usuarios,
  onCreate,
  onToggle,
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const [form, setForm] =
    useState<FormularioUsuario>(FORMULARIO_VACIO);

  async function guardar(evento: React.FormEvent) {
    evento.preventDefault();
    await onCreate(form);
    setAbierto(false);
    setForm(FORMULARIO_VACIO);
  }

  return (
    <div>
      <div className="page-title">
        <div>
          <span className="eyebrow">ADMINISTRACIÓN</span>
          <h2>Usuarios</h2>
          <p className="muted small">
            Solo administrador y vendedor tienen acceso al sistema.
          </p>
        </div>

        <button
          className="btn primary"
          onClick={() => setAbierto(true)}
        >
          + Registrar usuario
        </button>
      </div>

      <UsuariosTabla
        usuarios={usuarios}
        onToggle={onToggle}
      />

      {abierto && (
        <Modal
          title="Registrar usuario"
          onClose={() => setAbierto(false)}
        >
          <form className="form-grid" onSubmit={guardar}>
            <label>
              Nombre
              <input
                value={form.nombre}
                onChange={(e) =>
                  setForm({ ...form, nombre: e.target.value })
                }
                required
              />
            </label>

            <label>
              Correo
              <input
                type="email"
                value={form.correo}
                onChange={(e) =>
                  setForm({ ...form, correo: e.target.value })
                }
                required
              />
            </label>

            <label>
              Contraseña
              <input
                type="password"
                value={form.contrasena}
                onChange={(e) =>
                  setForm({
                    ...form,
                    contrasena: e.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Rol
              <select
                value={form.rol}
                onChange={(e) =>
                  setForm({
                    ...form,
                    rol: e.target.value as Rol,
                  })
                }
              >
                <option value="vendedor">Vendedor</option>
                <option value="administrador">Administrador</option>
              </select>
            </label>

            <label>
              Teléfono
              <input
                value={form.telefono}
                onChange={(e) =>
                  setForm({
                    ...form,
                    telefono: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Dirección
              <input
                value={form.direccion}
                onChange={(e) =>
                  setForm({
                    ...form,
                    direccion: e.target.value,
                  })
                }
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

              <button className="btn primary">
                Guardar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
