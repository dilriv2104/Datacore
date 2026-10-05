import type { Cliente } from '../../types';

type Props = {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onToggle: (id: number) => Promise<void>;
};

export default function ClientesTabla({ clientes, onEdit, onToggle }: Props) {
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
          {clientes.map((cliente) => (
            <tr key={cliente.id_cliente}>
              <td>
                <b>{cliente.nombre}</b>
                <small>{cliente.direccion || 'Sin dirección'}</small>
              </td>
              <td>{cliente.correo || '—'}</td>
              <td>{cliente.telefono || '—'}</td>
              <td>
                {cliente.estado ? (
                  <span className="ok">Activo</span>
                ) : (
                  <span className="off">Inactivo</span>
                )}
              </td>
              <td>
                <button className="link" onClick={() => onEdit(cliente)}>
                  Editar
                </button>
                <button
                  className="link danger"
                  onClick={() => onToggle(cliente.id_cliente)}
                >
                  {cliente.estado ? 'Inactivar' : 'Activar'}
                </button>
              </td>
            </tr>
          ))}

          {clientes.length === 0 && (
            <tr>
              <td colSpan={5} className="muted">
                No hay clientes registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
