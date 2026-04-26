import { useState, useEffect } from 'react'
import { useIsMobile } from '../hooks/useIsMobile'
import { Empty } from '../components/Empty'
import { getAvg, attCls, initials } from '../utils'
import { fetchAttendanceApi, downloadAttendanceCsvApi } from '../services/api'

/* ── Bottom sheet for mobile detail view ── */
function AttDetailSheet({ student, onClose }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
    return () => setMounted(false);
  }, []);
  if (!student) return null;

  const subjects        = student.subjects || {};
  const normalizedSubjs = Object.entries(subjects).map(([subj,val]) => [subj, typeof val === "object" ? val?.percentage??0 : val??0]);
  const avg             = student.avg ?? getAvg(subjects);
  const below75         = normalizedSubjs.filter(([,p]) => p < 75).length;
  const best            = normalizedSubjs.length ? normalizedSubjs.reduce((a,b) => b[1]>a[1]?b:a) : null;
  const lowest          = normalizedSubjs.length ? normalizedSubjs.reduce((a,b) => b[1]<a[1]?b:a) : null;

  return (
    <>
      <div className={`bs-overlay${mounted ? " open" : ""}`} onClick={onClose}/>
      <div className={`bottom-sheet${mounted ? " open" : ""}`}>
        <div className="bs-handle"><div className="bs-handle-bar"/></div>
        <div className="bs-head">
          <h3>Attendance Details</h3>
          <button className="bs-close" onClick={onClose}><i className="fas fa-times"/></button>
        </div>
        <div className="bs-body">
          <div className="bs-student-row">
            <div className="bs-avatar">{initials(student.fullname || student.name || "N/A")}</div>
            <div className="bs-student-info">
              <div className="sname">{student.fullname || student.name || "N/A"}</div>
              <div className="sroll"><i className="fas fa-id-badge" style={{color:"var(--gold)",fontSize:10}}></i> {student.regnum}</div>
            </div>
            <div className={`bs-overall ${attCls(avg)}`}>{avg}%</div>
          </div>
          <div className="bs-stats">
            <div className="bs-stat"><div className="v">{normalizedSubjs.length}</div><div className="k">Subjects</div></div>
            <div className="bs-stat"><div className="v att-low">{below75}</div><div className="k">Below 75%</div></div>
            <div className="bs-stat"><div className="v att-high">{normalizedSubjs.length - below75}</div><div className="k">On Track</div></div>
          </div>
          <div style={{marginBottom:8,fontSize:11.5,fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:".8px"}}>Subject Breakdown</div>
          {normalizedSubjs.map(([subj, pct]) => (
            <div key={subj} className="bs-subj-row">
              <div className="bs-subj-header">
                <span className="bs-subj-name">{subj}</span>
                <span className={`bs-subj-pct ${attCls(pct)}`}>{pct}%</span>
              </div>
              <div className="bs-prog-bar">
                <div className="bs-prog-fill" style={{width:`${pct}%`,background:pct>=75?"var(--green)":pct>=60?"var(--amber)":"var(--red)"}}/>
              </div>
              {pct < 75 && <div className="bs-warn"><i className="fas fa-exclamation-triangle"/>Below 75% — attendance shortage</div>}
            </div>
          ))}
          {best && lowest && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:18}}>
              <div style={{background:"var(--green-bg)",border:"1px solid var(--green-border)",borderRadius:12,padding:"12px 14px"}}>
                <div style={{fontSize:10.5,fontWeight:700,color:"var(--green)",marginBottom:4,textTransform:"uppercase",letterSpacing:".5px"}}><i className="fas fa-arrow-up"></i> Best</div>
                <div style={{fontWeight:800,fontSize:15,color:"var(--navy)"}}>{best[0]}</div>
                <div style={{fontWeight:800,fontSize:20,color:"var(--green)"}}>{best[1]}%</div>
              </div>
              <div style={{background:"var(--red-bg)",border:"1px solid var(--red-border)",borderRadius:12,padding:"12px 14px"}}>
                <div style={{fontSize:10.5,fontWeight:700,color:"var(--red)",marginBottom:4,textTransform:"uppercase",letterSpacing:".5px"}}><i className="fas fa-arrow-down"></i> Lowest</div>
                <div style={{fontWeight:800,fontSize:15,color:"var(--navy)"}}>{lowest[0]}</div>
                <div style={{fontWeight:800,fontSize:20,color:"var(--red)"}}>{lowest[1]}%</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Mobile card for each student ── */
