const BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

/* ── Students / Faculty ── */
export const fetchStudentsApi = (role="student") =>
  fetch(`${BASE}/students?role=${role}`).then(r => r.json());

export const updateStudentApi = (id, payload) =>
  fetch(`${BASE}/students/${id}`, {
    method: "PUT",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload),
  });

export const deleteStudentApi = (id) =>
  fetch(`${BASE}/students/${id}`, {method:"DELETE"});

/* ── Faculty List ── */
export const fetchFacultyListApi = () =>
  fetch(`${BASE}/timetable/faculty/faculty-list`).then(r => r.json());

/* ── Attendance ── */
export const fetchAttendanceApi = () =>
  fetch(`${BASE}/attendance/admin/overall-dev`).then(r => r.json());

export const downloadAttendanceCsvApi = (regnum) =>
  fetch(`${BASE}/attendance/download-dev/${regnum}`, {method:"GET"});

/* ── Timetable ── */
export const fetchTimetableApi = (facultyId) =>
  fetch(`${BASE}/timetable/faculty/admin?faculty_id=${facultyId}`).then(r => r.json());

export const createTimetableEntryApi = (payload) =>
  fetch(`${BASE}/timetable/faculty/admin/create`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload),
  });

export const updateTimetableEntryApi = (id, payload) =>
  fetch(`${BASE}/timetable/faculty/${id}`, {
    method: "PUT",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload),
  });

export const deleteTimetableEntryApi = (id) =>
  fetch(`${BASE}/timetable/${id}`, {method:"DELETE"});

/* ── Events ── */
export const fetchEventsApi = () =>
  fetch(`${BASE}/events/admin/list-dev`).then(r => r.json());

export const createEventApi = (payload) =>
  fetch(`${BASE}/events/admin/create`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload),
  });

/* ── Announcements ── */
export const fetchAnnouncementsApi = () =>
  fetch(`${BASE}/announcements/admin/list-dev`).then(r => r.json());

export const createAnnouncementApi = (payload) =>
  fetch(`${BASE}/announcements/admin/create-dev`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload),
  });

export const updateAnnouncementApi = (id, payload) =>
  fetch(`${BASE}/announcements/admin/update-dev/${id}`, {
    method: "PUT",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload),
  });

export const deleteAnnouncementApi = (id) =>
  fetch(`${BASE}/announcements/admin/delete-dev/${id}`, {method:"DELETE"});

/* ── Chat ── */
export const fetchChatApi = () =>
  fetch(`${BASE}/posts/admin/messages-dev`).then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
    return r.json();
  });

export const deleteChatMessageApi = (id) =>
  fetch(`${BASE}/posts/admin/delete-dev/${id}`, {method:"DELETE"});
