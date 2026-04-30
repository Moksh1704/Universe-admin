import { useState, useEffect } from 'react'
import { Modal } from '../components/Modal'
import { Empty } from '../components/Empty'
import { LinkifiedText } from '../components/LinkifiedText'
import { fmtDate } from '../utils'
import {
  fetchAnnouncementsApi,
  createAnnouncementApi,
  updateAnnouncementApi,
  deleteAnnouncementApi,
} from '../services/api'

export function Announcements({ toast, confirm, addNotif }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [editingId,     setEditingId]     = useState(null);
  const [formData,      setFormData]      = useState({title:"",content:""});
  const [modal,         setModal]         = useState(false);

  useEffect(() => { fetchAnnouncements(); }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await fetchAnnouncementsApi();
      console.log("Announcements:", data);
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch(err) {
      console.error("Fetch error:", err);
      toast("Failed to load announcements","error");
    } finally {
      setLoading(false);
    }
  };

  const openAdd  = () => { setFormData({title:"",content:""}); setEditingId(null); setModal(true); };
  const openEdit = a  => { setFormData({title:a?.title||"",content:a?.content||""}); setEditingId(a?.id); setModal(true); };
  const closeModal = () => { setModal(false); setEditingId(null); setFormData({title:"",content:""}); };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) { toast("Please fill all fields","error"); return; }
    try {
      if (editingId) {
        const res = await updateAnnouncementApi(editingId, formData);
        if (!res.ok) throw new Error("Failed");
        toast("Announcement updated");
      } else {
        const res = await createAnnouncementApi(formData);
        if (!res.ok) throw new Error("Failed");
        toast("Announcement posted");
        addNotif("announcement","New Announcement",`${formData.title} · Just now`);
      }
      closeModal();
      fetchAnnouncements();
    } catch(err) {
      console.error("Submit error:", err);
      toast("Failed to save announcement","error");
    }
  };

  const handleDelete = async id => {
    confirm("Delete this announcement?", async () => {
      try {
        await deleteAnnouncementApi(id);
        toast("Deleted","info");
        fetchAnnouncements();
      } catch(err) {
        console.error("Delete error:", err);
        toast("Failed to delete","error");
      }
    });
  };

  return (
    <div>
      <div className="page-header f-between" style={{flexWrap:"wrap",gap:10}}>
        <div><p>Post important updates and notices for the department.</p></div>
        <button className="btn btn-navy hide-mob" onClick={openAdd}>
          <i className="fas fa-bullhorn"></i> New Announcement
        </button>
      </div>

      {loading
        ? <div style={{textAlign:"center",padding:"48px 0",color:"var(--text-3)",fontSize:14}}>
            <i className="fas fa-spinner fa-spin" style={{marginRight:8}}></i>Loading announcements...
          </div>
        : announcements.length === 0
          ? <Empty icon="fa-bullhorn" title="No announcements found" desc="Post your first announcement using the button above."/>
          : <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {announcements.map(a => (
                <div key={a?.id ?? Math.random()} className="ann-card">
                  <div className="f-between mb-8">
                    <h3 style={{fontWeight:700,fontSize:15,color:"var(--navy)",flex:1,paddingRight:12}}>
                      {a?.title || "Untitled"}
                    </h3>
                    <div className="f-center gap-6" style={{flexShrink:0}}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(a)}><i className="fas fa-pen"></i></button>
                      <button className="btn btn-red btn-sm"     onClick={() => handleDelete(a?.id)}><i className="fas fa-trash"></i></button>
                    </div>
                  </div>
                  <p style={{fontSize:13.5,color:"var(--text-2)",lineHeight:1.65,whiteSpace:"pre-wrap"}}>
                    <LinkifiedText text={a?.content || ""} />
                  </p>
                  <div style={{fontSize:11.5,color:"var(--text-3)",marginTop:10,display:"flex",alignItems:"center",gap:5}}>
                    <i className="fas fa-calendar-alt" style={{color:"var(--gold)"}}></i>
                    {a?.created_at
                      ? (() => { try { return fmtDate(a.created_at); } catch { return "-"; } })()
                      : "-"
                    }
                  </div>
                </div>
              ))}
            </div>
      }

      <button className="fab" onClick={openAdd}><i className="fas fa-plus"></i></button>

      {modal && (
        <Modal
          title={editingId ? "Edit Announcement" : "New Announcement"}
          onClose={closeModal}
          footer={
            <>
              <button className="btn btn-outline" onClick={closeModal}>Cancel</button>
              <button className="btn btn-navy" onClick={handleSubmit}>
                <i className="fas fa-paper-plane"></i>{" "}
                {editingId ? "Update Announcement" : "Create Announcement"}
              </button>
            </>
          }
        >
          <div className="form-g">
            <label>Title *</label>
            <input
              value={formData.title}
              onChange={e => setFormData(p => ({...p, title:e.target.value}))}
              placeholder="Announcement title"
            />
          </div>
          <div className="form-g">
            <label>Content *</label>
            <textarea
              style={{minHeight:110}}
              value={formData.content}
              onChange={e => setFormData(p => ({...p, content:e.target.value}))}
              placeholder="Write your announcement here…"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}