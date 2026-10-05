import type { Proveedor } from '../../types';

type Props = {
  proveedores: Proveedor[];
  onEdit: (proveedor: Proveedor) => void;
  onToggle: (id: number) => Promise<void>;
};

export default function ProveedoresTabla({
  proveedores,
  onEdit,
  onToggle,
}: Props) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {proveedores.map((proveedor) => (
            <tr key={proveedor.id_proveedor}>
              <td>
                <b>{proveedor.nombre}</b>
                <small>{proveedor.direccion || 'Sin dirección'}</small>
              </td>
              <td>{proveedor.correo || '—'}</td>
              <td>{proveedor.telefono || '—'}</td>
              <td>
                {proveedor.estado ? (
                  <span className="ok">Activo</span>
                ) : (
                  <span className="off">Inactivo</span>
                )}
              </td>
              <td>
                <button className="link" onClick={() => onEdit(proveedor)}>
                  Editar
                </button>
                <button
                  className="link danger"
                  onClick={() => onToggle(proveedor.id_proveedor)}
                >
                  {proveedor.estado ? 'Inactivar' : 'Activar'}
                </button>
              </td>
            </tr>
          ))}

          {proveedores.length === 0 && (
            <tr>
              <td colSpan={5} className="muted">
                No hay proveedores registrados.
              </td>
            </tr>
          )}
        </tbody>
    </table>
  </div>
  );
}
