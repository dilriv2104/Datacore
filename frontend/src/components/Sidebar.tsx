import { FiBox, FiFileText, FiGrid, FiHome, FiLogOut, FiShoppingCart, FiUsers, FiUserPlus, FiTruck } from 'react-icons/fi';

import type { Rol } from '../types';

export type Seccion =
  | 'inicio'
  | 'inventario'
  | 'ventas'
  | 'categorias'
  | 'clientes'
  | 'proveedores'
  | 'compras'
  | 'usuarios'
  | 'reportes';

type Item = {
  seccion: Seccion;
  etiqueta: string;
  Icono: React.ComponentType;
};

const ITEMS_BASE: Item[] = [
  { seccion: 'inicio', etiqueta: 'Inicio', Icono: FiHome },
  { seccion: 'inventario', etiqueta: 'Inventario', Icono: FiBox },
  { seccion: 'ventas', etiqueta: 'Ventas', Icono: FiShoppingCart },
  { seccion: 'categorias', etiqueta: 'Categorías', Icono: FiGrid },
  { seccion: 'clientes', etiqueta: 'Clientes', Icono: FiUserPlus },
];

const ITEMS_ADMIN: Item[] = [
  { seccion: 'compras', etiqueta: 'Compras', Icono: FiFileText },
  { seccion: 'usuarios', etiqueta: 'Usuarios', Icono: FiUsers },
  { seccion: 'proveedores', etiqueta: 'Proveedores', Icono: FiTruck },
  { seccion: 'reportes', etiqueta: 'Dashboard', Icono: FiGrid },
];

type Props = {
  rol: Rol;
  nombre: string;
  seccion: Seccion;
  onChange: (seccion: Seccion) => void;
  onLogout: () => void;
};

export default function Sidebar({ rol, nombre, seccion, onChange, onLogout }: Props) {
  const items = rol === 'administrador' ? [...ITEMS_BASE, ...ITEMS_ADMIN] : ITEMS_BASE;

  return (
    <aside className="sidebar">
      <div className="brand">
        DATACORE
        <span>Gestión logística</span>
      </div>

      <nav>
        {items.map(({ seccion: id, etiqueta, Icono }) => (
          <button
            key={id}
            className={seccion === id ? 'nav active' : 'nav'}
            onClick={() => onChange(id)}
          >
            <Icono />
            {etiqueta}
          </button>
        ))}
      </nav>

      <div className="side-user">
        <div className="avatar">{nombre[0]?.toUpperCase()}</div>
        <div>
          <b>{nombre}</b>
          <small>{rol}</small>
        </div>
      </div>

      <button className="nav logout" onClick={onLogout}>
        <FiLogOut />
        Cerrar sesión
      </button>
    </aside>
  );
}
