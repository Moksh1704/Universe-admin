const icons = {
  event:        {icon:"fa-calendar-days", bg:"#FFF8E7", col:"#C9A84C"},
  announcement: {icon:"fa-bullhorn",      bg:"#EFF6FF", col:"#2563EB"},
};

export function NotifPanel({ notifs, markAll, markOne, setActive }) {
  const unreadCount = notifs.filter(n => n.unread).length;
  return (
    <div className="notif-panel">
      <div className="notif-head">
        <h4>
          Notifications{" "}
          {unreadCount > 0 && (
            <span style={{background:"var(--gold)",color:"var(--navy)",borderRadius:20,padding:"1px 8px",fontSize:11,fontWeight:800,marginLeft:6}}>
              {unreadCount}
            </span>
          )}
        </h4>
        {unreadCount > 0 && (
          <button className="notif-mark" onClick={markAll}>Mark all read</button>
        )}
      </div>

      {notifs.length === 0 && (
        <div style={{padding:"22px",textAlign:"center",color:"var(--text-3)",fontSize:13}}>All caught up ✓</div>
      )}

      {notifs.map(n => {
        const t = icons[n.type] || icons.event;
        return (
          <div
            key={n.id}
            className={`notif-item${n.unread ? " unread" : ""}`}
            onClick={() => {
              markOne && markOne(n.id);
              setActive(n.type === "event" ? "events" : n.type === "announcement" ? "announcements" : "chat");
            }}
          >
            <div className="notif-icon" style={{background:t.bg, color:t.col}}>
              <i className={`fas ${t.icon}`}></i>
            </div>
            <div className="notif-text" style={{flex:1}}>
              <div className="ntitle">{n.title}</div>
              <div className="nmeta">{n.meta}</div>
            </div>
            {n.unread && <div className="unread-pip"></div>}
          </div>
        );
      })}
    </div>
  );
}
