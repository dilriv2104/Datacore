import type { Dashboard } from '../../types';
import ReportesTabla from './Tabla';

type Props = {
  dashboard: Dashboard | null;
};

export default function ReportesInterfaz({ dashboard }: Props) {
  if (!dashboard) {
    return (
      <section>
        <div className="page-title">
          <div>
            <span className="eyebrow">CONSULTA</span>
            <h2>Reportes</h2>
          </div>
        </div>
        <p className="muted">Cargando información del dashboard...</p>
      </section>
    );
  }

  const formatoMoneda = (valor: number) =>
    `$${Number(valor).toLocaleString('es-CO', {
      maximumFractionDigits: 0,
    })}`;

  return (
    <section>
      <div className="page-title">
        <div>
          <span className="eyebrow">DASHBOARD · DATOS REALES</span>
          <h2>Dashboard</h2>
          <p className="muted small">
            Resumen calculado por el backend a partir de PostgreSQL.
          </p>
        </div>
      </div>

      <div className="cards">
        <div className="stat">
          <span>Valor del inventario</span>
          <strong>{formatoMoneda(dashboard.valor_inventario)}</strong>
          <small>{dashboard.productos_activos} productos activos</small>
        </div>

        <div className="stat">
          <span>Ventas registradas</span>
          <strong>{dashboard.total_ventas}</strong>
          <small>{formatoMoneda(dashboard.valor_vendido)} vendidos</small>
        </div>

        <div className="stat">
          <span>Compras registradas</span>
          <strong>{dashboard.total_compras}</strong>
          <small>{formatoMoneda(dashboard.valor_comprado)} comprados</small>
        </div>

        <div className="stat alert-card">
          <span>Stock bajo</span>
          <strong>{dashboard.productos_stock_bajo.length}</strong>
          <small>Productos para revisar</small>
        </div>
      </div>

      <ReportesTabla dashboard={dashboard} formatoMoneda={formatoMoneda} />
    </section>
  );
}
