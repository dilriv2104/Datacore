import type { Categoria, Producto } from '../../types';

type Props = {
  productos: Producto[];
  categorias: Categoria[];
  onEdit: (producto: Producto) => void;
  onDelete: (id: number) => Promise<void>;
};

const UMBRAL_STOCK_BAJO = 3;

export default function InventarioTabla({
  productos,
  categorias,
  onEdit,
  onDelete,
}: Props) {
  async function eliminar(producto: Producto) {
    const confirmado = window.confirm(
      `¿Seguro que deseas eliminar el producto "${producto.nombre}"?`
    );

    if (confirmado) {
      await onDelete(producto.id_producto);
    }
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Stock</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {productos.map((producto) => {
            const categoria = categorias.find(
              (c) => c.id_categoria === producto.id_categoria
            );

            return (
              <tr key={producto.id_producto}>
                <td>
                  <b>{producto.nombre}</b>
                  <small>{producto.descripcion}</small>
                </td>

                <td>{categoria?.nombre_categoria || '—'}</td>

                <td>
                  <span
                    className={
                      producto.stock <= UMBRAL_STOCK_BAJO
                        ? 'stock low'
                        : 'stock'
                    }
                  >
                    {producto.stock} {producto.unidad_medida}
                  </span>
                </td>

                <td>
                  ${Number(producto.precio_unitario).toLocaleString('es-CO')}
                </td>

                <td>
                  {producto.estado ? (
                    <span className="ok">Activo</span>
                  ) : (
                    <span className="off">Inactivo</span>
                  )}
                </td>

                <td>
                  <button
                    className="link"
                    onClick={() => onEdit(producto)}
                  >
                    Editar
                  </button>

                  <button
                    className="link danger"
                    onClick={() => eliminar(producto)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
