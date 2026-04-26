export function Confirm({ s, ok, cancel }) {
  if (!s) return null;
  return (
    <div className="modal-bg">
      <div className="confirm-box">
        <div className="ci">🗑️</div>
        <h3>Confirm Delete</h3>
        <p>{s.msg}</p>
        <div className="confirm-btns">
          <button className="btn btn-outline" onClick={cancel}>Cancel</button>
          <button className="btn btn-red" onClick={ok}>
            <i className="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
