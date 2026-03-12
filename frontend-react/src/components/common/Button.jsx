export default function Button({ label, variant = 'primary', onClick, disabled = false }) {
  const buttonClass = `btn btn-${variant}`;
  return (
    <button className={buttonClass} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}