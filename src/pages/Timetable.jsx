import { useState, useEffect } from 'react'
import { useIsMobile } from '../hooks/useIsMobile'
import {
  fetchTimetableApi,
  createTimetableEntryApi,
  updateTimetableEntryApi,
  deleteTimetableEntryApi,
} from '../services/api'

export function Timetable({ faculty, toast, confirm, facultyList, facultyListLoading }) {
  const [timetable,       setTimetable]       = useState([]);
  const [loading,         setLoading]         = useState(false);
  const [openDay,         setOpenDay]         = useState("Monday");
  const [showModal,       setShowModal]       = useState(false);
  const [formData,        setFormData]        = useState({faculty_id:"",day:"",time_slot:"",subject:"",section:"",year:""});
  const [isEdit,          setIsEdit]          = useState(false);
  const [saving,          setSaving]          = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const isMob = useIsMobile();

  const days      = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const timeSlots = ["9:00 - 10:40","10:40 - 12:20","1:30 - 3:10"];

  const fetchTimetable = () => {
    if (!selectedFaculty) return;
    setLoading(true);
    fetchTimetableApi(selectedFaculty)
      .then(data => { console.log("Timetable:", data); setTimetable(Array.isArray(data) ? data : []); })
      .catch(err  => { console.error(err); setTimetable([]); })
      .finally(()  => setLoading(false));
  };

  useEffect(() => { if (selectedFaculty) fetchTimetable(); }, [selectedFaculty]);

  /* ── Build grid + grouped maps ── */
  const grid = {};
  timetable.forEach(item => {
    const day  = item.day?.trim();
    const time = item.time_slot?.trim();
    if (!grid[time]) grid[time] = {};
    grid[time][day] = item;
  });

  const grouped = {};
  timetable.forEach(item => { const day = item.day?.trim(); if (!grouped[day]) grouped[day] = []; grouped[day].push(item); });
  const byDay = days.reduce((acc, d) => { acc[d] = grouped[d] || []; return acc; }, {});
  days.forEach(d => { byDay[d].sort((a,b) => timeSlots.indexOf(a?.time_slot) - timeSlots.indexOf(b?.time_slot)); });
  const dayCount = day => (byDay[day] || []).length;

  const handleAdd = (day, time) => {
    setIsEdit(false);
    setFormData({faculty_id:selectedFaculty, day:day||"", time_slot:time||"", subject:"", section:"", year:""});
    setShowModal(true);
  };

  const handleEdit = (entry) => {
    setIsEdit(true);
    setFormData({id:entry.id, faculty_id:entry.faculty_id||selectedFaculty, day:entry.day||"", time_slot:entry.time_slot||"", subject:entry.subject||"", section:entry.section||"", year:entry.year||""});
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setIsEdit(false); setFormData({faculty_id:"",day:"",time_slot:"",subject:"",section:"",year:""}); };
  const F = patch => setFormData(p => ({...p, ...patch}));

  const handleCreate = async () => {
    if (!formData.subject.trim()) { toast("Subject is required","error"); return; }
    setSaving(true);
    try {
      const res = await createTimetableEntryApi({...formData, faculty_id:Number(selectedFaculty)});
      if (!res.ok) throw new Error(`Create failed: ${res.status}`);
      toast("Entry added","success");
      closeModal();
      fetchTimetable();
    } catch(err) { console.error(err); toast("Failed to add entry","error"); }
    finally { setSaving(false); }
  };

  const handleUpdate = async () => {
    if (!formData.subject.trim()) { toast("Subject is required","error"); return; }
    setSaving(true);
    try {
      const res = await updateTimetableEntryApi(formData.id, {...formData, faculty_id:Number(selectedFaculty)});
      if (!res.ok) throw new Error(`Update failed: ${res.status}`);
      toast("Entry updated","success");
      closeModal();
      fetchTimetable();
    } catch(err) { console.error(err); toast("Failed to update entry","error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    const go = await confirm("Delete this timetable entry?", "This cannot be undone.");
    if (!go) return;
    try {
      const res = await deleteTimetableEntryApi(id);
      if (!res.ok) throw new Error("Delete failed");
      toast("Entry deleted","success");
      fetchTimetable();
    } catch(err) { console.error(err); toast("Delete failed","error"); }
  };

  const selectedFacultyName = facultyList.find(f => f.faculty_id === Number(selectedFaculty))?.name || "";
  const readonlyStyle = {background:"var(--surface-2)",color:"var(--text-3)",cursor:"default",border:"1.5px solid var(--border)"};

  return (
    <div>
      <div className="page-header">
        <p>Faculty class schedules — select a faculty member to view or edit.</p>
      </div>

      {/* Faculty selector */}
      <div className="card" style={{marginBottom:20,padding:"16px 20px"}}>
        <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
            <i className="fas fa-chalkboard-teacher" style={{color:"var(--gold)",fontSize:15}}></i>
            <span style={{fontWeight:700,fontSize:13.5,color:"var(--navy)"}}>Select Faculty</span>
          </div>
          <div style={{flex:1,minWidth:200,maxWidth:380}}>
            {facultyListLoading
              ? <div style={{fontSize:13,color:"var(--text-3)"}}><i className="fas fa-spinner fa-spin"></i> Loading faculty…</div>
              : <select
                  className="att-filter-select"
                  value={selectedFaculty}
                  onChange={e => setSelectedFaculty(e.target.value ? Number(e.target.value) : "")}
                  style={{width:"100%"}}
                >
                  <option value="">— Choose a faculty member —</option>
                  {facultyList.map(f => <option key={f.faculty_id} value={f.faculty_id}>{f.name}{f.email?` (${f.email})`:""}</option>)}
                </select>
            }
          </div>
          {selectedFaculty && <span className="badge badge-gold"><i className="fas fa-user"></i> {selectedFacultyName}</span>}
        </div>
      </div>

      {/* No faculty selected */}
      {!selectedFaculty && (
        <div style={{textAlign:"center",padding:"48px 20px",background:"var(--surface)",borderRadius:"var(--r-xl)",border:"1px solid var(--border)",boxShadow:"var(--sh)"}}>
          <div style={{width:64,height:64,borderRadius:"50%",background:"var(--gold-pale)",border:"1px solid var(--gold-border)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:24,color:"var(--gold)"}}><i className="fas fa-chalkboard-teacher"></i></div>
          <div style={{fontWeight:800,fontSize:16,color:"var(--navy)",marginBottom:6}}>No Faculty Selected</div>
          <div style={{fontSize:13,color:"var(--text-3)",lineHeight:1.6}}>Please select a faculty member above to view their timetable.</div>
        </div>
      )}

      {/* Loading */}
      {selectedFaculty && loading && (
        <div style={{textAlign:"center",padding:"64px 20px",background:"var(--surface)",borderRadius:"var(--r-xl)",border:"1px solid var(--border)",boxShadow:"var(--sh)"}}>
          <div style={{width:52,height:52,borderRadius:"50%",background:"var(--gold-pale)",border:"1px solid var(--gold-border)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",fontSize:22,color:"var(--gold)"}}><i className="fas fa-spinner fa-spin"></i></div>
          <div style={{fontWeight:700,fontSize:15,color:"var(--navy)"}}>Loading timetable…</div>
        </div>
      )}

      {/* Empty state */}
      {selectedFaculty && !loading && (!Array.isArray(timetable) || timetable.length === 0) && (
        <div style={{textAlign:"center",padding:"48px 20px",background:"var(--surface)",borderRadius:"var(--r-xl)",border:"1px solid var(--border)",boxShadow:"var(--sh)"}}>
          <div style={{width:64,height:64,borderRadius:"50%",background:"var(--gold-pale)",border:"1px solid var(--gold-border)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:24,color:"var(--gold)"}}><i className="fas fa-calendar-times"></i></div>
          <div style={{fontWeight:800,fontSize:16,color:"var(--navy)",marginBottom:6}}>No Timetable Data</div>
          <div style={{fontSize:13,color:"var(--text-3)",lineHeight:1.6}}>No entries found for this faculty member.<br/>Click any <strong>+</strong> cell in the grid to add a class.</div>
          <button className="btn btn-navy" style={{marginTop:18}} onClick={fetchTimetable}><i className="fas fa-sync-alt"></i> Retry</button>
        </div>
      )}

      {/* Timetable grid */}
      {selectedFaculty && !loading && Array.isArray(timetable) && (
        isMob
          ? /* Mobile: day-wise expandable cards */
            <div>
              {days.map(day => {
                const isOpen = openDay === day;
                const count  = dayCount(day);
                return (
                  <div key={day} className="tt-day-card">
                    <div className={`tt-day-header${isOpen?" open":""}`} onClick={() => setOpenDay(isOpen ? null : day)}>
                      <span className="dh-name">{day}</span>
                      <div className="dh-right">
                        <span className="dh-count">{count} class{count !== 1 ? "es" : ""}</span>
                        <i className="fas fa-chevron-down dh-chevron"></i>
                      </div>
                    </div>
                    {isOpen && (
                      <div className="tt-slots">
                        {timeSlots.map(time => {
                          const e = grid[time]?.[day];
                          return (
                            <div key={time} className="tt-slot-row">
                              <span className="tt-slot-time">{time}</span>
                              {e
                                ? <>
                                    <div className="tt-slot-content" onClick={() => handleEdit(e)} title="Click to edit">
                                      <div className="tt-slot-subject">{e.subject||"—"}</div>
                                      <div className="tt-slot-section">{e.section||""}{e.year?` · Yr ${e.year}`:""}</div>
                                    </div>
                                    <button style={{background:"none",border:"none",cursor:"pointer",color:"var(--red)",fontSize:13,padding:"4px 6px",borderRadius:6,flexShrink:0}} onClick={() => handleDelete(e.id)} title="Delete"><i className="fas fa-trash"></i></button>
                                  </>
                                : <button className="tt-slot-add" onClick={() => handleAdd(day,time)} title="Click to add a class here"><i className="fas fa-plus"></i> Add</button>
                              }
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          : /* Desktop: calendar grid */
            <div className="card" style={{padding:0}}>
              <div style={{overflowX:"auto",borderRadius:"var(--r-lg)"}}>
                <table className="tt-table">
                  <thead><tr>
                    <th style={{minWidth:120,textAlign:"left"}}>Time Slot</th>
                    {days.map(d => <th key={d} style={{minWidth:130,textAlign:"center"}}>{d}</th>)}
                  </tr></thead>
                  <tbody>
                    {timeSlots.map(time => (
                      <tr key={time}>
                        <td className="tt-time-cell" style={{fontWeight:700,color:"var(--navy)",whiteSpace:"nowrap"}}>{time}</td>
                        {days.map(day => {
                          const entry = grid[time]?.[day];
                          return (
                            <td key={day} style={{padding:6,verticalAlign:"top"}}>
                              {entry
                                ? <div className="tt-cell" style={{position:"relative",paddingBottom:28,cursor:"pointer"}} onClick={() => handleEdit(entry)} title="Click to edit">
                                    <div className="tc-sub">{entry.subject||"—"}</div>
                                    <div className="tc-sec">{entry.section||""}{entry.year?` · Yr ${entry.year}`:""}</div>
                                    <div style={{position:"absolute",bottom:6,right:6,display:"flex",gap:4}}>
                                      <button onClick={e=>{e.stopPropagation();handleEdit(entry);}} style={{background:"rgba(255,255,255,.15)",border:"none",cursor:"pointer",color:"#fff",fontSize:11,padding:"2px 7px",borderRadius:5,fontFamily:"var(--font)",fontWeight:600}} title="Edit"><i className="fas fa-pen"></i></button>
                                      <button onClick={e=>{e.stopPropagation();handleDelete(entry.id);}} style={{background:"rgba(220,38,38,.25)",border:"none",cursor:"pointer",color:"#fca5a5",fontSize:11,padding:"2px 7px",borderRadius:5,fontFamily:"var(--font)",fontWeight:600}} title="Delete"><i className="fas fa-trash"></i></button>
                                    </div>
                                  </div>
                                : <button className="tt-add-btn" onClick={() => handleAdd(day,time)} title="Click to add a class here"><i className="fas fa-plus"></i></button>
                              }
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal">
            <div className="modal-head">
              <h3>{isEdit ? "Edit Timetable Entry" : "Add Timetable Entry"}</h3>
              <button className="modal-x" onClick={closeModal}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
              <div className="form-2">
                <div className="form-g">
                  <label>Day</label>
                  {isEdit
                    ? <input value={formData.day} readOnly style={readonlyStyle}/>
                    : <select value={formData.day} onChange={e => F({day:e.target.value})}>
                        <option value="">Select day</option>
                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                  }
                </div>
                <div className="form-g">
                  <label>Time Slot</label>
                  {isEdit
                    ? <input value={formData.time_slot} readOnly style={readonlyStyle}/>
                    : <select value={formData.time_slot} onChange={e => F({time_slot:e.target.value})}>
                        <option value="">Select time slot</option>
                        {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                  }
                </div>
              </div>
              <div className="form-g">
                <label>Subject <span style={{color:"var(--red)"}}>*</span></label>
                <input value={formData.subject} onChange={e => F({subject:e.target.value})} placeholder="e.g. Data Structures" autoFocus/>
              </div>
              <div className="form-2">
                <div className="form-g">
                  <label>Section</label>
                  <input value={formData.section} onChange={e => F({section:e.target.value})} placeholder="e.g. CSE-A"/>
                </div>
                <div className="form-g">
                  <label>Year</label>
                  <select value={formData.year} onChange={e => F({year:e.target.value})}>
                    <option value="">— Year —</option>
                    {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-outline" onClick={closeModal} disabled={saving}>Cancel</button>
              <button className="btn btn-navy" onClick={isEdit ? handleUpdate : handleCreate} disabled={saving}>
                {saving
                  ? <><i className="fas fa-spinner fa-spin"></i> Saving…</>
                  : <><i className={`fas ${isEdit ? "fa-save" : "fa-plus"}`}></i> {isEdit ? "Update" : "Add Entry"}</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
