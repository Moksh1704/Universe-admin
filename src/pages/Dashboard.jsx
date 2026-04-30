import { useState, useEffect, useMemo } from 'react'
import { fetchAnnouncementsApi } from '../services/api'

export function Dashboard({ students, faculty, facultyList, events, setPage }) {
  const [announcements,  setAnnouncements]  = useState([]);
  const [recentLoading,  setRecentLoading]  = useState(true);

  useEffect(() => {
    const fetchAnn = async () => {
      try {
        const data = await fetchAnnouncementsApi();
        setAnnouncements(Array.isArray(data) ? data : []);
      } catch {
        setAnnouncements([]);
      } finally {
        setRecentLoading(false);
      }
    };
    fetchAnn();
  }, []);

  const stats = [
    {label:"Total Students", val:students.length,      icon:"fa-user-graduate",       bg:"#EFF6FF", ic:"#2563EB", varColor:"rgba(37,99,235,.06)"},
    {label:"Total Faculty",  val:facultyList.length,    icon:"fa-chalkboard-teacher",  bg:"#F0FDF4", ic:"#16A34A", varColor:"rgba(22,163,74,.06)"},
    {label:"Total Events",   val:events.length,         icon:"fa-calendar-days",       bg:"#FFF8E7", ic:"#C9A84C", varColor:"rgba(201,168,76,.06)"},
    {label:"Announcements",  val:announcements.length,  icon:"fa-bullhorn",            bg:"#F5F3FF", ic:"#7C3AED", varColor:"rgba(124,58,237,.06)"},
  ];

  const recentActivity = useMemo(() => {
    const annItems = announcements.map(a => ({
      id: "ann-" + (a.id || a._id || Math.random()),
      type: "announcement",
      title: a.title || a.subject || "Announcement",
      meta: a.category || "General",
      created_at: a.created_at || a.createdAt || a.date || 0,
    }));
    const evItems = events.map(e => ({
      id: "ev-" + (e.id || e._id || Math.random()),
      type: "event",
      title: e.title || "Event",
      meta: e.location || e.venue || "",   // 🔥 FIX: safe fallback for location/venue
      created_at: e.created_at || e.createdAt || e.date || 0,
    }));
    return [...annItems, ...evItems]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 6);
  }, [announcements, events]);

  const fmtDate = dt => {
    if (!dt) return "—";
    const d = new Date(dt);
    if (isNaN(d)) return "—";
    return d.toLocaleDateString("en", {day:"numeric", month:"short", year:"numeric"});
  };

  const downloadAttendance = () => {
    const csv = ["Name,Role,Department,Year,Section"];
    [
      ...students.map(s => ([s.name,"Student",s.department||"",s.year||"",s.section||""].join(","))),
      ...faculty.map(f => ([f.name,"Faculty",f.department||"","",""].join(","))),
    ].forEach(r => csv.push(r));
    const blob = new Blob([csv.join("\n")], {type:"text/csv"});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "attendance_export.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="page-header">
        <p>Welcome back, Admin · CSE Department Overview</p>
      </div>

      {/* ── OVERVIEW STAT CARDS ── */}
      <div className="stat-grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))"}}>
        {stats.map(s => (
          <div key={s.label} className="stat-card" style={{"--ic-color":s.varColor}}>
            <div className="stat-icon" style={{background:s.bg, color:s.ic}}>
              <i className={`fas ${s.icon}`}></i>
            </div>
            <div>
              <div className="stat-val">{s.val}</div>
              <div className="stat-lbl">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-title"><i className="fas fa-bolt"></i> Quick Actions</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
          <button className="btn btn-navy" onClick={() => setPage && setPage("events")}>
            <i className="fas fa-calendar-plus"></i> Create Event
          </button>
          <button className="btn btn-navy" style={{background:"var(--purple)"}} onClick={() => setPage && setPage("announcements")}>
            <i className="fas fa-bullhorn"></i> Add Announcement
          </button>
          <button className="btn btn-outline" onClick={downloadAttendance}>
            <i className="fas fa-file-download"></i> Download Attendance
          </button>
        </div>
      </div>

      {/* ── BOTTOM GRID: Recent Activity + Upcoming Events ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:14}}>

        {/* RECENT ACTIVITY */}
        <div className="card">
          <div className="card-title"><i className="fas fa-clock-rotate-left"></i> Recent Activity</div>
          {recentLoading
            ? <div style={{textAlign:"center",padding:"28px 0",color:"var(--text-3)"}}>
                <i className="fas fa-spinner fa-spin" style={{marginRight:8}}></i>Loading…
              </div>
            : recentActivity.length === 0
              ? <div className="empty" style={{padding:"28px 0"}}><i className="fas fa-inbox"></i><p>No recent activity</p></div>
              : <div>
                  {recentActivity.map(item => {
                    const isAnn = item.type === "announcement";
                    return (
                      <div key={item.id} style={{display:"flex",alignItems:"flex-start",gap:11,padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
                        <div style={{
                          width:34,height:34,borderRadius:9,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,
                          background: isAnn ? "var(--purple-bg)" : "var(--gold-pale)",
                          color:      isAnn ? "var(--purple)"    : "var(--gold)",
                        }}>
                          <i className={`fas ${isAnn ? "fa-bullhorn" : "fa-calendar-days"}`}></i>
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:600,fontSize:13.5,color:"var(--navy)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.title}</div>
                          <div style={{display:"flex",gap:8,marginTop:2,flexWrap:"wrap"}}>
                            <span className="chip" style={{fontSize:11,padding:"1px 8px",background:isAnn?"var(--purple-bg)":"var(--gold-pale)",borderColor:isAnn?"var(--purple-border)":"var(--gold-border)",color:isAnn?"var(--purple)":"var(--gold)"}}>
                              {isAnn ? "Announcement" : "Event"}
                            </span>
                            {item.meta && <span style={{fontSize:12,color:"var(--text-3)"}}>{item.meta}</span>}
                          </div>
                        </div>
                        <div style={{fontSize:11.5,color:"var(--text-3)",whiteSpace:"nowrap",flexShrink:0,marginTop:2}}>{fmtDate(item.created_at)}</div>
                      </div>
                    );
                  })}
                </div>
          }
        </div>

        {/* UPCOMING EVENTS */}
        <div className="card">
          <div className="card-title"><i className="fas fa-calendar-days"></i> Upcoming Events</div>
          {events.length === 0
            ? <div className="empty" style={{padding:"28px 0"}}><i className="fas fa-calendar-xmark"></i><p>No events scheduled</p></div>
            : events.slice(0,5).map(e => {
                const d   = new Date(e.date);
                const day = d.getDate();
                const mon = d.toLocaleDateString("en", {month:"short"});
                return (
                  <div key={e.id} className="f-center gap-12" style={{padding:"9px 0",borderBottom:"1px solid var(--border)"}}>
                    <div style={{background:"var(--navy)",borderRadius:8,padding:"4px 8px",textAlign:"center",minWidth:44,flexShrink:0}}>
                      <div style={{fontWeight:800,fontSize:16,color:"#fff",lineHeight:1}}>{isNaN(day) ? "-" : day}</div>
                      <div style={{fontSize:9,textTransform:"uppercase",letterSpacing:1,color:"var(--gold-2)"}}>{isNaN(day) ? "" : mon}</div>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:13.5,color:"var(--navy)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.title}</div>
                      <div style={{fontSize:12,color:"var(--text-3)"}}>{e.location || e.venue || ""}</div>
                    </div>
                  </div>
                );
              })
          }
        </div>
      </div>
    </div>
  );
}