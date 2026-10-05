import type { Dashboard } from '../../types';

type Props = {
  dashboard: Dashboard;
  formatoMoneda: (valor: number) => string;
};

export default function ReportesTabla({
  dashboard,
  formatoMoneda,
}: Props) {
  return (
    <div className="reports-grid">
      <section className="panel">
        <div className="section-heading">
          <div>
            <h3>Productos con stock bajo</h3>
            <p className="muted small">Umbral configurado en el backend.</p>
          </div>
        </div>

        {dashboard.productos_stock_bajo.length === 0 ? (
          <p className="muted">No hay productos con stock bajo.</p>
        ) : (
          <div className="table-wrap table-wrap-inner">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Stock</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.productos_stock_bajo.map((producto) => (
                  <tr key={producto.id_producto}>
                    <td><b>{producto.nombre}</b></td>
                    <td>
                      {producto.stock} {producto.unidad_medida}
                    </td>
                    <td><span className="off">Revisar</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h3>Productos más vendidos</h3>
            <p className="muted small">Top de unidades vendidas.</p>
          </div>
        </div>

        {dashboard.top_productos_vendidos.length === 0 ? (
          <p className="muted">Todavía no hay ventas registradas.</p>
        ) : (
          <div className="table-wrap table-wrap-inner">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Unidades</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.top_productos_vendidos.map((producto) => (
                  <tr key={producto.id_producto}>
                    <td><b>{producto.nombre}</b></td>
                    <td>{producto.unidades_vendidas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel report-wide">
        <div className="section-heading">
          <div>
            <h3>Inventario por categoría</h3>
            <p className="muted small">Productos activos y valor acumulado.</p>
          </div>
        </div>

        {dashboard.inventario_por_categoria.length === 0 ? (
          <p className="muted">No hay productos activos en ninguna categoría.</p>
        ) : (
          <div className="table-wrap table-wrap-inner">
            <table>
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Productos</th>
                  <th>Valor inventario</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.inventario_por_categoria.map((categoria) => (
                  <tr key={categoria.id_categoria}>
                    <td><b>{categoria.nombre_categoria}</b></td>
                    <td>{categoria.total_productos}</td>
                    <td>{formatoMoneda(categoria.valor_inventario)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
