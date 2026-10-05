import { useState } from 'react';

import { api } from '../../services/api';
import type { Usuario } from '../../types';

type Props = {
  onLogin: (token: string, usuario: Usuario) => void;
  onRegister: () => void;
};

type RespuestaLogin = {
  token: string;
  usuario: Usuario;
};

export default function Login({ onLogin, onRegister }: Props) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setError('');
    setCargando(true);

    try {
      const respuesta = await api<RespuestaLogin>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ correo, contrasena }),
      });
      onLogin(respuesta.token, respuesta.usuario);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">DATACORE</div>
        <p className="muted">Gestión sencilla de tu inventario y tus ventas.</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={enviar}>
          <label>
            Correo
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              required
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="••••••"
              required
            />
          </label>

          <button className="btn primary full" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="muted small">
          ¿No tienes cuenta?{' '}
          <button className="link" onClick={onRegister}>
            Crear una cuenta
          </button>
        </p>
      </div>
    </div>
  );
}
