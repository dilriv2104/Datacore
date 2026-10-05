type Props = {
  msg: string;
  onClose: () => void;
};

export default function Toast({ msg, onClose }: Props) {
  return (
    <div className="toast">
      {msg}
      <button onClick={onClose}>×</button>
    </div>
  );
}
