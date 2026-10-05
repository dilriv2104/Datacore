import type { Categoria } from '../../types';

type Props = {
  categorias: Categoria[];
  onEdit: (categoria: Categoria) => void;
  onDelete: (id: number) => Promise<void>;
};

export default function CategoriasTabla({
  categorias,
  onEdit,
  onDelete,
}: Props) {
  async function eliminar(categoria: Categoria) {
    const confirmado = window.confirm(
      `¿Seguro que deseas inactivar la categoría "${categoria.nombre_categoria}"?`
    );

    if (confirmado) {
      await onDelete(categoria.id_categoria);
    }
  }

  if (categorias.length === 0) {
    return (
      <div className="panel empty-state">
        <h3>No hay categorías registradas</h3>
        <p className="muted">Crea la primera categoría para comenzar a organizar el inventario.</p>
      </div>
    );
  }

  return (
    <div className="category-grid">
      {categorias.map((categoria) => (
        <article className="category" key={categoria.id_categoria}>
          <div className="cat-icon">🏷️</div>
          <h3>{categoria.nombre_categoria}</h3>
          <p>{categoria.descripcion || 'Sin descripción'}</p>

          <span className={categoria.estado ? 'ok' : 'off'}>
            {categoria.estado ? 'Activa' : 'Inactiva'}
          </span>

          <div>
            <button className="link" onClick={() => onEdit(categoria)}>
              Editar
            </button>
            <button
              className="link danger"
              onClick={() => eliminar(categoria)}
            >
              Inactivar
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
