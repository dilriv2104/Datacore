// Cliente HTTP centralizado para comunicarse con el backend.
// Todas las vistas usan esta función en vez de hacer fetch directo,
// para mantener el manejo de autenticación, errores y formato JSON
// consistente en todo el proyecto.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function api<T>(
  ruta: string,
  opciones: RequestInit = {},
  token?: string
): Promise<T> {
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opciones.headers || {}),
    },
  });

  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw new Error(datos.detail || 'Ocurrió un error');
  }

  return datos;
}

export function getToken(): string {
  return localStorage.getItem('datacore_token') || '';
}
