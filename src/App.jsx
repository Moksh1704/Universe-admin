import { useState, useEffect, useCallback } from 'react'

import { useToast }   from './hooks/useToast'
import { useConfirm } from './hooks/useConfirm'

import { Sidebar }    from './components/Sidebar'
import { Topbar }     from './components/Topbar'
import { Toasts }     from './components/Toasts'
import { Confirm }    from './components/Confirm'

import { Login }         from './pages/Login'
import { Dashboard }     from './pages/Dashboard'
import { Users }         from './pages/Users'
import { Attendance }    from './pages/Attendance'
import { Timetable }     from './pages/Timetable'
import { Events }        from './pages/Events'
import { Announcements } from './pages/Announcements'
import { ChatMonitor }   from './pages/ChatMonitor'
import { Profile }       from './pages/Profile'

import { PAGE_TITLES } from './constants'
import { genId }       from './utils'
import {
  fetchStudentsApi,
  fetchFacultyListApi,
  fetchChatApi,
} from './services/api'

export default function App() {
  const [loggedIn,  setLoggedIn]  = useState(false);
  const [page,      setPage]      = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobOpen,   setMobOpen]   = useState(false);

  const { list:toasts, show:toast }                   = useToast();
  const { s:confirmS, ask:confirm, ok:confirmOk, cancel:confirmCancel } = useConfirm();

  /* ── Students & Faculty ── */
  const [students,        setStudents]        = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [faculty,         setFaculty]         = useState([]);
  const [facultyLoading,  setFacultyLoading]  = useState(false);
  const [facultyList,     setFacultyList]     = useState([]);
  const [facultyListLoading, setFacultyListLoading] = useState(true);

  /* ── Fetch faculty list globally on app start ── */
  useEffect(() => {
    fetchFacultyListApi()
      .then(data => {
        console.log("Faculty loaded globally:", data);
        setFacultyList(Array.isArray(data) ? data : []);
      })
      .catch(err  => { console.error("Faculty fetch error:", err); setFacultyList([]); })
      .finally(()  => setFacultyListLoading(false));
  }, []);

  const fetchStudents = useCallback(async (role="student") => {
    if (role === "faculty") {
      setFacultyLoading(true);
      try {
        const data = await fetchStudentsApi("faculty");
        console.log("API DATA (faculty):", data);
        setFaculty(Array.isArray(data) ? data : []);
      } catch(err) {
        console.error("Error fetching faculty:", err);
        setFaculty([]);
      } finally {
        setFacultyLoading(false);
      }
    } else {
      setStudentsLoading(true);
      try {
        const data = await fetchStudentsApi("student");
        console.log("API DATA (students):", data);
        setStudents(Array.isArray(data) ? data : []);
      } catch(err) {
        console.error("Error fetching students:", err);
        setStudents([]);
      } finally {
        setStudentsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchStudents("student");
    fetchStudents("faculty");
  }, [fetchStudents]);

  /* ── Events (kept in App so Dashboard can read count) ── */
  const [events, setEvents] = useState([]);

  /* ── Chat ── */
  const [chat,        setChat]        = useState([]);
  const [chatLoading, setChatLoading] = useState(true);

  useEffect(() => { fetchChat(); }, []);

  const fetchChat = async () => {
    try {
      setChatLoading(true);
      // Confirmed correct admin endpoint — no auth token required
      const data = await fetchChatApi();
      // Store array directly — shape: [{id,user_id,user_name,message,created_at,flagged,flag_reason}]
      const messages = Array.isArray(data) ? data : [];
      console.log("CHAT DATA:", messages);
      setChat(messages);
    } catch(err) {
      console.error("Chat fetch error:", err);
      // Always fall back to [] so ChatMonitor never receives undefined
      setChat([]);
    } finally {
      setChatLoading(false);
    }
  };

  /* ── Notifications ── */
  const [notifs, setNotifs] = useState([
    {id:1, type:"event",        title:"New Event Created",   meta:"Annual TechSurge 2025 · Just now", unread:true},
    {id:3, type:"announcement", title:"Hackathon 36H Added", meta:"May 10 · 3 hours ago",             unread:false},
  ]);

  const markAll = ()         => setNotifs(p => p.map(n => ({...n, unread:false})));
  const markOne = id         => setNotifs(p => p.map(n => n.id === id ? {...n, unread:false} : n));
  const addNotif = (type, title, meta) =>
    setNotifs(p => [{id:genId(), type, title, meta, unread:true}, ...p].slice(0,20));

  const shared = { toast, confirm, addNotif };

  /* ── Render current page ── */
  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard students={students} faculty={faculty} facultyList={facultyList} events={events} setPage={setPage}/>;
      case "users":
        return <Users students={students} setStudents={setStudents} faculty={faculty} setFaculty={setFaculty} fetchStudents={fetchStudents} studentsLoading={studentsLoading} facultyLoading={facultyLoading} {...shared}/>;
      case "attendance":
        return <Attendance {...shared}/>;
      case "timetable":
        return <Timetable faculty={faculty} facultyList={facultyList} facultyListLoading={facultyListLoading} {...shared}/>;
      case "events":
        return <Events {...shared}/>;
      case "announcements":
        return <Announcements {...shared}/>;
      case "chat":
        return <ChatMonitor chat={chat} setChat={setChat} chatLoading={chatLoading} {...shared}/>;
      case "profile":
        return <Profile {...shared}/>;
      default:
        return null;
    }
  };

  /* ── Login gate ── */
  if (!loggedIn) return (
    <>
      <Login onLogin={() => setLoggedIn(true)}/>
      <Toasts list={toasts}/>
    </>
  );

  return (
    <div className="app">
      <Sidebar
        active={page}
        setActive={setPage}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobOpen={mobOpen}
        setMobOpen={setMobOpen}
        onLogout={() => setLoggedIn(false)}
      />
      <div className="main-wrap">
        <Topbar
          pageTitle={PAGE_TITLES[page]}
          onHam={() => setMobOpen(true)}
          notifs={notifs}
          markAll={markAll}
          markOne={markOne}
          setActive={setPage}
          onProfile={() => setPage("profile")}
        />
        <div className="page-scroll">{renderPage()}</div>
      </div>
      <Toasts list={toasts}/>
      <Confirm s={confirmS} ok={confirmOk} cancel={confirmCancel}/>
    </div>
  );
}
