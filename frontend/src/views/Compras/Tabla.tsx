import type { OrdenCompra } from '../../types';

type Props = {
  compras: OrdenCompra[];
};

export default function ComprasTabla({ compras }: Props) {
  return (
    <div className="history">
      <div className="section-heading">
        <div>
          <h3>Últimas órdenes</h3>
          <p className="muted small">Compras registradas en el sistema.</p>
        </div>
        <span className="table-count">{compras.length} registros</span>
      </div>

      {compras.length === 0 ? (
        <p className="muted">No hay órdenes registradas.</p>
      ) : (
        <div className="table-wrap table-wrap-inner">
          <table>
            <thead>
              <tr>
                <th>Orden</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Productos</th>
              </tr>
            </thead>
            <tbody>
              {compras.slice(0, 8).map((compra) => (
                <tr key={compra.id_orden_compra}>
                  <td><b>Orden #{compra.id_orden_compra}</b></td>
                  <td>{new Date(compra.fecha).toLocaleString('es-CO')}</td>
                  <td><span className="ok">{compra.estado}</span></td>
                  <td>{compra.detalles.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
