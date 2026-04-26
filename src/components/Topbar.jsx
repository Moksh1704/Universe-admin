import { useState, useEffect, useRef } from 'react'
import { today } from '../utils'
import { NotifPanel } from './NotifPanel'

export function Topbar({ pageTitle, onHam, notifs, markAll, markOne, setActive, onProfile }) {
  const [showN, setShowN] = useState(false);
  const unread = notifs.filter(n => n.unread).length;
  const ref = useRef();

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setShowN(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="topbar">
      <button className="mob-ham" onClick={onHam}>
        <i className="fas fa-bars"></i>
      </button>
      <div className="topbar-title">{pageTitle}</div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <span className="topbar-date hide-mob">{today()}</span>
        <div ref={ref} style={{position:"relative"}}>
          <div className="topbar-icon-btn" onClick={() => setShowN(!showN)} title="Notifications">
            <i className="fas fa-bell"></i>
            {unread > 0 && <span className="notif-dot"></span>}
          </div>
          {showN && (
            <NotifPanel
              notifs={notifs}
              markAll={() => { markAll(); setShowN(false); }}
              markOne={markOne}
              setActive={id => { setActive(id); setShowN(false); }}
            />
          )}
        </div>
        <div className="topbar-icon-btn" onClick={onProfile} title="My Profile">
          <i className="fas fa-user-circle"></i>
        </div>
      </div>
    </div>
  );
}
