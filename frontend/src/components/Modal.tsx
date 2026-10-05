type Props = {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

// Ventana emergente reutilizable: se usa para los formularios
// de crear/editar (productos, categorías, usuarios) y para
// confirmar el cierre de sesión.
export default function Modal({ title, children, onClose }: Props) {
  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-head">
          <h3>{title}</h3>
          <button onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
