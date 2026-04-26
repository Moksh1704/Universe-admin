const TOAST_ICON = {
  success: "fa-check-circle",
  error:   "fa-times-circle",
  info:    "fa-info-circle",
};

export function Toasts({ list }) {
  return (
    <div className="toast-area">
      {list.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <i className={`fas ${TOAST_ICON[t.type]}`}></i>{t.msg}
        </div>
      ))}
    </div>
  );
}
