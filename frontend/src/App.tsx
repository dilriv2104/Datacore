import { useEffect, useState } from 'react';

import Modal from './components/Modal';
import Sidebar, { type Seccion } from './components/Sidebar';
import Toast from './components/Toast';
import { api, getToken } from './services/api';
import type {
  Categoria,
  Cliente,
  Dashboard,
  OrdenCompra,
  Producto,
  Proveedor,
  Usuario,
  Venta,
} from './types';

import Categorias from './views/Categorias';
import Clientes from './views/Clientes';
import Proveedores from './views/Proveedores';
import Compras from './views/Compras';
import Inicio from './views/Inicio';
import Inventario from './views/Inventario';
import Login from './views/Auth/Login';
import Registro from './views/Auth/Registro';
import Reportes from './views/Reportes';
import Usuarios from './views/Usuarios';
import Ventas from './views/Ventas';

// Nombre del almacenamiento local donde se guarda el JWT del usuario.
const TOKEN_KEY = 'datacore_token';

export default function App() {
  // Estado principal de autenticación.
  const [token, setToken] = useState(getToken());
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [vistaAuth, setVistaAuth] = useState<'login' | 'registro'>('login');

  // Sección actual de la aplicación y datos globales del dashboard.
  const [seccion, setSeccion] = useState<Seccion>('inicio');

  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [compras, setCompras] = useState<OrdenCompra[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);

  const [error, setError] = useState('');
  const [confirmandoLogout, setConfirmandoLogout] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Carga los datos necesarios para la sesión activa.
  // Si el usuario es administrador, además trae información extra del sistema.
  async function cargarDatos() {
    if (!token) return;

    try {
      const [usuarioActual, listaProductos, listaCategorias, listaVentas, listaClientes] =
        await Promise.all([
          api<Usuario>('/auth/me', {}, token),
          api<Producto[]>('/productos', {}, token),
          api<Categoria[]>('/categorias', {}, token),
          api<Venta[]>('/ventas', {}, token).catch(() => [] as Venta[]),
          api<Cliente[]>('/clientes', {}, token).catch(() => [] as Cliente[]),
        ]);

      setUsuario(usuarioActual);
      setProductos(listaProductos);
      setCategorias(listaCategorias);
      setVentas(listaVentas);
      setClientes(listaClientes);

      if (usuarioActual.rol !== 'administrador') {
        setUsuarios([]);
        setProveedores([]);
        setCompras([]);
        setDashboard(null);
        return;
      }

      const [listaUsuarios, listaProveedores, listaCompras, resumenDashboard] =
        await Promise.all([
          api<Usuario[]>('/usuarios', {}, token),
          api<Proveedor[]>('/proveedores', {}, token),
          api<OrdenCompra[]>('/ordenes-compra', {}, token),
          api<Dashboard>('/reportes/dashboard', {}, token),
        ]);

      setUsuarios(listaUsuarios);
      setProveedores(listaProveedores);
      setCompras(listaCompras);
      setDashboard(resumenDashboard);
    } catch (err: any) {
      setError(err.message);
      localStorage.removeItem(TOKEN_KEY);
      setToken('');
    }
  }

  useEffect(() => {
    cargarDatos();
  }, [token]);

  function iniciarSesion(nuevoToken: string, usuarioLogueado: Usuario) {
    localStorage.setItem(TOKEN_KEY, nuevoToken);
    setToken(nuevoToken);
    setUsuario(usuarioLogueado);
    setVistaAuth('login');
  }

  function cerrarSesion() {
    localStorage.removeItem(TOKEN_KEY);
    setToken('');
    setUsuario(null);
    setConfirmandoLogout(false);
    setSeccion('inicio');
  }

  // Ejecuta una operación protegida y recarga la información del sistema.
  async function ejecutar(peticion: () => Promise<unknown>) {
    setGuardando(true);

    try {
      await peticion();
      await cargarDatos();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  // Centraliza la construcción de peticiones HTTP para evitar repetir fetch.
  const crearAccion = (
    ruta: string,
    metodo: 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    datos?: unknown,
    opciones?: { id?: number | string; sufijo?: string }
  ) => {
    const url =
      opciones?.id !== undefined
        ? `${ruta}/${opciones.id}${opciones?.sufijo ?? ''}`
        : `${ruta}${opciones?.sufijo ?? ''}`;

    return () =>
      api(url, {
        method: metodo,
        ...(datos !== undefined ? { body: JSON.stringify(datos) } : {}),
      }, token);
  };

  // Mapea la sección actual con el componente correspondiente.
  const renderSeccion = () => {
    if (seccion === 'inicio') {
      return (
        <Inicio
          user={usuario!}
          productos={productos}
          ventas={ventas}
          categorias={categorias}
          onGo={setSeccion}
        />
      );
    }

    if (seccion === 'inventario') {
      return (
        <Inventario
          productos={productos}
          categorias={categorias}
          onSave={(datos, id) =>
            ejecutar(crearAccion('/productos', id ? 'PUT' : 'POST', datos, { id }))
          }
          onDelete={(id) => ejecutar(crearAccion('/productos', 'DELETE', undefined, { id }))}
        />
      );
    }

    if (seccion === 'clientes') {
      return (
        <Clientes
          clientes={clientes}
          onSave={(datos, id) =>
            ejecutar(crearAccion('/clientes', id ? 'PUT' : 'POST', datos, { id }))
          }
          onToggle={(id) => ejecutar(crearAccion('/clientes', 'PATCH', undefined, { id, sufijo: '/estado' }))}
        />
      );
    }

    if (seccion === 'proveedores' && usuario?.rol === 'administrador') {
      return (
        <Proveedores
          proveedores={proveedores}
          onSave={(datos, id) =>
            ejecutar(crearAccion('/proveedores', id ? 'PUT' : 'POST', datos, { id }))
          }
          onToggle={(id) => ejecutar(crearAccion('/proveedores', 'PATCH', undefined, { id, sufijo: '/estado' }))}
        />
      );
    }

    if (seccion === 'categorias') {
      return (
        <Categorias
          categorias={categorias}
          onSave={(datos, id) =>
            ejecutar(crearAccion('/categorias', id ? 'PUT' : 'POST', datos, { id }))
          }
          onDelete={(id) => ejecutar(crearAccion('/categorias', 'DELETE', undefined, { id }))}
        />
      );
    }

    if (seccion === 'ventas') {
      return (
        <Ventas
          productos={productos}
          clientes={clientes}
          ventas={ventas}
          onCreate={(datos) => ejecutar(crearAccion('/ventas', 'POST', datos))}
        />
      );
    }

    if (seccion === 'compras' && usuario?.rol === 'administrador') {
      return (
        <Compras
          productos={productos}
          proveedores={proveedores}
          compras={compras}
          onCreate={(datos) => ejecutar(crearAccion('/ordenes-compra', 'POST', datos))}
        />
      );
    }

    if (seccion === 'usuarios' && usuario?.rol === 'administrador') {
      return (
        <Usuarios
          usuarios={usuarios}
          onCreate={(datos) => ejecutar(crearAccion('/usuarios', 'POST', datos))}
          onToggle={(id) => ejecutar(crearAccion('/usuarios', 'PATCH', undefined, { id, sufijo: '/estado' }))}
        />
      );
    }

    if (seccion === 'reportes' && usuario?.rol === 'administrador') {
      return <Reportes dashboard={dashboard} />;
    }

    return null;
  };

  if (!token || !usuario) {
    return vistaAuth === 'login' ? (
      <Login onLogin={iniciarSesion} onRegister={() => setVistaAuth('registro')} />
    ) : (
      <Registro onLogin={iniciarSesion} onBack={() => setVistaAuth('login')} />
    );
  }

  const tituloSeccion =
    seccion === 'inicio'
      ? 'Inicio'
      : seccion === 'reportes'
        ? 'Dashboard'
        : seccion.charAt(0).toUpperCase() + seccion.slice(1);

  return (
    <div className="app">
      <Sidebar
        rol={usuario.rol}
        nombre={usuario.nombre}
        seccion={seccion}
        onChange={setSeccion}
        onLogout={() => setConfirmandoLogout(true)}
      />

      <main className="main">
        <header>
          <div>
            <span className="eyebrow">DATACORE · SISTEMA DE GESTIÓN</span>
            <h1>{tituloSeccion}</h1>
          </div>

          <div className="user-mini">
            <div className="avatar">{usuario.nombre[0]?.toUpperCase()}</div>
            <div>
              <b>{usuario.nombre}</b>
              <small>{usuario.rol}</small>
            </div>
          </div>
        </header>

        {guardando && <div className="loading">Guardando...</div>}
        {error && <Toast msg={error} onClose={() => setError('')} />}

        {renderSeccion()}
      </main>

      {confirmandoLogout && (
        <Modal title="Cerrar sesión" onClose={() => setConfirmandoLogout(false)}>
          <p>¿Seguro que quieres cerrar sesión?</p>
          <div className="modal-actions">
            <button
              className="btn cancel"
              onClick={() => setConfirmandoLogout(false)}
            >
              Cancelar
            </button>
            <button className="btn primary" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
