import { useState } from 'react'
import { Empty } from '../components/Empty'
import { deleteChatMessageApi, fetchChatApi } from '../services/api'

export function ChatMonitor({ chat, setChat, chatLoading, toast, confirm }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  // Guard chat against undefined/null
  const safeChat = (chat || []);

  // Debug: log whenever chat data changes
  console.log("CHAT DATA:", safeChat);

  const flaggedCount = safeChat.filter(m => m.flagged).length;

  // Null-safe filter using correct field names
  // user_name → display name  |  message → message text  |  flagged → bool
  const filtered = safeChat.filter(m => {
    const q    = search.toLowerCase();
    const name = (m.user_name || "").toLowerCase();
    const msg  = (m.message   || "").toLowerCase();
    const match = name.includes(q) || msg.includes(q);
    return match && (filter === "All" || (filter === "Flagged" && m.flagged));
  });

  // Soft-delete: PATCH message in state; call DELETE API (soft-deletes server-side)
  const del = id => confirm("Delete this message?", async () => {
    // Optimistic update — mark as deleted immediately in UI
    setChat(p => (p || []).map(m =>
      m.id === id
        ? {...m, is_deleted:true, deleted_by:"admin", message:"This message was deleted by admin"}
        : m
    ));
    try {
      const res = await deleteChatMessageApi(id);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast("Message deleted","info");
    } catch(err) {
      // Rollback: re-fetch from server if API call failed
      console.error("Delete failed:", err);
      toast("Delete failed — refreshing","error");
      try {
        const data = await fetchChatApi();
        setChat(Array.isArray(data) ? data : []);
      } catch(_) { /* silently ignore refresh error */ }
    }
  });

  const toggleFlag = id => {
    setChat(p => (p || []).map(m => m.id === id ? {...m, flagged:!m.flagged} : m));
    toast("Flag updated");
  };

  const getAvatar = name => name ? name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() : "??";
  const fmtTime   = ts   => { try { return new Date(ts).toLocaleString(); } catch { return ts || ""; } };

  const deletedCount = safeChat.filter(m => m.is_deleted).length;

  return (
    <div>
      <div className="page-header">
        <p>Monitor and moderate student messages in real time.</p>
      </div>

      <div className="filter-bar" style={{alignItems:"center"}}>
        <div className="search-row" style={{flex:1,maxWidth:"100%"}}>
          <i className="fas fa-search"></i>
          <input placeholder="Search messages…" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <div className="tab-bar" style={{marginBottom:0,flexShrink:0}}>
          <button className={`tab-btn${filter === "All" ? " active" : ""}`} onClick={() => setFilter("All")}>
            All ({safeChat.length})
          </button>
          <button className={`tab-btn${filter === "Flagged" ? " active" : ""}`} onClick={() => setFilter("Flagged")}>
            <i className="fas fa-flag" style={{marginRight:5,color:filter==="Flagged"?"#fff":"var(--red)"}}></i>
            Flagged
            {flaggedCount > 0 && (
              <span style={{marginLeft:6,background:"var(--red)",color:"#fff",borderRadius:20,padding:"1px 7px",fontSize:11,fontWeight:700}}>
                {flaggedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {chatLoading
        ? <div style={{textAlign:"center",padding:"48px 0",color:"var(--text-3)",fontSize:14}}>
            <i className="fas fa-spinner fa-spin" style={{marginRight:8}}></i>Loading messages...
          </div>
        : filtered.length === 0
          ? <Empty icon="fa-comments" title="No messages found"/>
          : <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {filtered.map(m => {
                const isDeleted = !!m.is_deleted;
                return (
                  <div key={m.id} className={`chat-msg${m.flagged?" flagged":""}${isDeleted?" deleted":""}`}>
                    <div className="f-between mb-8">
                      <div className="f-center gap-10">
                        <div className="chat-avatar" style={isDeleted?{opacity:0.45}:{}}>{getAvatar(m.user_name||"Unknown User")}</div>
                        <div>
                          <div style={{fontWeight:700,fontSize:14,color:isDeleted?"var(--text-3)":"var(--navy)"}}>{m.user_name||"Unknown User"}</div>
                          <div style={{fontSize:11.5,color:"var(--text-3)"}}>{fmtTime(m.created_at)}</div>
                        </div>
                      </div>
                      <div className="f-center gap-6">
                        {isDeleted
                          ? <span className="deleted-badge">
                              <i className="fas fa-ban" style={{fontSize:10}}></i>
                              {m.deleted_by === "admin" ? "Deleted by Admin" : "Deleted"}
                            </span>
                          : <>
                              {m.flagged && (
                                <span className="badge badge-red"><i className="fas fa-flag" style={{marginRight:3}}></i>Flagged</span>
                              )}
                              <button className="btn btn-outline btn-sm" onClick={() => toggleFlag(m.id)} title="Toggle flag">
                                <i className="fas fa-flag" style={{color:m.flagged?"var(--red)":"var(--text-3)"}}></i>
                              </button>
                              <button className="btn btn-red btn-sm" onClick={() => del(m.id)} title="Delete message">
                                <i className="fas fa-trash"></i>
                              </button>
                            </>
                        }
                      </div>
                    </div>

                    {/* Message text */}
                    <p style={{
                      fontSize:  isDeleted ? 13   : 13.5,
                      color:     isDeleted ? "var(--text-3)" : "var(--text-1)",
                      fontStyle: isDeleted ? "italic" : "normal",
                      lineHeight: 1.65,
                      paddingLeft: "clamp(0px, 46px, 10vw)",
                      display: "flex", alignItems: "center", gap: 6,
                    }}>
                      {isDeleted && <i className="fas fa-ban" style={{fontSize:11,color:"var(--text-3)",flexShrink:0}}></i>}
                      {m.message}
                    </p>

                    {/* Flag reason — only shown on non-deleted flagged messages */}
                    {!isDeleted && m.flagged && m.flag_reason && (
                      <div style={{marginTop:8,paddingLeft:"clamp(0px, 46px, 10vw)"}}>
                        <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:12,color:"var(--red)",background:"var(--red-bg)",border:"1px solid var(--red-border)",borderRadius:7,padding:"3px 10px",fontWeight:600}}>
                          <i className="fas fa-exclamation-triangle"></i>
                          Reason: {m.flag_reason}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
      }
    </div>
  );
}
