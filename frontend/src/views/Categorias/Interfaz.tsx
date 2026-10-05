import { useState } from 'react';

import Modal from '../../components/Modal';
import type { Categoria } from '../../types';
import CategoriaForm from './form';
import CategoriasTabla from './Tabla';

type Props = {
  categorias: Categoria[];
  onSave: (datos: CategoriaFormulario, id?: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

export type CategoriaFormulario = {
  nombre_categoria: string;
  descripcion: string;
  estado: boolean;
};

const FORMULARIO_VACIO: CategoriaFormulario = {
  nombre_categoria: '',
  descripcion: '',
  estado: true,
};

export default function CategoriasInterfaz({
  categorias,
  onSave,
  onDelete,
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [form, setForm] = useState<CategoriaFormulario>(FORMULARIO_VACIO);

  function abrirFormulario(categoria?: Categoria) {
    setEditando(categoria ?? null);
    setForm(
      categoria
        ? {
            nombre_categoria: categoria.nombre_categoria,
            descripcion: categoria.descripcion ?? '',
            estado: categoria.estado,
          }
        : { ...FORMULARIO_VACIO }
    );
    setAbierto(true);
  }

  async function guardar(evento: React.FormEvent) {
    evento.preventDefault();
    await onSave(form, editando?.id_categoria);
    setAbierto(false);
  }

  return (
    <section>
      <div className="page-title">
        <div>
          <span className="eyebrow">CATÁLOGO</span>
          <h2>Categorías</h2>
          <p className="muted small">Organiza los productos por categorías.</p>
        </div>

        <button className="btn primary" onClick={() => abrirFormulario()}>
          + Nueva categoría
        </button>
      </div>

      <CategoriasTabla
        categorias={categorias}
        onEdit={abrirFormulario}
        onDelete={onDelete}
      />

      {abierto && (
        <Modal
          title={editando ? 'Editar categoría' : 'Nueva categoría'}
          onClose={() => setAbierto(false)}
        >
          <CategoriaForm
            form={form}
            setForm={setForm}
            onClose={() => setAbierto(false)}
            onSubmit={guardar}
          />
        </Modal>
      )}
    </section>
  );
}
