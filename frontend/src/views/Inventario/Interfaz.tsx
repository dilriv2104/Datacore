import { useEffect, useState } from 'react';
import Modal from '../../components/Modal';
import type { Categoria, Producto } from '../../types';
import InventarioTabla from './Tabla';

type FormularioProducto = {
  nombre: string;
  descripcion: string;
  stock: number;
  precio_unitario: number;
  unidad_medida: string;
  fecha_entrada: string;
  fecha_caducidad: string;
  estado: boolean;
  id_categoria: number;
};

type Props = {
  productos: Producto[];
  categorias: Categoria[];
  onSave: (datos: FormularioProducto, id?: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

function formularioVacio(categorias: Categoria[]): FormularioProducto {
  return {
    nombre: '',
    descripcion: '',
    stock: 0,
    precio_unitario: 1000,
    unidad_medida: 'Unidad',
    fecha_entrada: new Date().toISOString().slice(0, 10),
    fecha_caducidad: '',
    estado: true,
    id_categoria: categorias[0]?.id_categoria || 0,
  };
}

export default function InventarioInterfaz({
  productos,
  categorias,
  onSave,
  onDelete,
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [paso, setPaso] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [form, setForm] = useState<FormularioProducto>(formularioVacio(categorias));

  useEffect(() => {
    if (!form.id_categoria && categorias.length > 0) {
      setForm((actual) => ({
        ...actual,
        id_categoria: categorias.find((categoria) => categoria.estado)?.id_categoria ?? categorias[0].id_categoria,
      }));
    }
  }, [categorias, form.id_categoria]);

  function abrirFormulario(producto?: Producto) {
    setEditando(producto || null);
    setPaso(1);
    setForm(
      producto
        ? {
            ...producto,
            descripcion: producto.descripcion ?? '',
            fecha_caducidad: producto.fecha_caducidad || '',
          }
        : formularioVacio(categorias)
    );
    setAbierto(true);
  }

  async function guardar(evento: React.FormEvent) {
    evento.preventDefault();

    await onSave(
      {
        ...form,
        stock: form.stock,
        precio_unitario: form.precio_unitario,
        id_categoria: form.id_categoria,
        fecha_caducidad: form.fecha_caducidad,
      },
      editando?.id_producto
    );

    setAbierto(false);
  }

  const productosFiltrados = productos.filter(
    (producto) =>
      producto.estado &&
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <div className="page-title">
        <div>
          <span className="eyebrow">CATÁLOGO</span>
          <h2>Inventario</h2>
        </div>

        <button
          className="btn primary"
          onClick={() => abrirFormulario()}
        >
          + Nuevo producto
        </button>
      </div>

      <div className="toolbar">
        <input
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <span>{productosFiltrados.length} productos</span>
      </div>

      <InventarioTabla
        productos={productosFiltrados}
        categorias={categorias}
        onEdit={abrirFormulario}
        onDelete={onDelete}
      />

      {abierto && (
        <Modal
          title={
            editando
              ? 'Editar producto'
              : 'Registrar producto · 3 pasos'
          }
          onClose={() => setAbierto(false)}
        >
          <div className="steps">
            <span className={paso >= 1 ? 'done' : ''}>1. General</span>
            <span className={paso >= 2 ? 'done' : ''}>2. Inventario</span>
            <span className={paso >= 3 ? 'done' : ''}>3. Comercial</span>
          </div>

          <form onSubmit={guardar}>
            {paso === 1 && (
              <div className="form-grid">
                <label>
                  Nombre
                  <input
                    placeholder="Ej. Arroz 500g"
                    value={form.nombre}
                    onChange={(e) =>
                      setForm({ ...form, nombre: e.target.value })
                    }
                    required
                  />
                </label>

                <label>
                  Categoría
                  <select
                    value={form.id_categoria}
                    onChange={(e) =>
                      setForm({ ...form, id_categoria: Number(e.target.value) })
                    }
                    required
                  >
                    {categorias
                      .filter((c) => c.estado)
                      .map((c) => (
                        <option
                          key={c.id_categoria}
                          value={c.id_categoria}
                        >
                          {c.nombre_categoria}
                        </option>
                      ))}
                  </select>
                </label>

                <label className="span2">
                  Descripción
                  <textarea
                    placeholder="Descripción corta del producto"
                    value={form.descripcion || ''}
                    onChange={(e) =>
                      setForm({ ...form, descripcion: e.target.value })
                    }
                  />
                </label>
              </div>
            )}

            {paso === 2 && (
              <div className="form-grid">
                <label>
                  Stock inicial
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: Number(e.target.value) })
                    }
                  />
                </label>

                <label>
                  Unidad de medida
                  <select
                    value={form.unidad_medida}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        unidad_medida: e.target.value,
                      })
                    }
                  >
                    <option>Unidad</option>
                    <option>Caja</option>
                    <option>Kg</option>
                    <option>Litro</option>
                  </select>
                </label>

                <label>
                  Fecha de entrada
                  <input
                    type="date"
                    value={form.fecha_entrada}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        fecha_entrada: e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Fecha de caducidad
                  <input
                    type="date"
                    value={form.fecha_caducidad || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        fecha_caducidad: e.target.value,
                      })
                    }
                  />
                </label>
              </div>
            )}

            {paso === 3 && (
              <div className="form-grid">
                <label>
                  Precio unitario
                  <input
                    type="number"
                    min="1"
                    value={form.precio_unitario}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        precio_unitario: Number(e.target.value),
                      })
                    }
                  />
                </label>

                <label>
                  Estado
                  <select
                    value={form.estado ? 'true' : 'false'}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        estado: e.target.value === 'true',
                      })
                    }
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </label>
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="btn cancel"
                onClick={() => setAbierto(false)}
              >
                Cancelar
              </button>

              {paso > 1 && (
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setPaso(paso - 1)}
                >
                  Atrás
                </button>
              )}

              {paso < 3 ? (
                <button
                  type="button"
                  className="btn primary"
                  onClick={() => setPaso(paso + 1)}
                >
                  Siguiente
                </button>
              ) : (
                <button className="btn primary">
                  {editando ? 'Guardar cambios' : 'Guardar producto'}
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
