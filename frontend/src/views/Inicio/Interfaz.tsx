import type { Categoria, Producto, Usuario, Venta } from '../../types';
import type { Seccion } from '../../components/Sidebar';

type Props = {
  user: Usuario;
  productos: Producto[];
  ventas: Venta[];
  categorias: Categoria[];
  onGo: (seccion: Seccion) => void;
};

const UMBRAL_STOCK_BAJO = 3;

export default function Inicio({ user, productos, ventas, categorias, onGo }: Props) {
  const stockTotal = productos.reduce((total, p) => total + p.stock, 0);
  const productosStockBajo = productos.filter(
    (p) => p.estado && p.stock <= UMBRAL_STOCK_BAJO
  ).length;

  return (
    <div>
      <div className="welcome">
        <div>
          <span className="eyebrow">PANEL PRINCIPAL</span>
          <h2>Hola, {user.nombre.split(' ')[0]} 👋</h2>
          <p>Bienvenido a DataCore. Aquí puedes revisar rápidamente cómo va el inventario.</p>
        </div>
        <span className="role-pill">{user.rol}</span>
      </div>

      <div className="cards">
        <div className="stat">
          <span>Productos</span>
          <strong>{productos.length}</strong>
          <small>En catálogo</small>
        </div>

        <div className="stat">
          <span>Stock total</span>
          <strong>{stockTotal}</strong>
          <small>Unidades disponibles</small>
        </div>

        <div className="stat">
          <span>Ventas</span>
          <strong>{ventas.length}</strong>
          <small>Registradas</small>
        </div>

        <div className="stat alert-card">
          <span>Stock bajo</span>
          <strong>{productosStockBajo}</strong>
          <small>Revisar inventario</small>
        </div>
      </div>

      <div className="quick">
        <h3>Accesos rápidos</h3>
        <div className="quick-grid">
          <button onClick={() => onGo('inventario')}>
            📦
            <b>Ver inventario</b>
            <small>Consultar productos y stock</small>
          </button>

          <button onClick={() => onGo('ventas')}>
            🛒
            <b>Registrar venta</b>
            <small>Vender y actualizar stock</small>
          </button>

          <button onClick={() => onGo('categorias')}>
            🏷️
            <b>Categorías</b>
            <small>{categorias.length} categorías</small>
          </button>

          {user.rol === 'administrador' && (
            <button onClick={() => onGo('compras')}>
              🚚
              <b>Compras</b>
              <small>Registrar entrada de mercancía</small>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
