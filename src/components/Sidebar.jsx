import React from 'react'
import { NAV } from '../constants'
import { LOGO_BASE64 } from '../assets/logoData'

export function Sidebar({ active, setActive, collapsed, setCollapsed, mobOpen, setMobOpen, onLogout }) {
  let lastSec = "";
  return (
    <>
      <div className={`mob-overlay${mobOpen ? " show" : ""}`} onClick={() => setMobOpen(false)}></div>
      <div className={`sidebar${collapsed ? " collapsed" : ""}${mobOpen ? " mob-open" : ""}`}>
        <div className="sidebar-logo-area">
          <img
            src={LOGO_BASE64}
            width="38"
            height="38"
            style={{borderRadius:"11px",objectFit:"cover",flexShrink:0}}
            alt="Logo"
          />
          <div className="logo-text">
            <div className="name">CSE Admin</div>
            <div className="sub">Dept. Portal</div>
          </div>
          <button
            className="collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <i className={`fas fa-chevron-${collapsed ? "right" : "left"}`}></i>
          </button>
        </div>

        <div className="nav-links">
          {NAV.map(item => {
            const showSec = item.sec !== lastSec;
            if (showSec) lastSec = item.sec;
            return (
              <React.Fragment key={item.id}>
                {showSec && !collapsed && (
                  <div className="nav-section-label">{item.sec}</div>
                )}
                <div
                  className={`nav-item${active === item.id ? " active" : ""}`}
                  onClick={() => { setActive(item.id); setMobOpen(false); }}
                  title={collapsed ? item.label : ""}
                >
                  <i className={`fas ${item.icon} ni`}></i>
                  <span className="nav-label">{item.label}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        <div className="sidebar-bottom">
          <div className="admin-avatar" onClick={() => { setActive("profile"); setMobOpen(false); }}>AD</div>
          <div className="admin-text">
            <div className="name">Admin</div>
            <div className="role">Administrator</div>
          </div>
          <button className="logout-btn" onClick={onLogout} title="Logout">
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </>
  );
}
