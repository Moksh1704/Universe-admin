import { useState, useEffect } from 'react'
import { Modal } from '../components/Modal'
import { Empty } from '../components/Empty'
import { fmtTime } from '../utils'
import { EVENT_CATEGORIES, CAT_BADGE } from '../constants'
import { createEventApi, deleteEventApi, updateEventApi } from '../services/api'

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Parses FastAPI error detail into a readable string.
 * Handles:
 *   - string:  "Not found"
 *   - array:   [{msg: "field required", loc: [...], ...}, ...]
 *   - object:  {detail: "..."} (fallback)
 */
const parseDetail = d =>
  Array.isArray(d)
    ? d.map(e => e.msg || JSON.stringify(e)).join("; ")
    : typeof d === "string" ? d : JSON.stringify(d);

/**
 * Strips empty strings / undefined / null from an object before sending to the API.
 * Empty string → omitted from request body entirely.
 * This prevents sending time: "" which would fail Pydantic's time validator.
 */
const clean = obj =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== "" && v !== undefined && v !== null)
  );

/**
 * Validates that a date string is in YYYY-MM-DD format.
 * <input type="date"> always produces this format, but guards against
 * any edge-case where the value is pre-populated from the API incorrectly.
 */
const isValidDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s);

// ─── Component ────────────────────────────────────────────────────────────────
export function Events({ events, setEvents, eventsLoading, fetchEvents, normalizeEvent, toast, confirm, addNotif }) {
  const [modal,         setModal]         = useState(false);
  const [creating,      setCreating]      = useState(false);
  const [newEvent,      setNewEvent]      = useState({
    title: "", description: "", date: "", location: "",
    category: "", time: "", formUrl: "",
  });
  const [editing, setEditing] = useState(null);
  const P = v => setNewEvent(p => ({...p, ...v}));

  // ─── Modal Helpers ───────────────────────────────────────────────────────────

  const openAdd = () => {
    setNewEvent({title:"",description:"",date:"",location:"",category:"",time:"",formUrl:""});
    setEditing(null);
    setModal(true);
  };

  const openEdit = e => {
    setNewEvent({
      title:       e.title       || "",
      description: e.description || e.desc  || "",
      date:        e.date        || "",
      location:    e.location    || e.venue || "",   // already normalized, but safe fallback
      category:    e.category    || "",
      time:        e.time        || "",
      formUrl:     e.formUrl     || e.form_url || "",  // handle both forms
    });
    setEditing(e.id);
    setModal(true);
  };

  // ─── Shared Validation ───────────────────────────────────────────────────────

  const validateForm = () => {
    if (!newEvent.title || !newEvent.date) {
      toast("Title and date are required", "error");
      return false;
    }
    if (!newEvent.category) {
      toast("Please select a category", "error");
      return false;
    }
    if (newEvent.date && !isValidDate(newEvent.date)) {
      toast("Invalid date format — please use the date picker", "error");
      return false;
    }
    return true;
  };

  // ─── Builds the payload sent to both create and update routes ───────────────
  // FIX: time is now included. clean() will drop it when empty string,
  //      which is safe because the DB column is now nullable.
  const buildPayload = () => clean({
    title:       newEvent.title,
    description: newEvent.description,
    date:        newEvent.date,
    time:        newEvent.time,       // ← FIX: was missing — caused NOT NULL DB error
    location:    newEvent.location,
    category:    newEvent.category,
    form_url:    newEvent.formUrl,    // snake_case to match CreateEventRequest / UpdateEventRequest
  });

  // ─── Create ──────────────────────────────────────────────────────────────────

  const handleCreateEvent = async () => {
    if (!validateForm()) return;
    setCreating(true);
    try {
      const res = await createEventApi(buildPayload());
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(parseDetail(e.detail) || "Failed to create event");
      }
      toast("Event created successfully");
      addNotif("event", "New Event Created", `${newEvent.title} · Just now`);
      setNewEvent({title:"",description:"",date:"",location:"",category:"",time:"",formUrl:""});
      setModal(false);
      fetchEvents(); // re-sync shared state in App
    } catch(err) {
      console.error("Create error:", err);
      toast(err.message || "Failed to create event", "error");
    } finally {
      setCreating(false);
    }
  };

  // ─── Update ──────────────────────────────────────────────────────────────────

  const saveEdit = async () => {
    if (!validateForm()) return;
    setCreating(true);
    try {
      const res = await updateEventApi(editing, buildPayload());
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(parseDetail(e.detail) || "Failed to update event");
      }
      toast("Event updated successfully");
      setModal(false);
      fetchEvents(); // re-sync shared state in App
    } catch(err) {
      console.error("Edit error:", err);
      toast(err.message || "Failed to update event", "error");
    } finally {
      setCreating(false);
    }
  };

  // ─── Delete ──────────────────────────────────────────────────────────────────

  const del = id => confirm("Delete this event? This cannot be undone.", async () => {
    try {
      const res = await deleteEventApi(id);
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(parseDetail(e.detail) || "Failed to delete event");
      }
      toast("Event deleted", "info");
      fetchEvents(); // re-sync shared state in App
    } catch(err) {
      console.error("Delete error:", err);
      toast(err.message || "Failed to delete event", "error");
    }
  });

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div>
      <div className="page-header f-between" style={{flexWrap:"wrap", gap:10}}>
        <div><p>Create and manage department events.</p></div>
        <button className="btn btn-navy" onClick={openAdd}>
          <i className="fas fa-plus"></i> New Event
        </button>
      </div>

      {eventsLoading
        ? (
          <div style={{textAlign:"center", padding:"56px 20px", color:"var(--text-3)"}}>
            <i className="fas fa-spinner fa-spin" style={{fontSize:28, marginBottom:12, display:"block", color:"var(--border-2)"}}></i>
            Loading events…
          </div>
        )
        : events.length === 0
          ? (
            <Empty
              icon="fa-calendar-days"
              title="No events found"
              desc="Create your first event using the button above."
            />
          )
          : (
            <div className="event-grid">
              {events.map(e => {
                // FIX: append "T00:00:00" so JS parses YYYY-MM-DD as local time,
                //      not UTC — avoids the "day off by one" bug in some timezones.
                const rawDate = e.date || "";
                const d       = rawDate ? new Date(`${rawDate}T00:00:00`) : null;
                const day     = d ? d.getDate() : "—";
                const mon     = d ? d.toLocaleDateString("en", {month:"short"}) : "";
                const cat     = (e.category || "").toLowerCase();
                const badge   = CAT_BADGE[cat] || CAT_BADGE.other;
                // FIX: location is now normalized at fetch time (venue → location).
                //      Safe fallback retained for backward compat with any cached data.
                const loc     = e.location || e.venue || "";
                const desc    = e.description || e.desc || "";
                return (
                  <div key={e.id} className="event-card">
                    <div className="ev-date">
                      <div className="d">{day}</div>
                      <div className="m">{mon}</div>
                    </div>
                    <div className="ev-body">
                      <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8, marginBottom:4}}>
                        <h3 style={{flex:1}}>{e.title}</h3>
                        {cat && (
                          <span className={`badge ${badge.cls}`} style={{flexShrink:0, fontSize:11}}>
                            <i className={`fas ${badge.icon}`}></i>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </span>
                        )}
                      </div>
                      <div className="ev-meta">
                        {e.time && <span><i className="fas fa-clock"></i>{fmtTime(e.time)}</span>}
                        {loc    && <span><i className="fas fa-map-marker-alt"></i>{loc}</span>}
                      </div>
                      {desc && <p className="ev-desc">{desc}</p>}
                      <div className="ev-actions">
                        {e.formUrl && (
                          <a href={e.formUrl} target="_blank" rel="noopener noreferrer" className="register-btn">
                            <i className="fas fa-external-link-alt"></i>Register
                          </a>
                        )}
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(e)}>
                          <i className="fas fa-pen"></i>
                        </button>
                        <button className="btn btn-red btn-sm" onClick={() => del(e.id)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
      }

      <button className="fab" onClick={openAdd}><i className="fas fa-plus"></i></button>

      {modal && (
        <Modal
          title={editing ? "Edit Event" : "New Event"}
          onClose={() => setModal(false)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button
                className="btn btn-navy"
                onClick={editing ? saveEdit : handleCreateEvent}
                disabled={creating}
              >
                {creating
                  ? <><i className="fas fa-spinner fa-spin"></i> Saving…</>
                  : <><i className="fas fa-save"></i> {editing ? "Save Changes" : "Create Event"}</>
                }
              </button>
            </>
          }
        >
          <div className="form-g">
            <label>Event Title *</label>
            <input
              value={newEvent.title}
              onChange={e => P({title: e.target.value})}
              placeholder="Annual TechSurge 2025"
            />
          </div>
          <div className="form-2">
            <div className="form-g">
              <label>Date *</label>
              <input type="date" value={newEvent.date} onChange={e => P({date: e.target.value})}/>
            </div>
            <div className="form-g">
              <label>Time <span style={{fontWeight:400, color:"var(--text-3)"}}>(optional)</span></label>
              <input type="time" value={newEvent.time} onChange={e => P({time: e.target.value})}/>
            </div>
          </div>
          <div className="form-g">
            <label>Location</label>
            <input
              value={newEvent.location}
              onChange={e => P({location: e.target.value})}
              placeholder="Main Auditorium"
            />
          </div>
          <div className="form-g">
            <label>Category *</label>
            <select value={newEvent.category} onChange={e => P({category: e.target.value})}>
              <option value="">— Select category —</option>
              {EVENT_CATEGORIES.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="form-g">
            <label>Description</label>
            <textarea
              value={newEvent.description}
              onChange={e => P({description: e.target.value})}
              placeholder="Brief event description…"
            />
          </div>
          <div className="form-g">
            <label>
              <i className="fab fa-google" style={{marginRight:5, color:"#4285F4"}}></i>
              Google Form Registration URL
            </label>
            <input
              value={newEvent.formUrl}
              onChange={e => P({formUrl: e.target.value})}
              placeholder="https://forms.gle/…"
            />
            <div style={{fontSize:11.5, color:"var(--text-3)", marginTop:5}}>
              "Register" button will redirect students here.
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}