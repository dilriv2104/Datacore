import type { Usuario } from '../../types';

type Props = {
  usuarios: Usuario[];
  onToggle: (id: number) => Promise<void> | void;
};

export default function UsuariosTabla({
  usuarios,
  onToggle,
}: Props) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>

        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id_usuario}>
              <td>
                <b>{usuario.nombre}</b>
              </td>

              <td>{usuario.correo}</td>

              <td>
                <span className="role-pill">{usuario.rol}</span>
              </td>

              <td>
                {usuario.estado ? (
                  <span className="ok">Activo</span>
                ) : (
                  <span className="off">Inactivo</span>
                )}
              </td>

              <td>
                <button
                  className="link danger"
                  onClick={() =>
                    onToggle(usuario.id_usuario)
                  }
                >
                  {usuario.estado ? 'Inactivar' : 'Activar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
