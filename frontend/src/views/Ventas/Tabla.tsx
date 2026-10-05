import type { Venta } from '../../types';

type Props = {
  ventas: Venta[];
};

export default function VentasTabla({ ventas }: Props) {
  return (
    <div className="history">
      <div className="section-heading">
        <div>
          <h3>Últimas ventas</h3>
          <p className="muted small">Movimientos registrados en el sistema.</p>
        </div>
        <span className="table-count">{ventas.length} registros</span>
      </div>

      {ventas.length === 0 ? (
        <p className="muted">No hay ventas registradas.</p>
      ) : (
        <div className="table-wrap table-wrap-inner">
          <table>
            <thead>
              <tr>
                <th>Venta</th>
                <th>Fecha</th>
                <th>Unidades</th>
                <th>Valor registrado</th>
              </tr>
            </thead>
            <tbody>
              {ventas.slice(0, 8).map((venta) => {
                const unidades = venta.detalles.reduce(
                  (total, detalle) => total + detalle.cantidad,
                  0
                );
                const valor = venta.detalles.reduce(
                  (total, detalle) =>
                    total +
                    Number(detalle.precio_unitario) * detalle.cantidad,
                  0
                );

                return (
                  <tr key={venta.id_venta}>
                    <td><b>Venta #{venta.id_venta}</b></td>
                    <td>{new Date(venta.fecha).toLocaleString('es-CO')}</td>
                    <td>{unidades}</td>
                    <td>
                      <b>${valor.toLocaleString('es-CO')}</b>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
