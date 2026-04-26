import { useState } from 'react'
import { Modal } from '../components/Modal'

export function Profile({ toast }) {
  const [pwModal,  setPwModal]  = useState(false);
  const [form,     setForm]     = useState({cur:"",nw:"",cf:""});
  const [showCur,  setShowCur]  = useState(false);
  const [showNw,   setShowNw]   = useState(false);

  const savePw = () => {
    if (!form.cur || !form.nw || !form.cf) { toast("Please fill all fields","error"); return; }
    if (form.nw !== form.cf)               { toast("Passwords do not match","error"); return; }
    if (form.nw.length < 6)               { toast("Password must be at least 6 characters","error"); return; }
    // API: axios.post("/api/auth/change-password",{currentPassword:form.cur,newPassword:form.nw})
    toast("Password changed successfully");
    setPwModal(false);
    setForm({cur:"",nw:"",cf:""});
  };

  return (
    <div>
      <div className="page-header">
        <p>Manage your account information and security settings.</p>
      </div>

      <div className="profile-banner">
        <div className="profile-avatar-lg">SA</div>
        <div className="profile-name">Admin</div>
        <div className="profile-role">Administrator · CSE Department</div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>
        {/* Basic Info */}
        <div className="card">
          <div className="card-title"><i className="fas fa-id-card"></i> Basic Information</div>
          {[
            {label:"Full Name",  val:"Admin"},
            {label:"Email",      val:"admin@cse.edu"},
            {label:"Department", val:"Computer Science & Engineering"},
            {label:"Role",       val:"Administrator"},
            {label:"Joined",     val:"January 2024"},
          ].map(r => (
            <div key={r.label} style={{padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
              <div style={{fontSize:11.5,color:"var(--text-3)",marginBottom:2,textTransform:"uppercase",letterSpacing:".5px"}}>{r.label}</div>
              <div style={{fontWeight:600,fontSize:14,color:"var(--navy)"}}>{r.val}</div>
            </div>
          ))}
        </div>

        {/* Security */}
        <div className="card">
          <div className="card-title"><i className="fas fa-shield-alt"></i> Account Security</div>
          <p style={{fontSize:13.5,color:"var(--text-2)",lineHeight:1.6,marginBottom:18}}>
            Keep your account secure with a strong, unique password. Change it regularly for best security.
          </p>
          <button className="btn btn-navy w-full" style={{justifyContent:"center"}} onClick={() => setPwModal(true)}>
            <i className="fas fa-key"></i> Change Password
          </button>
          <div className="divider"></div>
          <div className="card-title" style={{marginBottom:10}}>
            <i className="fas fa-info-circle"></i> System Info
          </div>
          {[
            {label:"App Version", val:"2.0.0"},
            {label:"API Endpoint",val:"/api/v1"},
            {label:"Auth Method", val:"JWT Bearer"},
          ].map(r => (
            <div key={r.label} className="f-between" style={{padding:"7px 0"}}>
              <span style={{fontSize:13,color:"var(--text-3)"}}>{r.label}</span>
              <span className="chip">{r.val}</span>
            </div>
          ))}
        </div>
      </div>

      {pwModal && (
        <Modal
          title="Change Password"
          onClose={() => { setPwModal(false); setForm({cur:"",nw:"",cf:""}); }}
        >
          <div className="form-g">
            <label>Current Password</label>
            <div className="pw-wrap">
              <input
                type={showCur ? "text" : "password"}
                value={form.cur}
                onChange={e => setForm(p => ({...p, cur:e.target.value}))}
                placeholder="Current password"
              />
              <button type="button" className="pw-eye" onClick={() => setShowCur(!showCur)}>
                <i className={`fas fa-eye${showCur ? "-slash" : ""}`}></i>
              </button>
            </div>
          </div>
          <div className="form-g">
            <label>New Password</label>
            <div className="pw-wrap">
              <input
                type={showNw ? "text" : "password"}
                value={form.nw}
                onChange={e => setForm(p => ({...p, nw:e.target.value}))}
                placeholder="At least 6 characters"
              />
              <button type="button" className="pw-eye" onClick={() => setShowNw(!showNw)}>
                <i className={`fas fa-eye${showNw ? "-slash" : ""}`}></i>
              </button>
            </div>
          </div>
          <div className="form-g">
            <label>Confirm New Password</label>
            <div className="pw-wrap">
              <input
                type="password"
                value={form.cf}
                onChange={e => setForm(p => ({...p, cf:e.target.value}))}
                placeholder="Re-enter new password"
              />
            </div>
          </div>
          <div style={{display:"flex",gap:8,marginTop:6}}>
            <button
              className="btn btn-outline"
              style={{flex:1,justifyContent:"center"}}
              onClick={() => { setPwModal(false); setForm({cur:"",nw:"",cf:""}); }}
            >
              Cancel
            </button>
            <button className="btn btn-navy" style={{flex:1,justifyContent:"center"}} onClick={savePw}>
              <i className="fas fa-save"></i> Update Password
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
