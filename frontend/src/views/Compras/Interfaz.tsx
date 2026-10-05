import { useEffect, useState } from 'react';

import type { OrdenCompra, Producto, Proveedor } from '../../types';
import ComprasTabla from './Tabla';

type Props = {
  productos: Producto[];
  proveedores: Proveedor[];
  compras: OrdenCompra[];
  onCreate: (datos: OrdenCompraFormulario) => Promise<void>;
};

type ItemCompra = {
  id_producto: number;
  cantidad: number;
  precio_compra: number;
};

type OrdenCompraFormulario = {
  id_proveedor: number;
  detalles: ItemCompra[];
};

export default function ComprasInterfaz({
  productos,
  proveedores,
  compras,
  onCreate,
}: Props) {
  const productosActivos = productos.filter((producto) => producto.estado);
  const proveedoresActivos = proveedores.filter((proveedor) => proveedor.estado);

  const [proveedor, setProveedor] = useState(0);
  const [producto, setProducto] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [precioCompra, setPrecioCompra] = useState(1000);
  const [items, setItems] = useState<ItemCompra[]>([]);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (
      (!proveedor ||
        !proveedoresActivos.some((item) => item.id_proveedor === proveedor)) &&
      proveedoresActivos.length
    ) {
      setProveedor(proveedoresActivos[0].id_proveedor);
    }
  }, [proveedor, proveedoresActivos]);

  useEffect(() => {
    if (
      (!producto ||
        !productosActivos.some((item) => item.id_producto === producto)) &&
      productosActivos.length
    ) {
      setProducto(productosActivos[0].id_producto);
    }
  }, [producto, productosActivos]);

  function agregarProducto() {
    const seleccionado = productosActivos.find(
      (item) => item.id_producto === producto
    );

    if (!seleccionado || cantidad < 1 || precioCompra <= 0) {
      setMensaje('Selecciona un producto y valores válidos.');
      return;
    }

    setItems([
      ...items,
      {
        id_producto: seleccionado.id_producto,
        cantidad: Number(cantidad),
        precio_compra: Number(precioCompra),
      },
    ]);
    setCantidad(1);
    setMensaje('');
  }

  function quitarProducto(indice: number) {
    setItems(items.filter((_, index) => index !== indice));
  }

  async function registrarCompra() {
    if (!proveedor || !items.length) {
      setMensaje('Selecciona un proveedor y agrega productos.');
      return;
    }

    try {
      await onCreate({
        id_proveedor: proveedor,
        detalles: items,
      });
      setItems([]);
      setMensaje('Compra registrada y el stock aumentó automáticamente.');
    } catch {
      setMensaje('No fue posible registrar la compra.');
    }
  }

  return (
    <section>
      <div className="page-title">
        <div>
          <span className="eyebrow">MOVIMIENTO DE ENTRADA</span>
          <h2>Órdenes de compra</h2>
          <p className="muted small">
            Registra entradas de mercancía asociadas a un proveedor.
          </p>
        </div>
      </div>

      <div className="sale-layout">
        <div className="panel">
          <h3>Nueva compra</h3>

          <label>
            Proveedor
            <select
              value={proveedor}
              onChange={(e) => setProveedor(Number(e.target.value))}
              disabled={!proveedoresActivos.length}
            >
              <option value={0}>Seleccione...</option>
              {proveedoresActivos.map((item) => (
                <option key={item.id_proveedor} value={item.id_proveedor}>
                  {item.nombre}
                </option>
              ))}
            </select>
          </label>

          <div className="add-row">
            <label>
              Producto
              <select
                value={producto}
                onChange={(e) => setProducto(Number(e.target.value))}
                disabled={!productosActivos.length}
              >
                {productosActivos.map((item) => (
                  <option key={item.id_producto} value={item.id_producto}>
                    {item.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Cantidad
              <input
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
              />
            </label>

            <label>
              Precio compra
              <input
                type="number"
                min="1"
                value={precioCompra}
                onChange={(e) => setPrecioCompra(Number(e.target.value))}
              />
            </label>

            <button
              type="button"
              className="btn secondary"
              onClick={agregarProducto}
              disabled={!productosActivos.length}
            >
              Agregar
            </button>
          </div>

          <div className="sale-items">
            {items.map((item, indice) => {
              const productoActual = productos.find(
                (producto) => producto.id_producto === item.id_producto
              );

              return (
                <div className="sale-item" key={`${item.id_producto}-${indice}`}>
                  <span>{productoActual?.nombre ?? `Producto #${item.id_producto}`}</span>
                  <span>
                    {item.cantidad} × ${item.precio_compra.toLocaleString('es-CO')}
                  </span>
                  <button
                    type="button"
                    className="link danger"
                    onClick={() => quitarProducto(indice)}
                  >
                    Quitar
                  </button>
                </div>
              );
            })}

            {!items.length && (
              <p className="muted">Todavía no hay productos en la compra.</p>
            )}
          </div>

          {mensaje && <p className="hint">{mensaje}</p>}

          <button
            type="button"
            className="btn primary"
            onClick={registrarCompra}
            disabled={!proveedoresActivos.length || !items.length}
          >
            Registrar compra
          </button>
        </div>

        <ComprasTabla compras={compras} />
      </div>
    </section>
  );
}
