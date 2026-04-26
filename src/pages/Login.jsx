import { useState } from 'react'
import { LOGO_BASE64 } from '../assets/logoData'

export function Login({ onLogin }) {
  const [email,   setEmail]   = useState("");
  const [pass,    setPass]    = useState("");
  const [show,    setShow]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState("");

  const submit = e => {
    e.preventDefault();
    setErr("");
    if (!email || !pass) { setErr("Please fill in all fields."); return; }
    setLoading(true);
    // API: axios.post("/api/auth/login",{email,password}).then(res=>{ store token; onLogin(); })
    setTimeout(() => {
      if (email.includes("@") && pass.length >= 4) { onLogin(); }
      else { setErr("Invalid credentials. Please try again."); setLoading(false); }
    }, 900);
  };

  return (
    <div className="login-page">
      <div className="login-bg-shapes">
        <div className="login-shape login-shape-1"></div>
        <div className="login-shape login-shape-2"></div>
        <div className="login-shape login-shape-3"></div>
      </div>
      <div className="login-glow"></div>
      <div className="login-card">
        <div className="login-logo-area">
          <img
            src={LOGO_BASE64}
            width="72"
            height="72"
            style={{borderRadius:"18px",objectFit:"cover",margin:"0 auto 14px",display:"block",background:"#000"}}
            alt="Logo"
          />
          <h1>CSE <span>Admin</span></h1>
          <p>Department of Computer Science &amp; Engineering<br/>Department Portal v2.0</p>
        </div>
        <form onSubmit={submit}>
          <div className="login-field">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="admin@cse.edu"
              value={email}
              onChange={e => { setEmail(e.target.value); setErr(""); }}
              autoFocus
            />
          </div>
          <div className="login-field">
            <label>Password</label>
            <div className="pw-wrap">
              <input
                type={show ? "text" : "password"}
                placeholder="••••••••"
                value={pass}
                onChange={e => { setPass(e.target.value); setErr(""); }}
              />
              <button type="button" className="pw-eye" onClick={() => setShow(!show)}>
                <i className={`fas fa-eye${show ? "-slash" : ""}`}></i>
              </button>
            </div>
          </div>
          <div className="login-error">{err}</div>
          <button type="submit" className="login-submit" disabled={loading}>
            {loading
              ? <><i className="fas fa-spinner fa-spin"></i>&nbsp;Signing in…</>
              : <><i className="fas fa-sign-in-alt"></i>&nbsp;Sign In</>
            }
          </button>
        </form>
        <div className="login-footer">© 2025 CSE Department · All rights reserved</div>
      </div>
    </div>
  );
}