function AttMobileCard({ s }) {
  const [open,  setOpen]  = useState(false);
  const [sheet, setSheet] = useState(false);

  const subjects        = s.subjects || {};
  const normalizedSubjs = Object.entries(subjects).map(([subj,val]) => [subj, typeof val === "object" ? val?.percentage??0 : val??0]);
  const avg             = s.avg ?? getAvg(subjects);
  const below75         = normalizedSubjs.filter(([,p]) => p < 75).length;

  return (
    <>
      <div className="att-mobile-card">
        <div className="att-card-top">
          <div className="att-card-avatar">{initials(s.name||"?")}</div>
          <div className="att-card-info">
            <div className="name">{s.name}</div>
            <div className="roll">
              <i className="fas fa-id-badge" style={{color:"var(--gold)",fontSize:10}}></i>
              {s.regnum}
              <span style={{marginLeft:6,background:"var(--navy-light)",color:"var(--navy-2)",borderRadius:20,padding:"1px 7px",fontSize:10,fontWeight:700,border:"1px solid var(--border)"}}>{s.year}</span>
              {below75 > 0 && <span style={{marginLeft:4,background:"var(--red-bg)",color:"var(--red)",border:"1px solid var(--red-border)",borderRadius:20,padding:"1px 7px",fontSize:10,fontWeight:700}}>{below75} low</span>}
            </div>
          </div>
          <div className="att-card-badge" style={{background:avg>=75?"var(--green-bg)":avg>=60?"var(--amber-bg)":"var(--red-bg)",border:`1px solid ${avg>=75?"var(--green-border)":avg>=60?"var(--amber-border)":"var(--red-border)"}`}}>
            <div className={`pct ${attCls(avg)}`}>{avg}%</div>
            <div className="lbl">Overall</div>
          </div>
        </div>

        <div className="att-strip-row">
          <div className="att-strip-bar">
            <div className="att-strip-fill" style={{width:`${avg}%`,background:avg>=75?"var(--green)":avg>=60?"var(--amber)":"var(--red)"}}/>
          </div>
          <span className="att-strip-label">{avg}%</span>
        </div>

        <button className={`att-toggle-btn${open ? " open" : ""}`} onClick={() => setOpen(!open)}>
          <span className="att-toggle-label">
            <i className="fas fa-chart-bar"/>
            <span className="tb-label">{open ? "Hide Details" : "View Details"}</span>
          </span>
          <i className="fas fa-chevron-down chevron"/>
        </button>

        <div className={`att-detail-panel${open ? " open" : ""}`}>
          <div className="att-detail-inner">
            <div className="att-detail-stats">
              <div className="att-stat-cell"><div className="val">{normalizedSubjs.length}</div><div className="key">Subjects</div></div>
              <div className="att-stat-cell"><div className="val att-low">{below75}</div><div className="key">Below 75%</div></div>
              <div className="att-stat-cell"><div className="val att-high">{normalizedSubjs.length - below75}</div><div className="key">On Track</div></div>
            </div>
            {normalizedSubjs.map(([subj, pct]) => (
              <div key={subj} className="att-subject-row">
                <span className="att-subject-name">{subj}</span>
                <div className="att-progress-wrap">
                  <div className="att-progress-bar">
                    <div className="att-progress-fill" style={{width:open?`${pct}%`:"0%",background:pct>=75?"var(--green)":pct>=60?"var(--amber)":"var(--red)"}}/>
                  </div>
                  {pct < 75 && <div className="att-warn"><i className="fas fa-exclamation-triangle"/>Below threshold</div>}
                </div>
                <span className={`att-subject-pct ${attCls(pct)}`}>{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {sheet && <AttDetailSheet student={s} onClose={() => setSheet(false)}/>}
    </>
  );
}

/* ── Main Attendance page ── */
export function Attendance({ toast }) {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState("");
  const [filterYear,     setFilterYear]     = useState("");
  const isMob = useIsMobile();

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const data = await fetchAttendanceApi();
      console.log("Attendance API:", data);
      setAttendanceData(Array.isArray(data) ? data : []);
    } catch(error) {
      console.error("Error fetching attendance:", error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttendance(); }, []);

  const downloadCSV = async (regnum) => {
    try {
      const response = await downloadAttendanceCsvApi(regnum);
      if (!response.ok) throw new Error("Failed to download CSV");
      const blob = await response.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `attendance_${regnum}.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch(error) { console.error("Download error:", error); }
  };

  const data = attendanceData.filter(s => {
    const q          = (search || "").toLowerCase();
    const matchSearch = !q || (s.name??"").toLowerCase().includes(q) || (s.regnum??"").toLowerCase().includes(q);
    const matchYear   = !filterYear || String(s.year) === filterYear;
    return matchSearch && matchYear;
  });

  const subjs = data.length > 0
    ? Object.keys(data[0]?.subjects || {})
    : (attendanceData[0] ? Object.keys(attendanceData[0].subjects || {}) : []);

  const exportCSV = () => {
    const h    = ["Reg No","Name","Year",...subjs,"Average"];
    const rows = data.map(s => [
      s.regnum, s.name, s.year,
      ...subjs.map(j => { const raw = s.subjects?.[j]; return typeof raw === "object" ? raw?.percentage??0 : raw??0; }),
      s.avg ?? getAvg(s.subjects || {}),
    ]);
    const csv = [h, ...rows].map(r => r.join(",")).join("\n");
    const a   = document.createElement("a");
    a.href     = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "cse_attendance.csv"; a.click();
    toast("Attendance CSV exported");
  };

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"80px 20px",flexDirection:"column",gap:16}}>
      <i className="fas fa-circle-notch fa-spin" style={{fontSize:28,color:"var(--gold)"}}></i>
      <span style={{color:"var(--text-3)",fontWeight:600,fontSize:14}}>Loading attendance data…</span>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <p>Subject-wise attendance for all CSE students.</p>
      </div>
      <div className="att-filter-row">
        <select className="att-filter-select" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
          <option value="">All Years</option>
          <option value="1">1st Year</option>
          <option value="2">2nd Year</option>
          <option value="3">3rd Year</option>
          <option value="4">4th Year</option>
        </select>
      </div>
      <div className="filter-bar">
        <div className="search-row" style={{flex:1,maxWidth:"100%"}}>
          <i className="fas fa-search"></i>
          <input placeholder="Search student…" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <button className="btn btn-gold" onClick={exportCSV}>
          <i className="fas fa-file-csv"></i> Export CSV
        </button>
      </div>
      {(filterYear || search) && (
        <div className="att-results-info">
          <i className="fas fa-filter" style={{marginRight:5,color:"var(--gold)"}}></i>
          {data.length} student{data.length !== 1 ? "s" : ""} found
          {filterYear ? ` · Year ${filterYear}` : ""}
        </div>
      )}

      {data.length === 0
        ? <Empty icon="fa-calendar-check" title="No records found" desc="Try adjusting your filters or check the backend connection"/>
        : isMob
          ? <div className="att-mobile-list">{data.map((s,i) => <AttMobileCard key={s.regnum||i} s={s}/>)}</div>
          : <div className="att-table-wrap"><table>
              <thead><tr>
                <th>Student</th><th>Reg No</th><th>Year</th>
                {subjs.map(s => <th key={s}>{s}</th>)}
                <th>Avg</th><th style={{textAlign:"right"}}>Download</th>
              </tr></thead>
              <tbody>
                {data.map((s, i) => {
                  const avg = s.avg ?? getAvg(s.subjects || {});
                  return (
                    <tr key={s.regnum||i}>
                      <td style={{fontWeight:600}}>{s.name}</td>
                      <td><span className="chip">{s.regnum}</span></td>
                      <td>{s.year}</td>
                      {subjs.map(j => {
                        const raw = s.subjects?.[j];
                        const pct = typeof raw === "object" ? raw?.percentage??0 : raw??0;
                        return <td key={j}><span className={attCls(pct)}>{pct!=null?pct:"—"}{pct!=null?"%":""}</span></td>;
                      })}
                      <td><span className={`fw-7 ${attCls(avg)}`}>{avg}%</span></td>
                      <td style={{textAlign:"right"}}>
                        <button className="btn btn-outline btn-sm" onClick={() => downloadCSV(s.regnum)}>
                          <i className="fas fa-download" style={{marginRight:5}}></i>Download
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table></div>
      }
    </div>
  );
}
