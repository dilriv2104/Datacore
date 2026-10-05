import type { Dispatch, FormEvent, SetStateAction } from 'react';

import type { CategoriaFormulario } from './Interfaz';

type Props = {
    form: CategoriaFormulario;
    setForm: Dispatch<SetStateAction<CategoriaFormulario>>;
    onClose: () => void;
    onSubmit: (event: FormEvent) => Promise<void>;
};

export default function CategoriaForm({
    form,
    setForm,
    onClose,
    onSubmit,
}: Props) {
    return (
    <form className="form-grid" onSubmit={onSubmit}>
        <label>
        Nombre
        <input
            value={form.nombre_categoria}
            onChange={(e) =>
            setForm((prev) => ({ ...prev, nombre_categoria: e.target.value }))
            }
            required
        />
        </label>

        <label>
        Descripción
        <textarea
            value={form.descripcion}
            onChange={(e) =>
            setForm((prev) => ({ ...prev, descripcion: e.target.value }))
            }
        />
        </label>

        <label>
        Estado
        <select
            value={form.estado ? 'true' : 'false'}
            onChange={(e) =>
            setForm((prev) => ({
                ...prev,
                estado: e.target.value === 'true',
            }))
            }
        >
            <option value="true">Activa</option>
            <option value="false">Inactiva</option>
        </select>
        </label>

        <div className="modal-actions span2">
        <button type="button" className="btn cancel" onClick={onClose}>
            Cancelar
        </button>
        <button className="btn primary">Guardar</button>
        </div>
    </form>
    );
}