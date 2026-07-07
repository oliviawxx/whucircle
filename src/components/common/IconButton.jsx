export function IconButton({ title, children, onClick, active = false }) {
  return (
    <button
      className={active ? "icon-mini active" : "icon-mini"}
      aria-label={title}
      title={title}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
