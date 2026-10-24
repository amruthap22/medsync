import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Search,
  Mic,
  Volume2,
  VolumeX,
  Plus,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  X,
  ShieldCheck,
} from './Icons';

export default function Topbar({
  activeTab,
  currentUser,
  notifications = [],
  onMarkNotificationRead,
  voiceAssistantState = 'idle',
  onStartVoiceAssistant,
  isAudioMuted = false,
  onToggleAudioMute,
  onQuickBookAppointment,
  onSearchQuery,
  onOpenEmergencyModal,
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read_status).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearchQuery) {
      onSearchQuery(searchVal);
    }
  };

  return (
    <header className="medisync-topbar">
      <div className="topbar-left">
        <div className="topbar-title-block">
          <span className="topbar-eyebrow">
            MedSync Clinical Care &bull; {currentUser?.role === 'doctor' ? 'Practitioner Hub' : 'Patient Portal'}
          </span>
          <h1 className="topbar-title">{activeTab}</h1>
        </div>

        {/* Global Search */}
        <form className="topbar-search-form" onSubmit={handleSearchSubmit}>
          <Search width={16} height={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search anything..."
            value={searchVal}
            onChange={(e) => {
              setSearchVal(e.target.value);
              if (onSearchQuery) onSearchQuery(e.target.value);
            }}
          />
        </form>
      </div>

      <div className="topbar-right">
        {/* Quick Emergency Medical ID (SOS) Access */}
        {currentUser?.role !== 'doctor' && onOpenEmergencyModal && (
          <button
            type="button"
            className="topbar-emergency-pill"
            onClick={onOpenEmergencyModal}
            title="Open Emergency Medical ID Card & Scannable QR Code"
          >
            <ShieldCheck width={15} height={15} />
            <span>SOS ID</span>
          </button>
        )}

        {/* Global Voice Assistant Pill */}
        <button
          type="button"
          className={`voice-assistant-badge ${voiceAssistantState === 'listening' ? 'listening' : ''} ${voiceAssistantState === 'speaking' ? 'speaking' : ''}`}
          onClick={onStartVoiceAssistant}
          title="Click to speak voice commands or ask clinical questions"
        >
          <Mic width={16} height={16} />
          <span>
            {voiceAssistantState === 'listening'
              ? 'Listening...'
              : voiceAssistantState === 'speaking'
              ? 'Speaking...'
              : 'Voice Assistant'}
          </span>
          {voiceAssistantState === 'listening' && (
            <div className="voice-live-waves">
              <span /><span /><span />
            </div>
          )}
        </button>

        {/* Speech Audio Mute Toggle */}
        <button
          type="button"
          className="topbar-icon-button"
          onClick={onToggleAudioMute}
          title={isAudioMuted ? 'Turn Audio Readout ON' : 'Mute Audio Readout'}
          aria-label="Toggle Audio Mute"
        >
          {isAudioMuted ? <VolumeX width={18} height={18} /> : <Volume2 width={18} height={18} />}
        </button>

        {/* Notifications Bell & Dropdown */}
        <div className="topbar-notifications-wrapper" ref={dropdownRef}>
          <button
            type="button"
            className="topbar-icon-button relative"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            title="Care Notifications"
            aria-label="Care Notifications"
          >
            <Bell width={18} height={18} />
            {unreadCount > 0 && <span className="notification-badge-counter">{unreadCount}</span>}
          </button>

          {notificationsOpen && (
            <div className="notifications-dropdown-menu">
              <div className="notifications-header">
                <div className="flex-row items-center gap-2">
                  <strong>Care Notifications</strong>
                  <span className="notif-pill">{unreadCount} new</span>
                </div>
                <button
                  type="button"
                  className="close-dropdown-btn"
                  onClick={() => setNotificationsOpen(false)}
                >
                  <X width={16} height={16} />
                </button>
              </div>

              <div className="notifications-list">
                {notifications.length === 0 ? (
                  <div className="notifications-empty">No new notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`notification-item ${notif.read_status ? 'read' : 'unread'}`}
                    >
                      <div className="notification-icon">
                        {notif.type === 'alert' ? (
                          <AlertTriangle width={16} height={16} className="text-amber" />
                        ) : notif.type === 'appointment' ? (
                          <Calendar width={16} height={16} className="text-blue" />
                        ) : (
                          <Clock width={16} height={16} className="text-teal" />
                        )}
                      </div>
                      <div className="notification-content">
                        <strong>{notif.title}</strong>
                        <p>{notif.message}</p>
                        <span className="notification-time">{notif.created_at || 'Recently'}</span>
                      </div>
                      {!notif.read_status && (
                        <button
                          type="button"
                          className="mark-read-btn"
                          onClick={() => onMarkNotificationRead && onMarkNotificationRead(notif.id)}
                          title="Mark as read"
                        >
                          <CheckCircle2 width={15} height={15} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Action Button */}
        <button
          type="button"
          className="topbar-action-btn"
          onClick={onQuickBookAppointment}
        >
          <Plus width={16} height={16} />
          <span>Book Visit</span>
        </button>

        {/* User Pill */}
        <div className="topbar-user-pill">
          <div className="user-pill-avatar">
            {currentUser?.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-pill-details">
            <span className="user-pill-name">{currentUser?.full_name || (currentUser?.role === 'doctor' ? 'Dr. Priya Sharma' : 'Amrutha')}</span>
            <span className="user-pill-role">
              {currentUser?.role === 'doctor' ? 'Doctor' : 'Patient'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
