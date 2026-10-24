import React from 'react';
import iconSvg from '../assets/medisync-icon.svg';
import {
  LayoutDashboard,
  Pill,
  Calendar,
  Users,
  FileText,
  MessageSquare,
  MapPin,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Search,
} from './Icons';

export const NAVIGATION_TABS = [
  { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'My Medications', label: 'Medications', icon: Pill },
  { id: 'Nearby Doctors', label: 'Find Doctors', icon: MapPin },
  { id: 'Appointments', label: 'Appointments', icon: Calendar },
  { id: 'Health Records', label: 'Medical Records', icon: FileText },
  { id: 'Messages', label: 'Messages', icon: MessageSquare },
  { id: 'AI Chatbot', label: 'AI Chatbot', icon: Bot },
  { id: 'Settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  currentUser,
  onLogout,
  unreadMessagesCount = 0,
  upcomingAppointmentsCount = 0,
}) {
  const isDoctor = currentUser?.role === 'doctor';
  const user = currentUser || { full_name: isDoctor ? 'Dr. Priya Sharma' : 'Amrutha', role: isDoctor ? 'doctor' : 'patient' };

  return (
    <aside className={`medisync-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand-wrapper">
        <div className="sidebar-brand-block" onClick={() => setActiveTab('Dashboard')}>
          <div className="sidebar-brand-logo">
            <img src={iconSvg} alt="MedSync Logo" />
          </div>
          {!collapsed && (
            <div className="sidebar-brand-text">
              <h2>MedSync</h2>
              <span className="brand-tagline">Better Coordination. Healthier Tomorrow.</span>
            </div>
          )}
        </div>
        <button
          type="button"
          className="sidebar-collapse-toggle"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label="Toggle sidebar collapse"
        >
          {collapsed ? <ChevronRight width={18} height={18} /> : <ChevronLeft width={18} height={18} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">{!collapsed && (user.role === 'doctor' ? 'PRACTITIONER HUB' : 'CLINICAL PORTAL')}</div>
        {(user.role === 'doctor'
          ? [
              { id: 'Dashboard', label: 'Doctor Hub', icon: LayoutDashboard },
              { id: 'Patient Lookup', label: 'Patient Lookup by ID', icon: Search },
              { id: 'Appointments', label: 'Appointments', icon: Calendar },
              { id: 'Messages', label: 'Patient Messages', icon: MessageSquare },
              { id: 'Nearby Doctors', label: 'Clinics Radar', icon: MapPin },
              { id: 'AI Chatbot', label: 'MediAssist AI', icon: Bot },
              { id: 'Settings', label: 'Settings', icon: Settings },
            ]
          : NAVIGATION_TABS
        ).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          let badgeCount = 0;
          if (item.id === 'Messages') badgeCount = unreadMessagesCount;
          if (item.id === 'Appointments') badgeCount = upcomingAppointmentsCount;

          return (
            <button
              key={item.id}
              type="button"
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              title={collapsed ? item.label : undefined}
            >
              <span className="nav-icon-box">
                <Icon width={20} height={20} />
              </span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
              {!collapsed && badgeCount > 0 && (
                <span className="nav-badge-pill">{badgeCount}</span>
              )}
              {collapsed && badgeCount > 0 && (
                <span className="nav-badge-dot" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Care Support Card (When expanded) */}
      {!collapsed && (
        <div className="sidebar-support-card">
          <div className="support-badge">
            <ShieldCheck width={16} height={16} />
            <span>MedSync Guard 24/7</span>
          </div>
          <p>Care team adherence coordination active.</p>
        </div>
      )}

      {/* User Footer Profile */}
      <div className="sidebar-user-footer">
        <div className="sidebar-avatar" onClick={() => setActiveTab('Settings')} title="View profile settings">
          {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
        </div>
        {!collapsed && (
          <div className="sidebar-user-meta" onClick={() => setActiveTab('Settings')}>
            <span className="sidebar-user-name">{user.full_name || (user.role === 'doctor' ? 'Dr. Priya Sharma' : 'Amrutha')}</span>
            <span className="sidebar-user-role">
              {user.role === 'doctor' ? 'Doctor' : 'Patient'}
            </span>
          </div>
        )}
        {!collapsed && (
          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={onLogout}
            title="Log out of MedSync"
          >
            Exit
          </button>
        )}
      </div>
    </aside>
  );
}
