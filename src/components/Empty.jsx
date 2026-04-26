export function Empty({ icon="fa-inbox", title="Nothing here", desc="Try adding a new entry." }) {
  return (
    <div className="empty">
      <i className={`fas ${icon}`}></i>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}
