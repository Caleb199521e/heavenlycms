import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { authAPI, membersAPI, visitorsAPI, servicesAPI, attendanceAPI, reportsAPI } from "../services/api";

// ─── Theme & Fonts ────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Lora:wght@500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --blue-50: #EFF6FF; --blue-100: #DBEAFE; --blue-200: #BFDBFE;
      --blue-500: #3B82F6; --blue-600: #2563EB; --blue-700: #1D4ED8;
      --blue-800: #1E40AF; --blue-900: #1E3A8A;
      --slate-50: #F8FAFC; --slate-100: #F1F5F9; --slate-200: #E2E8F0;
      --slate-300: #CBD5E1; --slate-400: #94A3B8; --slate-500: #64748B;
      --slate-600: #475569; --slate-700: #334155; --slate-800: #1E293B; --slate-900: #0F172A;
      --green-50: #F0FDF4; --green-500: #22C55E; --green-600: #16A34A; --green-700: #15803D;
      --amber-50: #FFFBEB; --amber-500: #F59E0B; --amber-600: #D97706;
      --red-50: #FEF2F2; --red-500: #EF4444; --red-600: #DC2626;
      --purple-50: #FAF5FF; --purple-500: #A855F7; --purple-600: #9333EA;
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
      --shadow-md: 0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
      --shadow-lg: 0 10px 30px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.06);
    }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--slate-50); color: var(--slate-800); }
    * { transition: background-color 0.15s ease, border-color 0.15s ease; }
    input, select, textarea {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 14px;
      width: 100%;
      padding: 9px 12px;
      border: 1.5px solid var(--slate-200);
      border-radius: 8px;
      background: white;
      color: var(--slate-800);
      outline: none;
    }
    input:focus, select:focus, textarea:focus {
      border-color: var(--blue-500);
      box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
    }
    input::placeholder { color: var(--slate-400); }
    button { font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; border: none; }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--slate-300); border-radius: 99px; }
    .animate-fade { animation: fadeIn 0.25s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    .animate-slide { animation: slideIn 0.3s cubic-bezier(.16,1,.3,1); }
    @keyframes slideIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
    .stat-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
    .row-hover:hover { background: var(--blue-50); }
    .nav-item { transition: all 0.15s ease; }
    .btn-primary {
      background: var(--blue-600); color: white; padding: 9px 18px;
      border-radius: 8px; font-size: 14px; font-weight: 600;
      display: inline-flex; align-items: center; gap: 6px;
      box-shadow: var(--shadow-sm);
    }
    .btn-primary:hover { background: var(--blue-700); }
    .btn-primary:active { transform: scale(0.98); }
    .btn-secondary {
      background: white; color: var(--slate-700); padding: 9px 18px;
      border-radius: 8px; font-size: 14px; font-weight: 500;
      border: 1.5px solid var(--slate-200); display: inline-flex; align-items: center; gap: 6px;
    }
    .btn-secondary:hover { background: var(--slate-50); border-color: var(--slate-300); }
    .btn-danger {
      background: var(--red-50); color: var(--red-600); padding: 9px 18px;
      border-radius: 8px; font-size: 14px; font-weight: 500;
      border: 1.5px solid #FECACA;
    }
    .btn-danger:hover { background: #FEE2E2; }
    .badge {
      display: inline-flex; align-items: center; padding: 3px 10px;
      border-radius: 99px; font-size: 12px; font-weight: 600;
    }
    .badge-blue { background: var(--blue-100); color: var(--blue-700); }
    .badge-green { background: var(--green-50); color: var(--green-700); }
    .badge-amber { background: var(--amber-50); color: var(--amber-600); }
    .badge-red { background: var(--red-50); color: var(--red-600); }
    .badge-purple { background: var(--purple-50); color: var(--purple-600); }
    .badge-slate { background: var(--slate-100); color: var(--slate-600); }
    .card { background: white; border-radius: 14px; box-shadow: var(--shadow-sm); border: 1px solid var(--slate-100); }
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(15,23,42,0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 100; padding: 16px;
      backdrop-filter: blur(3px);
      animation: fadeOverlay 0.2s ease;
    }
    @keyframes fadeOverlay { from { opacity: 0; } to { opacity: 1; } }
    .modal-box {
      background: white; border-radius: 16px; box-shadow: var(--shadow-lg);
      width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto;
      animation: slideModal 0.25s cubic-bezier(.16,1,.3,1);
    }
    @keyframes slideModal { from { opacity:0; transform:scale(0.95) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
    .sidebar-item {
      display: flex; align-items: center; gap: 10px; padding: 10px 14px;
      border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 500;
      color: var(--slate-500); text-decoration: none; transition: all 0.15s;
    }
    .sidebar-item:hover { background: var(--blue-50); color: var(--blue-700); }
    .sidebar-item.active { background: var(--blue-600); color: white; box-shadow: var(--shadow-sm); }
    .sidebar-item .icon { width: 18px; height: 18px; flex-shrink: 0; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase;
         letter-spacing: 0.08em; color: var(--slate-400); padding: 12px 16px; border-bottom: 1px solid var(--slate-100); }
    td { padding: 12px 16px; font-size: 14px; color: var(--slate-700); border-bottom: 1px solid var(--slate-50); vertical-align: middle; }
    .search-bar { position: relative; }
    .search-bar input { padding-left: 38px; }
    .search-bar .icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--slate-400); }
    .form-label { font-size: 13px; font-weight: 600; color: var(--slate-600); margin-bottom: 5px; display: block; }
    .form-group { margin-bottom: 16px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    @media (max-width: 640px) { .form-row { grid-template-columns: 1fr; } }
    .toast {
      position: fixed; bottom: 24px; right: 24px; z-index: 999;
      background: var(--slate-800); color: white; padding: 12px 18px;
      border-radius: 10px; font-size: 14px; font-weight: 500;
      box-shadow: var(--shadow-lg); display: flex; align-items: center; gap: 8px;
      animation: toastIn 0.3s cubic-bezier(.16,1,.3,1);
    }
    @keyframes toastIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    .toast.success { background: var(--green-700); }
    .toast.error { background: var(--red-600); }
    .chart-bar { transition: height 0.6s cubic-bezier(.16,1,.3,1), opacity 0.3s; }
    @media (max-width: 768px) {
      .hide-mobile { display: none !important; }
      .form-row { grid-template-columns: 1fr; }
    }
  `}</style>
);

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18, color = "currentColor", style = {} }) => {
  const icons = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    members: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    visitors: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></>,
    attendance: <><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>,
    reports: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></>,
    check: <><polyline points="20 6 9 17 4 12"/></>,
    close: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    church: <><path d="M12 2L2 7v13h20V7L12 2z"/><path d="M12 2v6m-3-3h6"/><rect x="9" y="13" width="6" height="7"/></>,
    menu: <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    phone: <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.62 4.9 2 2 0 0 1 3.6 2.7h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.09a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.5 17.39l.42-.47z"/></>,
    mail: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
    services: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    filter: <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></>,
    trending: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    alert: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      {icons[name] || icons.alert}
    </svg>
  );
};

// ─── App Context ──────────────────────────────────────────────────────────────
const AppContext = createContext(null);
const useApp = () => useContext(AppContext);

// ─── Sample Data ──────────────────────────────────────────────────────────────
const sampleMembers = [
  { id: 1, membershipId: 'HCG-0001', fullName: 'Kwame Boateng', phone: '0244123456', email: 'kwame@email.com', department: 'Choir', status: 'active', joinDate: '2021-03-15' },
  { id: 2, membershipId: 'HCG-0002', fullName: 'Abena Owusu', phone: '0544987654', email: 'abena@email.com', department: 'Women', status: 'active', joinDate: '2020-06-20' },
  { id: 3, membershipId: 'HCG-0003', fullName: 'Yaw Darko', phone: '0204567890', email: '', department: 'Ushers', status: 'active', joinDate: '2022-01-10' },
  { id: 4, membershipId: 'HCG-0004', fullName: 'Akosua Frimpong', phone: '0554321098', email: 'akosua@email.com', department: 'Youth', status: 'active', joinDate: '2023-04-02' },
  { id: 5, membershipId: 'HCG-0005', fullName: 'Kofi Acheampong', phone: '0244765432', email: 'kofi@email.com', department: 'Elders', status: 'active', joinDate: '2019-07-18' },
  { id: 6, membershipId: 'HCG-0006', fullName: 'Efua Mensah', phone: '0504876543', email: '', department: 'Children', status: 'active', joinDate: '2022-09-05' },
  { id: 7, membershipId: 'HCG-0007', fullName: 'Nana Oppong', phone: '0244234567', email: 'nana@email.com', department: 'Prayer', status: 'active', joinDate: '2021-11-22' },
  { id: 8, membershipId: 'HCG-0008', fullName: 'Adwoa Asante', phone: '0554345678', email: 'adwoa@email.com', department: 'Choir', status: 'active', joinDate: '2020-02-14' },
  { id: 9, membershipId: 'HCG-0009', fullName: 'Kweku Amoah', phone: '0204456789', email: '', department: 'Men', status: 'inactive', joinDate: '2018-08-30' },
  { id: 10, membershipId: 'HCG-0010', fullName: 'Ama Boateng', phone: '0244567890', email: 'ama@email.com', department: 'Media', status: 'active', joinDate: '2023-01-17' },
  { id: 11, membershipId: 'HCG-0011', fullName: 'Fiifi Asare', phone: '0544678901', email: 'fiifi@email.com', department: 'Youth', status: 'active', joinDate: '2022-06-08' },
  { id: 12, membershipId: 'HCG-0012', fullName: 'Maame Serwaa', phone: '0244789012', email: '', department: 'Women', status: 'active', joinDate: '2021-04-25' },
];

const sampleVisitors = [
  { id: 1, fullName: 'Josephine Tetteh', phone: '0244111222', email: '', invitedBy: 'Kwame Boateng', visitCount: 1, firstVisitDate: '2024-12-08', lastVisitDate: '2024-12-08' },
  { id: 2, fullName: 'Richard Adjei', phone: '0554222333', email: 'richard@email.com', invitedBy: 'Abena Owusu', visitCount: 3, firstVisitDate: '2024-10-13', lastVisitDate: '2025-01-05' },
  { id: 3, fullName: 'Grace Amponsah', phone: '0204333444', email: '', invitedBy: 'Friend', visitCount: 2, firstVisitDate: '2024-11-17', lastVisitDate: '2024-12-22' },
  { id: 4, fullName: 'Ebo Hutchful', phone: '0244444555', email: 'ebo@email.com', invitedBy: 'Yaw Darko', visitCount: 1, firstVisitDate: '2025-01-12', lastVisitDate: '2025-01-12' },
];

const today = new Date().toISOString().split('T')[0];
const sampleServices = [
  { id: 1, name: 'Sunday Worship Service', type: 'Sunday Service', date: today, time: '09:00 AM', description: 'Main weekly worship service' },
  { id: 2, name: 'Midweek Bible Study', type: 'Midweek Service', date: '2025-01-08', time: '06:00 PM', description: 'Wednesday evening Bible study' },
  { id: 3, name: 'New Year Special Service', type: 'Special Event', date: '2025-01-01', time: '08:00 AM', description: 'New Year crossover service' },
  { id: 4, name: 'Sunday Worship Service', type: 'Sunday Service', date: '2024-12-29', time: '09:00 AM', description: '' },
  { id: 5, name: 'Christmas Service', type: 'Special Event', date: '2024-12-25', time: '08:00 AM', description: 'Christmas day service' },
  { id: 6, name: 'Sunday Worship Service', type: 'Sunday Service', date: '2024-12-22', time: '09:00 AM', description: '' },
];

const sampleAttendance = [
  { id: 1, serviceId: 1, attendeeType: 'member', attendeeId: 1, name: 'Kwame Boateng', checkinTime: `${today}T09:05:00`, membershipId: 'HCG-0001', department: 'Choir' },
  { id: 2, serviceId: 1, attendeeType: 'member', attendeeId: 2, name: 'Abena Owusu', checkinTime: `${today}T09:07:00`, membershipId: 'HCG-0002', department: 'Women' },
  { id: 3, serviceId: 1, attendeeType: 'member', attendeeId: 3, name: 'Yaw Darko', checkinTime: `${today}T09:10:00`, membershipId: 'HCG-0003', department: 'Ushers' },
  { id: 4, serviceId: 1, attendeeType: 'visitor', attendeeId: 1, name: 'Josephine Tetteh', checkinTime: `${today}T09:15:00`, membershipId: 'Visitor', department: '-' },
  { id: 5, serviceId: 2, attendeeType: 'member', attendeeId: 1, name: 'Kwame Boateng', checkinTime: '2025-01-08T18:05:00', membershipId: 'HCG-0001', department: 'Choir' },
  { id: 6, serviceId: 2, attendeeType: 'member', attendeeId: 4, name: 'Akosua Frimpong', checkinTime: '2025-01-08T18:08:00', membershipId: 'HCG-0004', department: 'Youth' },
  { id: 7, serviceId: 3, attendeeType: 'member', attendeeId: 1, name: 'Kwame Boateng', checkinTime: '2025-01-01T08:10:00', membershipId: 'HCG-0001', department: 'Choir' },
  { id: 8, serviceId: 3, attendeeType: 'member', attendeeId: 2, name: 'Abena Owusu', checkinTime: '2025-01-01T08:12:00', membershipId: 'HCG-0002', department: 'Women' },
  { id: 9, serviceId: 3, attendeeType: 'member', attendeeId: 5, name: 'Kofi Acheampong', checkinTime: '2025-01-01T08:15:00', membershipId: 'HCG-0005', department: 'Elders' },
  { id: 10, serviceId: 3, attendeeType: 'visitor', attendeeId: 2, name: 'Richard Adjei', checkinTime: '2025-01-01T08:20:00', membershipId: 'Visitor', department: '-' },
];

const sampleUsers = [
  { id: 1, name: 'Pastor Emmanuel Asante', email: 'admin@heavenly.gh', role: 'admin', phone: '0244000001', isActive: true },
  { id: 2, name: 'Kofi Mensah', email: 'usher@heavenly.gh', role: 'usher', phone: '0244000002', isActive: true },
  { id: 3, name: 'Ama Darko', email: 'leader@heavenly.gh', role: 'leader', phone: '0244000003', isActive: true },
];

// ─── Utility ──────────────────────────────────────────────────────────────────
const deptColors = {
  Choir: 'badge-blue', Ushers: 'badge-green', Youth: 'badge-purple',
  Children: 'badge-amber', Men: 'badge-slate', Women: 'badge-red',
  Elders: 'badge-blue', Media: 'badge-green', Prayer: 'badge-amber', Other: 'badge-slate',
};
const roleColors = { admin: 'badge-blue', usher: 'badge-green', leader: 'badge-amber' };
const serviceTypeColors = {
  'Sunday Service': 'badge-blue', 'Midweek Service': 'badge-green',
  'Special Event': 'badge-amber', 'Prayer Meeting': 'badge-purple', 'Bible Study': 'badge-slate',
};

function Avatar({ name, size = 36 }) {
  const displayName = name || 'User';
  const initials = displayName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const colors = ['#2563EB', '#16A34A', '#9333EA', '#D97706', '#DC2626', '#0891B2'];
  const color = colors[displayName.charCodeAt(0) % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: color + '20',
      color, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.36, flexShrink: 0, border: `2px solid ${color}30` }}>
      {initials}
    </div>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`toast ${type}`}>
      <Icon name={type === 'success' ? 'check' : 'alert'} size={16} color="white" />
      {message}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 0' }}>
          <h2 style={{ fontFamily: 'Lora', fontSize: 20, fontWeight: 600, color: 'var(--slate-800)' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'var(--slate-100)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'var(--slate-500)' }}>
            <Icon name="close" size={16} />
          </button>
        </div>
        <div style={{ padding: '16px 24px 24px' }}>{children}</div>
      </div>
    </div>
  );
}

function ConfirmModal({ title, message, onConfirm, onClose }) {
  return (
    <Modal title={title} onClose={onClose}>
      <p style={{ color: 'var(--slate-600)', marginBottom: 24, lineHeight: 1.6 }}>{message}</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-danger" onClick={onConfirm}>Delete</button>
      </div>
    </Modal>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin, members = [], visitors = [], services = [] }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Calculate dynamic stats
  const activeMembers = members.filter(m => m.status === 'active').length;
  const today = new Date().toISOString().split('T')[0];
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);
  const thisWeekDate = thisWeekStart.toISOString().split('T')[0];
  const weeklyServices = services.filter(s => s.date && s.date >= thisWeekDate).length;
  const thisMonth = today.substring(0, 7);
  const recentVisitors = visitors.filter(v => {
    const createdDate = v.createdAt ? v.createdAt.substring(0, 7) : null;
    return createdDate === thisMonth;
  }).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;
      
      // Store token and user info
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Call onLogin with user data
      onLogin(user);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to login. Check your connection.';
      setError(errorMsg);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 40%, #3B82F6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <style>{`
        @media (max-width: 768px) {
          .login-container {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .login-left {
            display: none;
          }
          .login-form-wrapper {
            padding: 24px !important;
          }
          .login-form-wrapper h2 {
            font-size: 20px !important;
          }
          .login-form-wrapper p {
            font-size: 13px !important;
          }
          .btn-primary {
            padding: 12px 16px !important;
            font-size: 14px !important;
          }
        }
        @media (max-width: 480px) {
          .login-container {
            max-width: 100% !important;
            padding: 0 !important;
          }
          .login-form-wrapper {
            padding: 20px !important;
            border-radius: 16px !important;
          }
          .login-form-wrapper h2 {
            font-size: 18px !important;
            margin-bottom: 6px !important;
          }
          input, select, textarea {
            font-size: 16px !important;
            padding: 10px 12px !important;
          }
          .form-group {
            margin-bottom: 18px !important;
          }
        }
      `}</style>
      <div className="login-container" style={{ width: '100%', maxWidth: 1000, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
        
        {/* Left side - Community message (hidden on mobile) */}
        <div className="login-left" style={{ color: 'white', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, background: 'rgba(255,255,255,0.15)', borderRadius: 20, marginBottom: 24, border: '2px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)' }}>
              <Icon name="church" size={42} color="white" />
            </div>
            <h1 style={{ fontFamily: 'Lora', fontSize: 36, fontWeight: 600, marginBottom: 12, lineHeight: 1.2 }}>Heavenly Church Ghana</h1>
            <p style={{ fontSize: 18, opacity: 0.9, marginBottom: 8 }}>Growing Together in Faith</p>
            <p style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.6 }}>Connect with our vibrant community, track fellowship moments, and stay engaged with worship services and events.</p>
          </div>

          {/* Community highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="members" size={16} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{activeMembers}+ Active Members</div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>Engaged congregation</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="services" size={16} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{weeklyServices} Weekly Services</div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>Sunday worship & midweek study</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="visitors" size={16} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Welcome to Visitors</div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>{recentVisitors} recent guests this month</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div style={{ padding: 0 }}>
          <div className="login-form-wrapper" style={{ background: 'white', borderRadius: 24, padding: 40, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <h2 style={{ fontFamily: 'Lora', fontSize: 24, fontWeight: 600, color: 'var(--slate-800)', marginBottom: 8 }}>Welcome to Your Ministry</h2>
            <p style={{ color: 'var(--slate-500)', fontSize: 14, marginBottom: 32 }}>Sign in to manage attendance & community</p>

            {error && (
              <div style={{ background: 'var(--red-50)', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 14px', marginBottom: 24, fontSize: 13, color: 'var(--red-600)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Icon name="alert" size={16} color="var(--red-600)" style={{ flexShrink: 0, marginTop: 1 }} />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="your.email@heavenly.gh" 
                  required 
                  style={{ fontSize: 15 }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 28 }}>
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="••••••••" 
                    required
                    style={{ fontSize: 15, paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 4,
                      color: 'var(--slate-400)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon name={showPassword ? 'eye' : 'eye'} size={18} color="var(--slate-400)" />
                  </button>
                </div>
              </div>
              
              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: '100%', justifyContent: 'center', padding: '14px 18px', fontSize: 15, fontWeight: 600 }} 
                disabled={loading}
              >
                {loading ? 'Connecting...' : 'Sign In to Ministry'}
              </button>
            </form>

            {/* <div style={{ marginTop: 28, padding: 16, background: 'linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)', borderRadius: 14, border: '1px solid var(--blue-100)' }}>
              <p style={{ fontSize: 12, color: 'var(--slate-700)', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="check" size={14} color="var(--green-600)" />
                Demo Account Access
              </p>
              <div style={{ fontSize: 12, color: 'var(--slate-600)', lineHeight: 2 }}>
                <div><strong>Admin:</strong> admin@heavenly.gh / admin123</div>
                <div><strong>Leader:</strong> leader@heavenly.gh / leader123</div>
                <div><strong>Usher:</strong> usher@heavenly.gh / usher123</div>
              </div>
            </div> */}

            <div style={{ marginTop: 24, padding: 12, background: 'var(--slate-50)', borderRadius: 10, textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: 'var(--slate-500)' }}>
                A community platform by <strong>Heavenly Church Ghana</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile responsive */}
      <style>{`
        @media (max-width: 768px) {
          @media (max-width: 768px) {
            div:has(> div > div:last-child) {
              grid-template-columns: 1fr !important;
              gap: 24px !important;
            }
          }
        }
      `}</style>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ currentPage, setPage, user, onLogout, isOpen, onClose }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'members', label: 'Members', icon: 'members' },
    { id: 'visitors', label: 'Visitors', icon: 'visitors' },
    { id: 'attendance', label: 'Attendance', icon: 'attendance' },
    { id: 'services', label: 'Services', icon: 'services' },
    { id: 'reports', label: 'Reports', icon: 'reports' },
    ...(user?.role === 'admin' ? [{ id: 'settings', label: 'Settings', icon: 'settings' }] : []),
  ];

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--slate-100)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: 'var(--blue-600)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="church" size={22} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: 'Lora', fontSize: 14, fontWeight: 600, color: 'var(--slate-800)', lineHeight: 1.2 }}>Heavenly Church</div>
            <div style={{ fontSize: 11, color: 'var(--blue-600)', fontWeight: 600 }}>Ghana</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate-400)', padding: '0 6px', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Main Menu</div>
        {navItems.map(item => (
          <div key={item.id} className={`sidebar-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => { setPage(item.id); onClose?.(); }}>
            <Icon name={item.icon} size={18} className="icon" />
            {item.label}
          </div>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--slate-100)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: 'var(--slate-50)', marginBottom: 8 }}>
          <Avatar name={user?.name || 'User'} size={32} />
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--slate-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <span className={`badge ${roleColors[user?.role] || 'badge-slate'}`} style={{ fontSize: 10, padding: '1px 6px' }}>{user?.role}</span>
          </div>
        </div>
        <div className="sidebar-item" onClick={onLogout} style={{ color: 'var(--red-500)' }}>
          <Icon name="logout" size={18} />
          Sign Out
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside style={{ width: 240, background: 'white', borderRight: '1px solid var(--slate-100)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, flexShrink: 0 }} className="hide-mobile">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 49 }} onClick={onClose} />
          <aside style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 260, background: 'white', zIndex: 50, boxShadow: '4px 0 20px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }} className="animate-slide">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}

// ─── TOP BAR ──────────────────────────────────────────────────────────────────
function TopBar({ title, subtitle, onMenuToggle }) {
  return (
    <div style={{ background: 'white', borderBottom: '1px solid var(--slate-100)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onMenuToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-600)', display: 'none' }} className="menu-btn" id="mobile-menu-btn">
          <Icon name="menu" size={22} />
        </button>
        <div>
          <h1 style={{ fontFamily: 'Lora', fontSize: 20, fontWeight: 600, color: 'var(--slate-800)' }}>{title}</h1>
          {subtitle && <p style={{ fontSize: 13, color: 'var(--slate-500)', marginTop: 2 }}>{subtitle}</p>}
        </div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--slate-500)' }}>
        {new Date().toLocaleDateString('en-GH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
      <style>{`.menu-btn { display: none !important; } @media (max-width: 768px) { .menu-btn { display: flex !important; } }`}</style>
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color, sub, trend }) {
  const colors = {
    blue: { bg: '#EFF6FF', icon: '#2563EB', border: '#DBEAFE' },
    green: { bg: '#F0FDF4', icon: '#16A34A', border: '#DCFCE7' },
    amber: { bg: '#FFFBEB', icon: '#D97706', border: '#FEF3C7' },
    purple: { bg: '#FAF5FF', icon: '#9333EA', border: '#F3E8FF' },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className="card stat-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: c.bg, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={22} color={c.icon} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: 'var(--slate-500)', fontWeight: 500, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--slate-800)', lineHeight: 1, marginBottom: 4 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--slate-400)' }}>{sub}</div>}
        {trend !== undefined && (
          <div style={{ fontSize: 12, color: trend >= 0 ? 'var(--green-600)' : 'var(--red-500)', fontWeight: 600 }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ATTENDANCE CHART ─────────────────────────────────────────────────────────
function AttendanceChart({ services, attendance }) {
  const chartData = services.slice(0, 6).reverse().map(s => ({
    label: new Date(s.date).toLocaleDateString('en-GH', { month: 'short', day: 'numeric' }),
    count: attendance.filter(a => a.serviceId === s._id).length,
    type: s.type,
  }));
  const max = Math.max(...chartData.map(d => d.count), 1);
  return (
    <div style={{ padding: '0 4px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 120, marginBottom: 8 }}>
        {chartData.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--blue-600)' }}>{d.count}</div>
            <div className="chart-bar" style={{
              width: '100%', borderRadius: '6px 6px 0 0',
              height: `${Math.max((d.count / max) * 90, 4)}px`,
              background: d.type === 'Sunday Service' ? 'var(--blue-500)' : d.type === 'Special Event' ? 'var(--amber-500)' : 'var(--green-500)',
              opacity: 0.85,
            }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, borderTop: '1px solid var(--slate-100)', paddingTop: 8 }}>
        {chartData.map((d, i) => (
          <div key={i} style={{ flex: 1, fontSize: 10, color: 'var(--slate-400)', textAlign: 'center', whiteSpace: 'nowrap' }}>{d.label}</div>
        ))}
      </div>
    </div>
  );
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────
function DashboardPage({ members, visitors, attendance, services, user }) {
  const today = new Date().toISOString().split('T')[0];
  const todayServices = services.filter(s => s.date && s.date.substring(0, 10) === today);
  const todayAttendance = attendance.filter(a => todayServices.some(s => s._id === a.serviceId));
  const todayMembers = todayAttendance.filter(a => a.attendeeType === 'member').length;
  const todayVisitors = todayAttendance.filter(a => a.attendeeType === 'visitor').length;
  const activeMembers = members.filter(m => m.status === 'active').length;

  const recentAttendance = [...attendance].sort((a, b) => new Date(b.checkinTime) - new Date(a.checkinTime)).slice(0, 6);

  const deptBreakdown = members.reduce((acc, m) => {
    if (m.status === 'active') acc[m.department] = (acc[m.department] || 0) + 1;
    return acc;
  }, {});
  const topDepts = Object.entries(deptBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const totalActive = activeMembers || 1;

  // Calculate dynamic trends
  const getDateDaysAgo = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  // Members trend (compare to 7 days ago)
  const membersFromWeekAgo = members.filter(m => {
    const createdDate = m.createdAt ? m.createdAt.substring(0, 10) : null;
    return createdDate && createdDate >= getDateDaysAgo(7);
  }).length;
  const membersTrend = activeMembers > 0 ? Math.round(((activeMembers - membersFromWeekAgo) / Math.max(1, membersFromWeekAgo)) * 100) || 0 : 0;

  // Visitors trend (compare to 7 days ago)
  const visitorsFromWeekAgo = visitors.filter(v => {
    const createdDate = v.createdAt ? v.createdAt.substring(0, 10) : null;
    return createdDate && createdDate >= getDateDaysAgo(7);
  }).length;
  const visitorsTrend = visitors.length > 0 ? Math.round(((visitors.length - visitorsFromWeekAgo) / Math.max(1, visitorsFromWeekAgo)) * 100) || 0 : 0;

  // Today's attendance trend (compare to yesterday)
  const yesterday = getDateDaysAgo(1);
  const yesterdayServices = services.filter(s => s.date && s.date.substring(0, 10) === yesterday);
  const yesterdayAttendance = attendance.filter(a => yesterdayServices.some(s => s._id === a.serviceId));
  const attendanceTrend = yesterdayAttendance.length > 0 ? Math.round(((todayAttendance.length - yesterdayAttendance.length) / yesterdayAttendance.length) * 100) : 0;

  // Services trend (compare to previous month)
  const currentMonth = today.substring(0, 7);
  const prevMonth = new Date();
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  const prevMonthStr = prevMonth.toISOString().substring(0, 7);
  const servicesThisMonth = services.filter(s => s.date?.startsWith(currentMonth)).length;
  const servicesPrevMonth = services.filter(s => s.date?.startsWith(prevMonthStr)).length;
  const servicesTrend = servicesPrevMonth > 0 ? Math.round(((servicesThisMonth - servicesPrevMonth) / servicesPrevMonth) * 100) : 0;

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade">
      {/* Greeting */}
      <div style={{ background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)', borderRadius: 16, padding: '24px 28px', color: 'white' }}>
        <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'} 👋</div>
        <h2 style={{ fontFamily: 'Lora', fontSize: 22, fontWeight: 600 }}>{user?.name}</h2>
        <p style={{ opacity: 0.8, fontSize: 14, marginTop: 4 }}>
          {todayServices.length > 0 ? `${todayServices.length} service(s) scheduled today · ${todayAttendance.length} checked in` : 'No services scheduled today'}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard label="Active Members" value={activeMembers} icon="members" color="blue" sub="Registered congregation" trend={membersTrend} />
        <StatCard label="Total Visitors" value={visitors.length} icon="visitors" color="green" sub="All-time visitors" trend={visitorsTrend} />
        <StatCard label="Today's Attendance" value={todayAttendance.length} icon="attendance" color="amber" sub={`${todayMembers} members · ${todayVisitors} visitors`} trend={attendanceTrend} />
        <StatCard label="Services This Month" value={servicesThisMonth} icon="services" color="purple" sub="Scheduled services" trend={servicesTrend} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Attendance trend */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontWeight: 600, fontSize: 16, color: 'var(--slate-800)' }}>Attendance Trend</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--slate-500)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--blue-500)', display: 'inline-block' }} /> Sunday
              </span>
              <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--slate-500)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--green-500)', display: 'inline-block' }} /> Midweek
              </span>
              <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--slate-500)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--amber-500)', display: 'inline-block' }} /> Event
              </span>
            </div>
          </div>
          <AttendanceChart services={services} attendance={attendance} />
        </div>

        {/* Department breakdown */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 600, fontSize: 16, color: 'var(--slate-800)', marginBottom: 20 }}>Members by Department</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topDepts.map(([dept, count]) => (
              <div key={dept}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: 'var(--slate-600)', fontWeight: 500 }}>{dept}</span>
                  <span style={{ fontSize: 13, color: 'var(--slate-800)', fontWeight: 600 }}>{count}</span>
                </div>
                <div style={{ height: 6, background: 'var(--slate-100)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(count / totalActive) * 100}%`, background: 'var(--blue-500)', borderRadius: 99, transition: 'width 0.6s cubic-bezier(.16,1,.3,1)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent check-ins */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 600, fontSize: 16, color: 'var(--slate-800)' }}>Recent Check-ins</h3>
          <span className="badge badge-blue">{todayAttendance.length} today</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead><tr><th>Name</th><th>Type</th><th>Department</th><th>Time</th></tr></thead>
            <tbody>
              {recentAttendance.map(a => (
                <tr key={a.id} className="row-hover">
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={a.name} size={30} />
                      <span style={{ fontWeight: 500 }}>{a.name}</span>
                    </div>
                  </td>
                  <td><span className={`badge ${a.attendeeType === 'member' ? 'badge-blue' : 'badge-green'}`}>{a.attendeeType}</span></td>
                  <td>{a.department !== '-' ? a.department : <span style={{ color: 'var(--slate-400)' }}>Visitor</span>}</td>
                  <td style={{ color: 'var(--slate-500)', fontSize: 13 }}>{new Date(a.checkinTime).toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── MEMBERS PAGE ─────────────────────────────────────────────────────────────
function MembersPage({ members, setMembers, showToast, user }) {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', department: 'Choir', status: 'active' });

  const canEdit = user?.role !== 'usher';

  const filtered = members.filter(m => {
    const s = search.toLowerCase();
    const matchSearch = !s || m.fullName.toLowerCase().includes(s) || m.phone.includes(s) || m.membershipId.toLowerCase().includes(s);
    const matchDept = !deptFilter || m.department === deptFilter;
    const matchStatus = !statusFilter || m.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const openAdd = () => { setEditing(null); setForm({ fullName: '', phone: '', email: '', department: 'Choir', status: 'active' }); setShowModal(true); };
  const openEdit = (m) => { setEditing(m); setForm({ fullName: m.fullName, phone: m.phone, email: m.email, department: m.department, status: m.status }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.fullName || !form.phone) return;
    try {
      if (editing) {
        await membersAPI.update(editing._id, form);
        setMembers(prev => prev.map(m => m._id === editing._id ? { ...m, ...form } : m));
        showToast('Member updated successfully', 'success');
      } else {
        const response = await membersAPI.create(form);
        setMembers(prev => [...prev, response.data]);
        showToast('Member added successfully', 'success');
      }
      setShowModal(false);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to save member';
      showToast(errorMsg, 'error');
      console.error('Save error:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await membersAPI.delete(deleteTarget._id);
      setMembers(prev => prev.filter(m => m._id !== deleteTarget._id));
      showToast('Member deleted', 'success');
      setDeleteTarget(null);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete member';
      showToast(errorMsg, 'error');
      console.error('Delete error:', error);
    }
  };

  const depts = ['Choir', 'Ushers', 'Youth', 'Children', 'Men', 'Women', 'Elders', 'Media', 'Prayer', 'Other'];

  return (
    <div style={{ padding: 24 }} className="animate-fade">
      <div className="card" style={{ overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--slate-100)', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
            <Icon name="search" size={15} className="icon" />
            <input placeholder="Search by name, phone, or ID..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%' }} />
          </div>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{ width: 'auto' }}>
            <option value="">All Departments</option>
            {depts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 'auto' }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {canEdit && <button className="btn-primary" onClick={openAdd}><Icon name="plus" size={15} color="white" />Add Member</button>}
        </div>

        <div style={{ padding: '10px 24px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--slate-500)' }}>{filtered.length} member{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr><th>Member</th><th>Membership ID</th><th>Phone</th><th>Department</th><th>Status</th><th>Joined</th>{canEdit && <th></th>}</tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m._id} className="row-hover">
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={m.fullName} size={34} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{m.fullName}</div>
                        {m.email && <div style={{ fontSize: 12, color: 'var(--slate-400)' }}>{m.email}</div>}
                      </div>
                    </div>
                  </td>
                  <td><code style={{ fontSize: 12, background: 'var(--slate-100)', padding: '2px 8px', borderRadius: 6 }}>{m.membershipId}</code></td>
                  <td>{m.phone}</td>
                  <td><span className={`badge ${deptColors[m.department] || 'badge-slate'}`}>{m.department}</span></td>
                  <td><span className={`badge ${m.status === 'active' ? 'badge-green' : 'badge-slate'}`}>{m.status}</span></td>
                  <td style={{ fontSize: 13, color: 'var(--slate-500)' }}>{new Date(m.joinDate || new Date()).toLocaleDateString('en-GH')}</td>
                  {canEdit && (
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(m)} style={{ background: 'var(--blue-50)', border: 'none', borderRadius: 7, padding: '6px 8px', cursor: 'pointer', color: 'var(--blue-600)' }}><Icon name="edit" size={14} /></button>
                        <button onClick={() => setDeleteTarget(m)} style={{ background: 'var(--red-50)', border: 'none', borderRadius: 7, padding: '6px 8px', cursor: 'pointer', color: 'var(--red-500)' }}><Icon name="trash" size={14} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--slate-400)' }}>
              <Icon name="members" size={40} color="var(--slate-300)" />
              <p style={{ marginTop: 12 }}>No members found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal title={editing ? 'Edit Member' : 'Add New Member'} onClose={() => setShowModal(false)}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Enter full name" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="0244123456" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address (optional)</label>
            <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Department</label>
              <select value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}>
                {depts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="transferred">Transferred</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave}><Icon name="check" size={15} color="white" />{editing ? 'Update Member' : 'Add Member'}</button>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmModal title="Delete Member" message={`Are you sure you want to delete ${deleteTarget.fullName}? This action cannot be undone.`}
          onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}

// ─── VISITORS PAGE ────────────────────────────────────────────────────────────
function VisitorsPage({ visitors, setVisitors, members, showToast }) {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', invitedBy: '' });

  const filtered = visitors.filter(v => {
    const s = search.toLowerCase();
    return !s || v.fullName.toLowerCase().includes(s) || v.phone.includes(s) || v.invitedBy?.toLowerCase().includes(s);
  });

  const openAdd = () => { setEditing(null); setForm({ fullName: '', phone: '', email: '', invitedBy: '' }); setShowModal(true); };
  const openEdit = (v) => { setEditing(v); setForm({ fullName: v.fullName, phone: v.phone, email: v.email || '', invitedBy: v.invitedBy || '' }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.fullName || !form.phone) return;
    try {
      if (editing) {
        await visitorsAPI.update(editing._id, form);
        setVisitors(prev => prev.map(v => v._id === editing._id ? { ...v, ...form } : v));
        showToast('Visitor updated', 'success');
      } else {
        const response = await visitorsAPI.create(form);
        setVisitors(prev => [...prev, response.data]);
        showToast('Visitor registered successfully', 'success');
      }
      setShowModal(false);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to save visitor';
      showToast(errorMsg, 'error');
      console.error('Save error:', error);
    }
  };

  return (
    <div style={{ padding: 24 }} className="animate-fade">
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--slate-100)', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
            <Icon name="search" size={15} className="icon" />
            <input placeholder="Search visitors..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={openAdd}><Icon name="plus" size={15} color="white" />Register Visitor</button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead><tr><th>Visitor</th><th>Phone</th><th>Invited By</th><th>Visits</th><th>First Visit</th><th>Last Visit</th><th></th></tr></thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v._id} className="row-hover">
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={v.fullName} size={32} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{v.fullName}</div>
                        {v.email && <div style={{ fontSize: 12, color: 'var(--slate-400)' }}>{v.email}</div>}
                      </div>
                    </div>
                  </td>
                  <td>{v.phone}</td>
                  <td>{v.invitedBy || <span style={{ color: 'var(--slate-400)' }}>-</span>}</td>
                  <td>
                    <span className={`badge ${v.visitCount >= 3 ? 'badge-blue' : 'badge-green'}`}>{v.visitCount}x</span>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--slate-500)' }}>{new Date(v.firstVisitDate || new Date()).toLocaleDateString('en-GH')}</td>
                  <td style={{ fontSize: 13, color: 'var(--slate-500)' }}>{new Date(v.lastVisitDate || new Date()).toLocaleDateString('en-GH')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(v)} style={{ background: 'var(--blue-50)', border: 'none', borderRadius: 7, padding: '6px 8px', cursor: 'pointer', color: 'var(--blue-600)' }}><Icon name="edit" size={14} /></button>
                      <button onClick={() => setDeleteTarget(v)} style={{ background: 'var(--red-50)', border: 'none', borderRadius: 7, padding: '6px 8px', cursor: 'pointer', color: 'var(--red-500)' }}><Icon name="trash" size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--slate-400)' }}>
              <Icon name="visitors" size={40} color="var(--slate-300)" />
              <p style={{ marginTop: 12 }}>No visitors found</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Visitor' : 'Register New Visitor'} onClose={() => setShowModal(false)}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Visitor's name" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="0244123456" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email (optional)</label>
            <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Invited By</label>
            <input value={form.invitedBy} onChange={e => setForm(p => ({ ...p, invitedBy: e.target.value }))} placeholder="Member name or 'Friend'" />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave}><Icon name="check" size={15} color="white" />{editing ? 'Update' : 'Register Visitor'}</button>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmModal title="Remove Visitor" message={`Remove ${deleteTarget.fullName} from visitor records?`}
          onConfirm={async () => {
            try {
              await visitorsAPI.delete(deleteTarget._id);
              setVisitors(prev => prev.filter(v => v._id !== deleteTarget._id));
              showToast('Visitor removed', 'success');
              setDeleteTarget(null);
            } catch (error) {
              const errorMsg = error.response?.data?.message || 'Failed to delete visitor';
              showToast(errorMsg, 'error');
            }
          }}
          onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}

// ─── ATTENDANCE PAGE ──────────────────────────────────────────────────────────
function AttendancePage({ attendance, setAttendance, members, visitors, services, setServices, showToast, user }) {
  const serviceTypes = ['Sunday Service', 'Midweek Service', 'Special Event', 'Prayer Meeting', 'Bible Study'];
  const [selectedServiceType, setSelectedServiceType] = useState('Sunday Service');
  const [currentServiceId, setCurrentServiceId] = useState(null); // Track the service being used
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('checkin');

  // Get today's service for the selected type (for display purposes)
  const getTodayServiceByType = (type) => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    
    return services.find(s => {
      if (s.type !== type) return false;
      const serviceDate = new Date(s.date);
      const serviceDateStart = new Date(serviceDate.getFullYear(), serviceDate.getMonth(), serviceDate.getDate());
      return serviceDateStart.getTime() === todayStart.getTime();
    });
  };

  const todayService = getTodayServiceByType(selectedServiceType);
  const serviceAttendance = (todayService || (currentServiceId && services.find(s => s._id === currentServiceId)))
    ? attendance.filter(a => a.serviceId?._id === (todayService?._id || currentServiceId))
    : [];

  const allPeople = [
    ...members.filter(m => m.status === 'active').map(m => ({ 
      ...m, 
      _id: m._id || m.id,  // Ensure _id is captured
      type: 'member', 
      displayId: m.membershipId 
    })),
    ...visitors.map(v => ({ 
      ...v, 
      _id: v._id || v.id,  // Ensure _id is captured
      fullName: v.fullName, 
      type: 'visitor', 
      displayId: 'Visitor', 
      department: '-' 
    })),
  ];

  const filteredPeople = allPeople.filter(p => {
    const s = search.toLowerCase();
    if (!s) return true;
    return p.fullName.toLowerCase().includes(s) || p.phone.includes(s) || (p.membershipId || '').toLowerCase().includes(s);
  });

  const isCheckedIn = (person) => {
    if (person.type === 'member') return serviceAttendance.some(a => a.memberId?._id === person._id && a.attendeeType === 'member');
    return serviceAttendance.some(a => a.visitorId?._id === person._id && a.attendeeType === 'visitor');
  };

  const handleCheckin = async (person) => {
    if (!selectedServiceType) {
      showToast('Please select a service type first', 'error');
      return;
    }
    if (isCheckedIn(person)) {
      showToast(`${person.fullName} is already checked in`, 'error');
      return;
    }
    try {
      const checkinData = {
        serviceType: selectedServiceType,
        attendeeType: person.type,
      };
      
      if (person.type === 'member') {
        const memberId = person._id || person.id;
        if (!memberId) {
          showToast('Error: Member ID not found. Please refresh and try again.', 'error');
          console.error('Member object missing _id:', person);
          return;
        }
        checkinData.memberId = memberId;
      } else if (person.type === 'visitor') {
        const visitorId = person._id || person.id;
        if (!visitorId) {
          showToast('Error: Visitor ID not found. Please refresh and try again.', 'error');
          console.error('Visitor object missing _id:', person);
          return;
        }
        checkinData.visitorId = visitorId;
      }
      
      console.log('Sending checkin data:', checkinData, 'for person:', person);
      const response = await attendanceAPI.checkin(checkinData);
      setAttendance(prev => [...prev, response.data]);
      
      // Store the service ID for reliable filtering
      const newService = response.data.serviceId;
      if (newService?._id) {
        setCurrentServiceId(newService._id);
      }
      
      // Ensure the newly created service is in the services list
      if (newService && !services.some(s => s._id === newService._id)) {
        setServices(prev => [newService, ...prev]);
      }
      
      showToast(`✓ ${person.fullName} checked in!`, 'success');
      setSearch('');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to check in';
      showToast(errorMsg, 'error');
      console.error('Checkin error details:', error.response?.data);
      console.error('Checkin error:', error);
    }
  };

  const handleUncheck = async (person, e) => {
    e.stopPropagation();
    try {
      // Find the attendance record for this person
      const record = person.type === 'member'
        ? serviceAttendance.find(a => a.memberId?._id === person._id && a.attendeeType === 'member')
        : serviceAttendance.find(a => a.visitorId?._id === person._id && a.attendeeType === 'visitor');

      if (!record) {
        showToast('Attendance record not found', 'error');
        return;
      }

      await attendanceAPI.uncheckout(record._id);
      setAttendance(prev => prev.filter(a => a._id !== record._id));
      showToast(`✓ ${person.fullName} unchecked`, 'success');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to uncheck';
      showToast(errorMsg, 'error');
      console.error('Uncheck error:', error);
    }
  };

  const memberCount = serviceAttendance.filter(a => a.attendeeType === 'member').length;
  const visitorCount = serviceAttendance.filter(a => a.attendeeType === 'visitor').length;

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade">
      {/* Service Type Selector */}
      <div className="card" style={{ padding: 20 }}>
        <label className="form-label" style={{ marginBottom: 12 }}>Select Service Type</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          {serviceTypes.map(type => (
            <button
              key={type}
              onClick={() => {
                setSelectedServiceType(type);
                setCurrentServiceId(null); // Reset when switching types
              }}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                border: selectedServiceType === type ? '2px solid var(--blue-600)' : '1.5px solid var(--slate-200)',
                background: selectedServiceType === type ? 'var(--blue-50)' : 'white',
                color: selectedServiceType === type ? 'var(--blue-700)' : 'var(--slate-600)',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}>
              {type}
            </button>
          ))}
        </div>
        {todayService || (currentServiceId && services.find(s => s._id === currentServiceId)) ? (
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid var(--slate-100)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--blue-600)' }}>{memberCount}</div>
              <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>Members</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--green-600)' }}>{visitorCount}</div>
              <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>Visitors</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--slate-800)' }}>{memberCount + visitorCount}</div>
              <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>Total</div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--slate-500)', marginLeft: 'auto' }}>
              📅 {new Date((todayService || services.find(s => s._id === currentServiceId)).date).toLocaleDateString('en-GH')} at {(todayService || services.find(s => s._id === currentServiceId)).time}
            </div>
          </div>
        ) : null}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--slate-100)', padding: 4, borderRadius: 10, width: 'fit-content' }}>
        {[{ id: 'checkin', label: 'Quick Check-in' }, { id: 'list', label: 'Attendance List' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600, border: 'none',
            background: tab === t.id ? 'white' : 'transparent',
            color: tab === t.id ? 'var(--blue-600)' : 'var(--slate-500)',
            boxShadow: tab === t.id ? 'var(--shadow-sm)' : 'none',
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'checkin' ? (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--slate-100)' }}>
            <div className="search-bar">
              <Icon name="search" size={15} className="icon" />
              <input placeholder="Search member or visitor name, phone, ID..." value={search} onChange={e => setSearch(e.target.value)} autoFocus />
            </div>
          </div>

          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {(search ? filteredPeople : allPeople.slice(0, 15)).map(person => {
              const checkedIn = isCheckedIn(person);
              return (
                <div key={`${person.type}-${person._id}`} className="row-hover"
                  style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--slate-50)', cursor: 'pointer' }}
                  onClick={() => !checkedIn && handleCheckin(person)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar name={person.fullName} size={36} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{person.fullName}</div>
                      <div style={{ fontSize: 12, color: 'var(--slate-400)' }}>
                        {person.membershipId || 'Visitor'} · {person.phone}
                        {person.department && person.department !== '-' ? ` · ${person.department}` : ''}
                      </div>
                    </div>
                  </div>
                  <div>
                    {checkedIn ? (
                      <button 
                        className="badge badge-green" 
                        style={{ gap: 4, display: 'flex', alignItems: 'center', cursor: 'pointer', border: 'none', background: 'var(--green-50)', color: 'var(--green-700)', padding: '6px 12px', borderRadius: '4px', fontSize: 12, fontWeight: 500 }}
                        onClick={e => handleUncheck(person, e)}
                        title="Click to undo check-in">
                        <Icon name="check" size={12} color="var(--green-700)" /> Checked In
                      </button>
                    ) : (
                      <button className="btn-primary" style={{ padding: '6px 14px', fontSize: 13 }} onClick={e => { e.stopPropagation(); handleCheckin(person); }}>
                        Check In
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {search && filteredPeople.length === 0 && (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--slate-400)' }}>No matching person found</div>
            )}
          </div>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 600, fontSize: 16 }}>Attendance List — {(todayService || services.find(s => s._id === currentServiceId))?.name || selectedServiceType}</h3>
            <span style={{ fontSize: 13, color: 'var(--slate-500)' }}>{serviceAttendance.length} total</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead><tr><th>Name</th><th>Type</th><th>ID / Status</th><th>Department</th><th>Check-in Time</th></tr></thead>
              <tbody>
                {serviceAttendance.map(a => (
                  <tr key={a._id} className="row-hover">
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={a.memberId?.fullName || a.visitorId?.fullName} size={30} />
                        <span style={{ fontWeight: 500 }}>{a.memberId?.fullName || a.visitorId?.fullName}</span>
                      </div>
                    </td>
                    <td><span className={`badge ${a.attendeeType === 'member' ? 'badge-blue' : 'badge-green'}`}>{a.attendeeType}</span></td>
                    <td><code style={{ fontSize: 12, background: 'var(--slate-100)', padding: '2px 8px', borderRadius: 6 }}>{a.memberId?.membershipId || 'Visitor'}</code></td>
                    <td>{a.memberId?.department || '-'}</td>
                    <td style={{ fontSize: 13, color: 'var(--slate-500)' }}>{new Date(a.checkinTime).toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {serviceAttendance.length === 0 && (
              <div style={{ padding: 48, textAlign: 'center', color: 'var(--slate-400)' }}>
                <Icon name="attendance" size={40} color="var(--slate-300)" />
                <p style={{ marginTop: 12 }}>No attendance records for this service yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SERVICES PAGE ────────────────────────────────────────────────────────────
function ServicesPage({ services, setServices, attendance, showToast, user }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'Sunday Service', date: today, time: '09:00 AM', description: '' });

  const canEdit = user?.role !== 'usher';

  const openAdd = () => { setEditing(null); setForm({ name: '', type: 'Sunday Service', date: today, time: '09:00 AM', description: '' }); setShowModal(true); };
  const openEdit = (s) => { setEditing(s); setForm({ name: s.name, type: s.type, date: s.date, time: s.time, description: s.description || '' }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.date) return;
    try {
      if (editing) {
        await servicesAPI.update(editing._id, form);
        setServices(prev => prev.map(s => s._id === editing._id ? { ...s, ...form } : s));
        showToast('Service updated', 'success');
      } else {
        const response = await servicesAPI.create(form);
        setServices(prev => [response.data, ...prev]);
        showToast('Service created', 'success');
      }
      setShowModal(false);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to save service';
      showToast(errorMsg, 'error');
      console.error('Save error:', error);
    }
  };

  return (
    <div style={{ padding: 24 }} className="animate-fade">
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--slate-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 600, fontSize: 16 }}>All Services & Events</h3>
          {canEdit && <button className="btn-primary" onClick={openAdd}><Icon name="plus" size={15} color="white" />New Service</button>}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead><tr><th>Service Name</th><th>Type</th><th>Date</th><th>Time</th><th>Attendance</th>{canEdit && <th></th>}</tr></thead>
            <tbody>
              {services.map(s => {
                const count = attendance.filter(a => a.serviceId === s._id).length;
                return (
                  <tr key={s._id} className="row-hover">
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                      {s.description && <div style={{ fontSize: 12, color: 'var(--slate-400)' }}>{s.description}</div>}
                    </td>
                    <td><span className={`badge ${serviceTypeColors[s.type] || 'badge-slate'}`}>{s.type}</span></td>
                    <td style={{ fontSize: 13 }}>{new Date(s.date).toLocaleDateString('en-GH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td>{s.time}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: count > 0 ? 'var(--blue-600)' : 'var(--slate-400)' }}>{count} {count === 1 ? 'person' : 'people'}</span>
                    </td>
                    {canEdit && (
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => openEdit(s)} style={{ background: 'var(--blue-50)', border: 'none', borderRadius: 7, padding: '6px 8px', cursor: 'pointer', color: 'var(--blue-600)' }}><Icon name="edit" size={14} /></button>
                          <button onClick={() => setDeleteTarget(s)} style={{ background: 'var(--red-50)', border: 'none', borderRadius: 7, padding: '6px 8px', cursor: 'pointer', color: 'var(--red-500)' }}><Icon name="trash" size={14} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Service' : 'Create New Service'} onClose={() => setShowModal(false)}>
          <div className="form-group">
            <label className="form-label">Service Name *</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Sunday Worship Service" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Service Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                <option>Sunday Service</option>
                <option>Midweek Service</option>
                <option>Special Event</option>
                <option>Prayer Meeting</option>
                <option>Bible Study</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <input value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} placeholder="09:00 AM" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Date *</label>
            <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description..." style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave}><Icon name="check" size={15} color="white" />{editing ? 'Update' : 'Create Service'}</button>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmModal title="Delete Service" message={`Delete "${deleteTarget.name}"? All attendance records for this service will also be affected.`}
          onConfirm={async () => {
            try {
              await servicesAPI.delete(deleteTarget._id);
              setServices(prev => prev.filter(s => s._id !== deleteTarget._id));
              showToast('Service deleted', 'success');
              setDeleteTarget(null);
            } catch (error) {
              const errorMsg = error.response?.data?.message || 'Failed to delete service';
              showToast(errorMsg, 'error');
            }
          }}
          onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}

// ─── REPORTS PAGE ─────────────────────────────────────────────────────────────
function ReportsPage({ members, visitors, attendance, services }) {
  const [period, setPeriod] = useState('weekly');

  const totalAttendance = attendance.length;
  const memberAttendance = attendance.filter(a => a.attendeeType === 'member').length;
  const visitorAttendance = attendance.filter(a => a.attendeeType === 'visitor').length;
  const avgPerService = services.length ? Math.round(totalAttendance / services.length) : 0;

  // Member attendance frequency
  const memberFreq = members.map(m => ({
    ...m,
    count: attendance.filter(a => a.attendeeId === m._id && a.attendeeType === 'member').length
  })).sort((a, b) => b.count - a.count).slice(0, 8);

  // Visitor repeat stats
  const repeatVisitors = visitors.filter(v => v.visitCount >= 2).length;
  const conversionRate = visitors.length ? Math.round((repeatVisitors / visitors.length) * 100) : 0;

  // Service breakdown
  const serviceStats = services.map(s => ({
    ...s,
    count: attendance.filter(a => a.serviceId === s._id).length,
    members: attendance.filter(a => a.serviceId === s._id && a.attendeeType === 'member').length,
    visitors: attendance.filter(a => a.serviceId === s._id && a.attendeeType === 'visitor').length,
  }));

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade">
      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <StatCard label="Total Attendance" value={totalAttendance} icon="attendance" color="blue" />
        <StatCard label="Member Check-ins" value={memberAttendance} icon="members" color="green" />
        <StatCard label="Visitor Check-ins" value={visitorAttendance} icon="visitors" color="amber" />
        <StatCard label="Avg per Service" value={avgPerService} icon="trending" color="purple" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Visitor insights */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 20 }}>Visitor Insights</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--blue-50)', borderRadius: 10 }}>
              <span style={{ fontSize: 14, color: 'var(--slate-600)' }}>Total Visitors</span>
              <span style={{ fontWeight: 700, color: 'var(--blue-700)' }}>{visitors.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--green-50)', borderRadius: 10 }}>
              <span style={{ fontSize: 14, color: 'var(--slate-600)' }}>Repeat Visitors (2+)</span>
              <span style={{ fontWeight: 700, color: 'var(--green-700)' }}>{repeatVisitors}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--amber-50)', borderRadius: 10 }}>
              <span style={{ fontSize: 14, color: 'var(--slate-600)' }}>Retention Rate</span>
              <span style={{ fontWeight: 700, color: 'var(--amber-600)' }}>{conversionRate}%</span>
            </div>
          </div>
        </div>

        {/* Top attendees */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 20 }}>Top Faithful Members</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {memberFreq.slice(0, 5).map((m, i) => (
              <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: i < 3 ? 'var(--blue-100)' : 'var(--slate-100)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
                  color: i < 3 ? 'var(--blue-700)' : 'var(--slate-500)', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <Avatar name={m.fullName} size={28} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{m.fullName}</div>
                  <div style={{ fontSize: 11, color: 'var(--slate-400)' }}>{m.department}</div>
                </div>
                <span className="badge badge-blue">{m.count}x</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service attendance table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 600, fontSize: 16 }}>Service Attendance Breakdown</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead><tr><th>Service</th><th>Type</th><th>Date</th><th>Members</th><th>Visitors</th><th>Total</th></tr></thead>
            <tbody>
              {serviceStats.map(s => (
                <tr key={s._id} className="row-hover">
                  <td style={{ fontWeight: 500 }}>{s.name}</td>
                  <td><span className={`badge ${serviceTypeColors[s.type] || 'badge-slate'}`}>{s.type}</span></td>
                  <td style={{ fontSize: 13, color: 'var(--slate-500)' }}>{new Date(s.date).toLocaleDateString('en-GH')}</td>
                  <td style={{ fontWeight: 600, color: 'var(--blue-600)' }}>{s.members}</td>
                  <td style={{ fontWeight: 600, color: 'var(--green-600)' }}>{s.visitors}</td>
                  <td style={{ fontWeight: 700 }}>{s.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────
function SettingsPage({ users, setUsers, showToast, currentUser }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'usher', phone: '', isActive: true });

  const openAdd = () => { setEditing(null); setForm({ name: '', email: '', role: 'usher', phone: '', isActive: true }); setShowModal(true); };
  const openEdit = (u) => { setEditing(u); setForm({ name: u.name, email: u.email, role: u.role, phone: u.phone, isActive: u.isActive }); setShowModal(true); };

  const handleSave = () => {
    if (!form.name || !form.email) return;
    if (editing) {
      setUsers(prev => prev.map(u => u.id === editing.id ? { ...u, ...form } : u));
      showToast('User updated', 'success');
    } else {
      const newId = Math.max(...users.map(u => u.id)) + 1;
      setUsers(prev => [...prev, { id: newId, ...form }]);
      showToast('User added', 'success');
    }
    setShowModal(false);
  };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade">
      {/* Church info card */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>Church Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Church Name</label>
            <input defaultValue="Heavenly Church Ghana" />
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input defaultValue="Accra, Ghana" />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input defaultValue="+233 24 000 0000" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input defaultValue="info@heavenly.gh" />
          </div>
        </div>
        <button className="btn-primary" onClick={() => showToast('Settings saved', 'success')} style={{ marginTop: 8 }}>
          <Icon name="check" size={15} color="white" /> Save Settings
        </button>
      </div>

      {/* User management */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--slate-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 600, fontSize: 16 }}>User Management</h3>
          <button className="btn-primary" onClick={openAdd}><Icon name="plus" size={15} color="white" />Add User</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Phone</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="row-hover">
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={u.name} size={32} />
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--slate-500)' }}>{u.email}</td>
                  <td><span className={`badge ${roleColors[u.role]}`}>{u.role}</span></td>
                  <td>{u.phone}</td>
                  <td><span className={`badge ${u.isActive ? 'badge-green' : 'badge-slate'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <button onClick={() => openEdit(u)} style={{ background: 'var(--blue-50)', border: 'none', borderRadius: 7, padding: '6px 8px', cursor: 'pointer', color: 'var(--blue-600)' }}><Icon name="edit" size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit User' : 'Add User'} onClose={() => setShowModal(false)}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Full name" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="0244000000" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@heavenly.gh" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Role</label>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                <option value="admin">Admin</option>
                <option value="leader">Church Leader</option>
                <option value="usher">Usher</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select value={form.isActive ? 'active' : 'inactive'} onChange={e => setForm(p => ({ ...p, isActive: e.target.value === 'active' }))}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave}><Icon name="check" size={15} color="white" />{editing ? 'Update' : 'Add User'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── PAGE CONFIG ──────────────────────────────────────────────────────────────
const pageConfig = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview of church attendance' },
  members: { title: 'Members', subtitle: 'Manage congregation members' },
  visitors: { title: 'Visitors', subtitle: 'Track and manage visitors' },
  attendance: { title: 'Attendance', subtitle: 'Quick check-in system' },
  services: { title: 'Services & Events', subtitle: 'Manage services and events' },
  reports: { title: 'Reports & Analytics', subtitle: 'Insights and statistics' },
  settings: { title: 'Settings', subtitle: 'System and user management' },
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
// Helper to get initial user from localStorage (prevents login flash on refresh)
const getInitialUser = () => {
  try {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
};

export default function App() {
  const [user, setUser] = useState(getInitialUser);
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const [members, setMembers] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState(sampleUsers);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // Load data when user logs in
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [membersRes, visitorsRes, servicesRes] = await Promise.all([
          membersAPI.getAll(),
          visitorsAPI.getAll(),
          servicesAPI.getAll(),
        ]);

        setMembers(membersRes.data.members || []);
        setVisitors(visitorsRes.data || []);
        setServices(servicesRes.data || []);
        
        // Load attendance for all services
        if (servicesRes.data && servicesRes.data.length > 0) {
          const attendancePromises = servicesRes.data.map(s => 
            attendanceAPI.getByService(s._id).catch(() => ({ data: [] }))
          );
          const attendanceData = await Promise.all(attendancePromises);
          const allAttendance = attendanceData.flatMap((res, idx) => 
            (res.data || []).map(a => ({
              ...a,
              id: a._id,
              serviceId: servicesRes.data[idx]._id,
              // Normalize member/visitor data
              name: a.memberId?.fullName || a.visitorId?.fullName || 'Unknown',
              attendeeId: a.memberId?._id || a.visitorId?._id,
              department: a.memberId?.department || '-',
              membershipId: a.memberId?.membershipId || 'Visitor',
              checkinTime: a.checkinTime || new Date().toISOString(),
            }))
          );
          setAttendance(allAttendance);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        showToast('Failed to load data. Using sample data.', 'error');
        // Fallback to sample data on error
        setMembers(sampleMembers);
        setVisitors(sampleVisitors);
        setServices(sampleServices);
        setAttendance(sampleAttendance);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, showToast]);

  if (!user) return <><GlobalStyles /><LoginPage onLogin={setUser} members={members} visitors={visitors} services={services} /></>;

  const config = pageConfig[page] || pageConfig.dashboard;

  return (
    <AppContext.Provider value={{ user, showToast }}>
      <GlobalStyles />
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar currentPage={page} setPage={setPage} user={user} onLogout={() => { setUser(null); localStorage.clear(); }} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <TopBar title={config.title} subtitle={config.subtitle} onMenuToggle={() => setSidebarOpen(true)} />
          <main style={{ flex: 1, overflowY: 'auto', background: 'var(--slate-50)' }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--slate-500)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, marginBottom: 8 }}>Loading...</div>
                  <div style={{ fontSize: 13 }}>Fetching latest data</div>
                </div>
              </div>
            ) : (
              <>
                {page === 'dashboard' && <DashboardPage members={members} visitors={visitors} attendance={attendance} services={services} user={user} />}
                {page === 'members' && <MembersPage members={members} setMembers={setMembers} showToast={showToast} user={user} />}
                {page === 'visitors' && <VisitorsPage visitors={visitors} setVisitors={setVisitors} members={members} showToast={showToast} />}
                {page === 'attendance' && <AttendancePage attendance={attendance} setAttendance={setAttendance} members={members} visitors={visitors} services={services} setServices={setServices} showToast={showToast} user={user} />}
                {page === 'services' && <ServicesPage services={services} setServices={setServices} attendance={attendance} showToast={showToast} user={user} />}
                {page === 'reports' && <ReportsPage members={members} visitors={visitors} attendance={attendance} services={services} />}
                {page === 'settings' && user?.role === 'admin' && <SettingsPage users={users} setUsers={setUsers} showToast={showToast} currentUser={user} />}
              </>
            )}
          </main>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AppContext.Provider>
  );
}
