import { useState, useEffect } from 'react'
import { useIsMobile } from '../hooks/useIsMobile'
import { Modal } from '../components/Modal'
import { Empty } from '../components/Empty'
import { initials } from '../utils'
import { updateStudentApi, deleteStudentApi } from '../services/api'

export function Users({ students, setStudents, faculty, setFaculty, fetchStudents, studentsLoading, facultyLoading, toast, confirm }) {
  const [tab,        setTab]        = useState("students");
  const [role,       setRole]       = useState("student");
  const [search,     setSearch]     = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterSec,  setFilterSec]  = useState("");
  const [modal,      setModal]      = useState(null);
  const [form,       setForm]       = useState({});
  const [editing,    setEditing]    = useState(null);
  const isMob = useIsMobile();
  const isS   = tab === "students";
  const P     = v => setForm(p => ({...p, ...v}));

  useEffect(() => { fetchStudents(role); }, [role, fetchStudents]);
  useEffect(() => { console.log("DATA:", isS ? students : faculty); }, [students, faculty, isS]);

  const openEdit = item => {
    const {name, email, role:r, department, year, section, cgpa, regnum} = item;
    setForm({name, email, role:r, department, year, section, cgpa, regnum});
    setEditing(item.id || item._id);
    setModal("open");
  };
  const close = () => { setModal(null); setForm({}); setEditing(null); };

  const saveS = async () => {
    if (!form.name) { toast("Name is required","error"); return; }
    if (!editing)   { toast("No record selected for editing","error"); return; }
    try {
      const payload = {name:form.name, section:form.section??null, year:form.year??null, department:form.department??null, cgpa:form.cgpa!=null&&form.cgpa!==""?+form.cgpa:null};
      await updateStudentApi(editing, payload);
      toast("Student updated");
      fetchStudents("student");
    } catch(err) { console.error(err); toast("Failed to update student","error"); }
    close();
  };

  const saveF = async () => {
    if (!form.name) { toast("Name is required","error"); return; }
    if (!editing)   { toast("No record selected for editing","error"); return; }
    try {
      const payload = {name:form.name, section:form.section??null, year:form.year??null, department:form.department??null};
      await updateStudentApi(editing, payload);
      toast("Faculty updated");
      fetchStudents("faculty");
    } catch(err) { console.error(err); toast("Failed to update faculty","error"); }
    close();
  };

  const delS = id => confirm("Delete this student permanently?", async () => {
    try {
      await deleteStudentApi(id);
      fetchStudents("student");
      toast("Student deleted","info");
    } catch(err) { console.error(err); toast("Failed to delete student","error"); }
  });

  const delF = id => confirm("Delete this faculty member permanently?", async () => {
    try {
      await deleteStudentApi(id);
      fetchStudents("faculty");
      toast("Faculty deleted","info");
    } catch(err) { console.error(err); toast("Failed to delete faculty","error"); }
  });

  const fs = students.filter(s => {
    const q = search.toLowerCase();
    return (
      ((s.name??"").toLowerCase().includes(q) || (s.regnum??s.roll_no??"").toLowerCase().includes(q)) &&
      (!filterYear || s.year == filterYear) &&
      (!filterSec  || s.section === filterSec)
    );
  });

  const ff = (Array.isArray(faculty) ? faculty : []).filter(f => {
    const q = search.toLowerCase();
    return (f.name??"").toLowerCase().includes(q) || (f.email??"").toLowerCase().includes(q);
  });

  const sections = [...new Set(students.map(u => u.section).filter(Boolean))].sort();

  return (
    <div>
      <div className="page-header">
        <p>Manage CSE department students and faculty members.</p>
      </div>

      <div className="f-between mb-16" style={{flexWrap:"wrap",gap:10}}>
        <div className="tab-bar" style={{marginBottom:0}}>
          <button className={`tab-btn${isS ? " active" : ""}`} onClick={() => { setTab("students"); setRole("student"); setSearch(""); setFilterYear(""); setFilterSec(""); }}>
            <i className="fas fa-user-graduate" style={{marginRight:6}}></i>
            Students ({(Array.isArray(students)?students:[]).length})
          </button>
          <button className={`tab-btn${!isS ? " active" : ""}`} onClick={() => { setTab("faculty"); setRole("faculty"); setSearch(""); }}>
            <i className="fas fa-chalkboard-teacher" style={{marginRight:6}}></i>
            Faculty ({(Array.isArray(faculty)?faculty:[]).length})
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-row">
          <i className="fas fa-search"></i>
          <input placeholder={`Search ${isS ? "students" : "faculty"}…`} value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        {isS && <>
          <select style={{width:120}} value={filterYear} onChange={e => setFilterYear(e.target.value)}>
            <option value="">All Years</option>
            {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
          </select>
          <select style={{width:120}} value={filterSec} onChange={e => setFilterSec(e.target.value)}>
            <option value="">All Sections</option>
            {sections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
          </select>
        </>}
      </div>

      {(isS ? studentsLoading : facultyLoading)
        ? <div style={{padding:"32px 0",textAlign:"center",color:"var(--text-3)",fontSize:14}}>
            <i className="fas fa-spinner fa-spin" style={{marginRight:8}}></i>
            Loading {isS ? "students" : "faculty"}…
          </div>
        : isMob
          ? (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {isS
                ? (fs.length === 0
                  ? <Empty icon="fa-user-graduate" title="No students found"/>
                  : fs.map(s => (
                    <div key={s.id||s.regnum} className="user-card" style={{flexDirection:"column"}}>
                      <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                        <div className="user-avatar" style={{background:"var(--navy)"}}>{initials(s.name??"?")}</div>
                        <div className="user-info">
                          <div className="user-name">{s.name??"—"}</div>
                          <div className="user-meta">{s.email??"—"}</div>
                          <div className="user-badges">
                            {(s.regnum||s.roll_no)&&<span className="chip">{s.regnum??s.roll_no}</span>}
                            {s.section&&<span className="badge badge-blue">Sec {s.section}</span>}
                            {s.year&&<span className="badge badge-gray">Yr {s.year}</span>}
                            {s.cgpa!=null&&s.cgpa!==""&&<span className="badge badge-gold">CGPA {s.cgpa}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="user-actions">
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(s)}><i className="fas fa-pen"></i> Edit</button>
                      </div>
                    </div>
                  ))
                )
                : (ff.length === 0
                  ? <Empty icon="fa-chalkboard-teacher" title="No faculty found"/>
                  : ff.map(f => (
                    <div key={f.id||f.email} className="user-card" style={{flexDirection:"column"}}>
                      <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                        <div className="user-avatar" style={{background:"var(--navy-2)"}}>{initials(f.name||"?")}</div>
                        <div className="user-info">
                          <div className="user-name">{f.name||"—"}</div>
                          <div className="user-meta">{f.email||"—"}</div>
                          <div className="user-badges">
                            {f.designation&&<span className="badge badge-gold">{f.designation}</span>}
                            {f.experience&&<span className="badge badge-gray">{f.experience}</span>}
                          </div>
                          {f.subjects&&<div style={{fontSize:12,color:"var(--text-3)",marginTop:4}}>{f.subjects}</div>}
                        </div>
                      </div>
                      <div className="user-actions">
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(f)}><i className="fas fa-pen"></i> Edit</button>
                      </div>
                    </div>
                  ))
                )
              }
            </div>
          )
          : (
            isS
              ? (fs.length === 0
                ? <Empty icon="fa-user-graduate" title="No students found"/>
                : <div className="table-wrap"><table>
                    <thead><tr>
                      <th>Student</th><th>Reg No</th><th>Section</th><th>Year</th><th>CGPA</th>
                      <th style={{textAlign:"right"}}>Actions</th>
                    </tr></thead>
                    <tbody>
                      {fs.map(s => (
                        <tr key={s.id||s.regnum}>
                          <td>
                            <div style={{display:"flex",alignItems:"center",gap:10}}>
                              <div style={{width:32,height:32,borderRadius:9,background:"var(--navy)",color:"var(--gold-2)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:11,flexShrink:0}}>{initials(s.name??"?")}</div>
                              <div>
                                <div style={{fontWeight:600}}>{s.name??"—"}</div>
                                <div style={{fontSize:12,color:"var(--text-3)"}}>{s.email??"—"}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className="chip">{s.regnum??s.roll_no??"—"}</span></td>
                          <td>{s.section?<span className="badge badge-blue">Sec {s.section}</span>:<span style={{color:"var(--text-3)"}}>—</span>}</td>
                          <td>{s.year??"—"}</td>
                          <td><strong>{s.cgpa!=null&&s.cgpa!==""?s.cgpa:"—"}</strong></td>
                          <td style={{textAlign:"right"}}>
                            <button className="btn btn-outline btn-sm" onClick={() => openEdit(s)}><i className="fas fa-pen"></i></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
              )
              : (ff.length === 0
                ? <Empty icon="fa-chalkboard-teacher" title="No faculty found"/>
                : <div className="table-wrap"><table>
                    <thead><tr>
                      <th>Faculty</th><th>Designation</th><th>Subjects</th><th>Experience</th>
                      <th style={{textAlign:"right"}}>Actions</th>
                    </tr></thead>
                    <tbody>
                      {ff.map(f => (
                        <tr key={f.id||f.email}>
                          <td>
                            <div style={{display:"flex",alignItems:"center",gap:10}}>
                              <div style={{width:32,height:32,borderRadius:9,background:"var(--navy-2)",color:"var(--gold-2)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:11,flexShrink:0}}>{initials(f.name||"?")}</div>
                              <div>
                                <div style={{fontWeight:600}}>{f.name||"—"}</div>
                                <div style={{fontSize:12,color:"var(--text-3)"}}>{f.email||"—"}</div>
                              </div>
                            </div>
                          </td>
                          <td>{f.designation?<span className="badge badge-gold">{f.designation}</span>:<span style={{color:"var(--text-3)"}}>—</span>}</td>
                          <td style={{color:"var(--text-2)"}}>{f.subjects||"—"}</td>
                          <td>{f.experience||"—"}</td>
                          <td style={{textAlign:"right"}}>
                            <button className="btn btn-outline btn-sm" onClick={() => openEdit(f)}><i className="fas fa-pen"></i></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
              )
          )
      }

      {modal && (
        <Modal
          title={`Edit ${isS ? "Student" : "Faculty"}`}
          onClose={close}
          footer={
            <>
              <button className="btn btn-outline" onClick={close}>Cancel</button>
              <button className="btn btn-navy" onClick={isS ? saveS : saveF}>
                <i className="fas fa-save"></i> Save
              </button>
            </>
          }
        >
          {isS
            ? <div>
                <div className="form-g"><label>Full Name</label><input value={form.name||""} onChange={e=>P({name:e.target.value})} placeholder="Student name"/></div>
                <div className="form-g"><label>Department</label><input value={form.department||""} onChange={e=>P({department:e.target.value})} placeholder="CSE"/></div>
                <div className="form-2">
                  <div className="form-g"><label>Year</label>
                    <select value={form.year||""} onChange={e=>P({year:+e.target.value})}>
                      <option value="">—</option>{[1,2,3,4].map(y=><option key={y} value={y}>Year {y}</option>)}
                    </select>
                  </div>
                  <div className="form-g"><label>Section</label><input value={form.section||""} onChange={e=>P({section:e.target.value})} placeholder="e.g. CSE 01"/></div>
                </div>
                <div className="form-g"><label>CGPA</label><input type="number" step="0.01" min="0" max="10" value={form.cgpa||""} onChange={e=>P({cgpa:e.target.value})} placeholder="e.g. 8.5"/></div>
              </div>
            : <div>
                <div className="form-g"><label>Full Name</label><input value={form.name||""} onChange={e=>P({name:e.target.value})} placeholder="Faculty name"/></div>
                <div className="form-g"><label>Department</label><input value={form.department||""} onChange={e=>P({department:e.target.value})} placeholder="CSE"/></div>
                <div className="form-2">
                  <div className="form-g"><label>Year</label>
                    <select value={form.year||""} onChange={e=>P({year:+e.target.value})}>
                      <option value="">—</option>{[1,2,3,4].map(y=><option key={y} value={y}>Year {y}</option>)}
                    </select>
                  </div>
                  <div className="form-g"><label>Section</label><input value={form.section||""} onChange={e=>P({section:e.target.value})} placeholder="e.g. CSE 01"/></div>
                </div>
              </div>
          }
        </Modal>
      )}
    </div>
  );
}
