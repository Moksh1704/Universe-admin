export const INIT_FACULTY = [
  {id:1,name:"Dr. Ramesh Babu",   email:"ramesh@cse.edu",  designation:"Professor",      subjects:"DBMS, OS",   experience:"12 yrs",phone:"9000000001"},
  {id:2,name:"Prof. Anita Sharma",email:"anita@cse.edu",   designation:"Assoc. Prof.",   subjects:"CN, SE",     experience:"8 yrs", phone:"9000000002"},
  {id:3,name:"Dr. Venkat Rao",    email:"venkat@cse.edu",  designation:"HOD / Professor",subjects:"ML, AI",     experience:"18 yrs",phone:"9000000003"},
  {id:4,name:"Prof. Meera Pillai",email:"meera@cse.edu",   designation:"Asst. Prof.",    subjects:"Maths, TOC", experience:"5 yrs", phone:"9000000004"},
];

export const INIT_ANNOUNCEMENTS = [
  {id:1,title:"Mid-semester Schedule Released",content:"Mid-semester exams from 20–28 April. Check student portal for individual timetables.",date:"2025-04-10"},
  {id:2,title:"Library Extended Hours",        content:"Library open till 11 PM during examination week. Carry valid college ID.",date:"2025-04-11"},
  {id:3,title:"New Elective Registration Open",content:"Register for electives via the academic portal. Deadline: 22 April.",date:"2025-04-12"},
];

export const DAYS  = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
export const SLOTS = ["8:00–9:00","9:00–10:00","10:00–11:00","11:00–12:00","2:00–3:00","3:00–4:00"];

export const NAV = [
  {id:"dashboard",    label:"Dashboard",       icon:"fa-th-large",      sec:"Overview"},
  {id:"users",        label:"User Management", icon:"fa-users",         sec:"Academic"},
  {id:"attendance",   label:"Attendance",      icon:"fa-calendar-check",sec:"Academic"},
  {id:"timetable",    label:"Timetable",       icon:"fa-clock",         sec:"Academic"},
  {id:"events",       label:"Events",          icon:"fa-calendar-days", sec:"Communication"},
  {id:"announcements",label:"Announcements",   icon:"fa-bullhorn",      sec:"Communication"},
  {id:"chat",         label:"Chat Monitor",    icon:"fa-comments",      sec:"Community"},
  {id:"profile",      label:"Profile",         icon:"fa-user-circle",   sec:"Account"},
];

export const PAGE_TITLES = {
  dashboard:     "Dashboard",
  users:         "User Management",
  attendance:    "Attendance Reports",
  timetable:     "Timetable Management",
  events:        "Events Management",
  announcements: "Announcements",
  chat:          "Chat Monitor",
  profile:       "Profile",
};

export const EVENT_CATEGORIES = ["technical","cultural","sports","workshop","other"];

export const CAT_BADGE = {
  technical:{cls:"badge-blue",   icon:"fa-microchip"},
  cultural: {cls:"badge-purple", icon:"fa-masks-theater"},
  sports:   {cls:"badge-green",  icon:"fa-trophy"},
  workshop: {cls:"badge-amber",  icon:"fa-tools"},
  other:    {cls:"badge-gray",   icon:"fa-calendar"},
};
