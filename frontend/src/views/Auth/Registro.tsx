import { useState } from 'react';

import { api } from '../../services/api';
import type { Usuario } from '../../types';

type Props = {
  onLogin: (token: string, usuario: Usuario) => void;
  onBack: () => void;
};

type FormularioRegistro = {
  nombre: string;
  correo: string;
  contrasena: string;
  telefono: string;
  direccion: string;
};

type RespuestaLogin = {
  token: string;
  usuario: Usuario;
};

const FORMULARIO_VACIO: FormularioRegistro = {
  nombre: '',
  correo: '',
  contrasena: '',
  telefono: '',
  direccion: '',
};

export default function Registro({ onLogin, onBack }: Props) {
  const [form, setForm] = useState<FormularioRegistro>(FORMULARIO_VACIO);
  const [error, setError] = useState('');

  function actualizarCampo(campo: keyof FormularioRegistro, valor: string) {
    setForm({ ...form, [campo]: valor });
  }

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setError('');

    try {
      const respuesta = await api<RespuestaLogin>('/auth/registro', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      onLogin(respuesta.token, respuesta.usuario);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card wide">
        <button className="back" onClick={onBack}>
          ← Volver al login
        </button>

        <div className="auth-logo">DATACORE</div>
        <h1>Crear cuenta de vendedor</h1>

        {error && <div className="error">{error}</div>}

        <form className="form-grid" onSubmit={enviar}>
          <label>
            Nombre
            <input
              value={form.nombre}
              onChange={(e) => actualizarCampo('nombre', e.target.value)}
              required
            />
          </label>

          <label>
            Correo
            <input
              type="email"
              value={form.correo}
              onChange={(e) => actualizarCampo('correo', e.target.value)}
              required
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              minLength={4}
              value={form.contrasena}
              onChange={(e) => actualizarCampo('contrasena', e.target.value)}
              required
            />
          </label>

          <label>
            Teléfono
            <input
              value={form.telefono}
              onChange={(e) => actualizarCampo('telefono', e.target.value)}
            />
          </label>

          <label>
            Dirección
            <input
              value={form.direccion}
              onChange={(e) => actualizarCampo('direccion', e.target.value)}
            />
          </label>

          <div>
            <p className="muted small">
              Los usuarios internos son administrador y vendedor.
            </p>
          </div>

          <button className="btn primary full span2">
            Crear cuenta
          </button>
        </form>
      </div>
    </div>
  );
}
