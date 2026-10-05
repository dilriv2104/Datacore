import { useEffect, useMemo, useState } from 'react';

import type { Cliente, Producto, Venta } from '../../types';
import VentasTabla from './Tabla';

type Props = {
  productos: Producto[];
  clientes: Cliente[];
  ventas: Venta[];
  onCreate: (data: VentaFormulario) => Promise<void>;
};

type ItemVenta = {
  id_producto: number;
  cantidad: number;
};

type VentaFormulario = {
  id_cliente: number;
  descuento_porcentaje: number;
  detalles: ItemVenta[];
};

export default function VentasInterfaz({
  productos,
  clientes,
  ventas,
  onCreate,
}: Props) {
  const productosDisponibles = productos.filter(
    (producto) => producto.estado && producto.stock > 0
  );
  const clientesActivos = clientes.filter((cliente) => cliente.estado);

  const [cliente, setCliente] = useState(0);
  const [producto, setProducto] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0);
  const [items, setItems] = useState<ItemVenta[]>([]);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (!cliente && clientesActivos.length > 0) {
      setCliente(clientesActivos[0].id_cliente);
    }
  }, [cliente, clientesActivos]);

  useEffect(() => {
    if (
      (!producto ||
        !productosDisponibles.some((item) => item.id_producto === producto)) &&
      productosDisponibles.length > 0
    ) {
      setProducto(productosDisponibles[0].id_producto);
    }
  }, [producto, productosDisponibles]);

  function agregarProducto() {
    const seleccionado = productosDisponibles.find(
      (item) => item.id_producto === producto
    );

    if (!seleccionado || cantidad < 1 || cantidad > seleccionado.stock) {
      setMensaje('Revisa la cantidad disponible del producto.');
      return;
    }

    const existente = items.find(
      (item) => item.id_producto === seleccionado.id_producto
    );

    if (existente) {
      const nuevaCantidad = existente.cantidad + cantidad;

      if (nuevaCantidad > seleccionado.stock) {
        setMensaje('La cantidad supera el stock disponible.');
        return;
      }

      setItems(
        items.map((item) =>
          item.id_producto === seleccionado.id_producto
            ? { ...item, cantidad: nuevaCantidad }
            : item
        )
      );
    } else {
      setItems([
        ...items,
        { id_producto: seleccionado.id_producto, cantidad },
      ]);
    }

    setCantidad(1);
    setMensaje('');
  }

  function quitarProducto(idProducto: number) {
    setItems(items.filter((item) => item.id_producto !== idProducto));
  }

  const subtotal = useMemo(
    () =>
      items.reduce((total, item) => {
        const productoActual = productos.find(
          (producto) => producto.id_producto === item.id_producto
        );

        return (
          total +
          (productoActual
            ? Number(productoActual.precio_unitario) * item.cantidad
            : 0)
        );
      }, 0),
    [items, productos]
  );

  const descuento = subtotal * (descuentoPorcentaje / 100);
  const subtotalConDescuento = subtotal - descuento;
  const iva = subtotalConDescuento * 0.19;
  const total = subtotalConDescuento + iva;

  async function registrarVenta() {
    if (!cliente) {
      setMensaje('Selecciona un cliente.');
      return;
    }

    if (!items.length) {
      setMensaje('Agrega al menos un producto a la venta.');
      return;
    }

    try {
      await onCreate({
        id_cliente: cliente,
        descuento_porcentaje: descuentoPorcentaje,
        detalles: items,
      });

      setItems([]);
      setDescuentoPorcentaje(0);
      setMensaje('Venta registrada correctamente.');
    } catch {
      setMensaje('No fue posible registrar la venta. Revisa el stock.');
    }
  }

  return (
    <section>
      <div className="page-title">
        <div>
          <span className="eyebrow">MOVIMIENTO DE SALIDA</span>
          <h2>Ventas</h2>
          <p className="muted small">
            Registra salidas de mercancía y actualiza el stock.
          </p>
        </div>
      </div>

      <div className="sale-layout">
        <div className="panel">
          <h3>Nueva venta</h3>

          <label>
            Cliente
            <select
              value={cliente}
              onChange={(e) => setCliente(Number(e.target.value))}
            >
              <option value={0}>Seleccione...</option>
              {clientesActivos.map((item) => (
                <option key={item.id_cliente} value={item.id_cliente}>
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
                disabled={!productosDisponibles.length}
              >
                {productosDisponibles.map((item) => (
                  <option key={item.id_producto} value={item.id_producto}>
                    {item.nombre} · stock {item.stock}
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

            <button
              type="button"
              className="btn secondary"
              onClick={agregarProducto}
              disabled={!productosDisponibles.length}
            >
              Agregar
            </button>
          </div>

          <div className="sale-items">
            {items.map((item) => {
              const productoActual = productos.find(
                (producto) => producto.id_producto === item.id_producto
              );

              if (!productoActual) return null;

              return (
                <div className="sale-item" key={item.id_producto}>
                  <span>{productoActual.nombre}</span>
                  <span>
                    {item.cantidad} × $
                    {Number(productoActual.precio_unitario).toLocaleString(
                      'es-CO'
                    )}
                  </span>
                  <button
                    type="button"
                    className="link danger"
                    onClick={() => quitarProducto(item.id_producto)}
                  >
                    Quitar
                  </button>
                </div>
              );
            })}

            {!items.length && (
              <p className="muted">Todavía no hay productos en la venta.</p>
            )}
          </div>
        </div>

        <div className="panel summary">
          <h3>Resumen</h3>

          <div>
            <span>Subtotal</span>
            <b>${subtotal.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</b>
          </div>

          <label>
            Descuento (%)
            <select
              value={descuentoPorcentaje}
              onChange={(e) =>
                setDescuentoPorcentaje(Number(e.target.value))
              }
            >
              <option value={0}>0%</option>
              <option value={5}>5%</option>
              <option value={10}>10%</option>
              <option value={15}>15%</option>
            </select>
          </label>

          <div>
            <span>Descuento</span>
            <b>-${descuento.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</b>
          </div>

          <div>
            <span>IVA</span>
            <b>19%</b>
          </div>

          <div>
            <span>IVA calculado</span>
            <b>${iva.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</b>
          </div>

          <hr />

          <div className="total">
            <span>Total de referencia</span>
            <strong>${total.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</strong>
          </div>

          <p className="hint">
            El precio definitivo de la venta lo toma el backend desde la base
            de datos.
          </p>

          {mensaje && <p className="hint">{mensaje}</p>}

          <button
            type="button"
            className="btn primary full"
            onClick={registrarVenta}
            disabled={!clientesActivos.length || !items.length}
          >
            Registrar venta
          </button>
        </div>
      </div>

      <VentasTabla ventas={ventas} />
    </section>
  );
}
