import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Volume2,
  VolumeX,
  Bell,
  HeartPulse,
  Copy,
  Share2,
  User,
  HelpCircle,
} from './Icons';

export default function SettingsTab({
  currentUser,
  isAudioMuted = false,
  onToggleAudioMute,
  onUpdateProfile,
}) {
  const [activeMenu, setActiveMenu] = useState('profile'); // 'profile' | 'notifications' | 'security' | 'privacy' | 'help'
  const [isEditing, setIsEditing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  const patientId = currentUser?.patient_id || 'MED-P-7K92X';
  const [profile, setProfile] = useState({
    full_name: currentUser?.full_name || 'Amrutha',
    email: currentUser?.email || 'amrutha@medsync.care',
    phone: currentUser?.phone || '+91 98765 43210',
    dob: '15 Jan 2000',
    blood_group: currentUser?.blood_group || 'O+',
    city: currentUser?.city || 'Bengaluru',
    emergency_contact: currentUser?.emergency_contact || '+91 91234 56789 (Sister)',
  });

  const [notifications, setNotifications] = useState({
    doseReminders: true,
    refillAlerts: true,
    appointmentAlerts: true,
    doctorMessages: true,
  });

  const handleCopyId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(patientId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
      setToastMessage(`✓ Patient ID "${patientId}" copied!`);
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsEditing(false);
    if (onUpdateProfile) onUpdateProfile(profile);
    setToastMessage('✓ Profile information updated successfully.');
    setTimeout(() => setToastMessage(''), 3500);
  };

  return (
    <div className="medisync-settings-tab-container">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="tab-floating-toast">
          <span>{toastMessage}</span>
          <button type="button" onClick={() => setToastMessage('')}>✕</button>
        </div>
      )}

      <div className="settings-layout-grid">
        {/* Left Settings Sidebar Menu */}
        <div className="dash-panel-card settings-menu-panel">
          <nav className="settings-nav-list">
            <button
              type="button"
              className={`settings-nav-item ${activeMenu === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveMenu('profile')}
            >
              <User width={18} height={18} />
              <span>Profile</span>
            </button>
            <button
              type="button"
              className={`settings-nav-item ${activeMenu === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveMenu('notifications')}
            >
              <Bell width={18} height={18} />
              <span>Notifications</span>
            </button>
            <button
              type="button"
              className={`settings-nav-item ${activeMenu === 'security' ? 'active' : ''}`}
              onClick={() => setActiveMenu('security')}
            >
              <Lock width={18} height={18} />
              <span>Security</span>
            </button>
            <button
              type="button"
              className={`settings-nav-item ${activeMenu === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveMenu('privacy')}
            >
              <ShieldCheck width={18} height={18} />
              <span>Privacy &amp; Consent</span>
            </button>
            <button
              type="button"
              className={`settings-nav-item ${activeMenu === 'help' ? 'active' : ''}`}
              onClick={() => setActiveMenu('help')}
            >
              <HelpCircle width={18} height={18} />
              <span>Help &amp; Support</span>
            </button>
          </nav>
        </div>

        {/* Right Settings Content Card (Matching Screen 11) */}
        <div className="dash-panel-card settings-content-panel">
          {activeMenu === 'profile' && (
            <div className="settings-profile-content">
              {/* Profile Card Header */}
              <div className="settings-profile-top">
                <div className="profile-avatar-wrap">
                  <div className="profile-avatar-large">
                    {profile.full_name ? profile.full_name.charAt(0) : 'A'}
                  </div>
                  <div className="profile-identity">
                    <h3>{profile.full_name}</h3>
                    <div className="patient-id-inline-badge">
                      <span>Patient ID: <strong>{patientId}</strong></span>
                      <button
                        type="button"
                        className="btn-copy-inline"
                        onClick={handleCopyId}
                        title="Copy Patient ID"
                      >
                        <Copy width={12} height={12} />
                        <span>{copiedId ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-edit-profile-action"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {/* Profile Details Grid */}
              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="settings-edit-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Emergency Contact</label>
                    <input
                      type="text"
                      value={profile.emergency_contact}
                      onChange={(e) => setProfile({ ...profile, emergency_contact: e.target.value })}
                    />
                  </div>
                  <div className="modal-actions" style={{ marginTop: '16px' }}>
                    <button type="submit" style={{ background: '#0284c7', color: '#fff', padding: '10px 18px', borderRadius: '8px' }}>
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-details-grid">
                  <div className="detail-item-box">
                    <span className="detail-label">Email</span>
                    <strong className="detail-value">{profile.email}</strong>
                  </div>

                  <div className="detail-item-box">
                    <span className="detail-label">Phone</span>
                    <strong className="detail-value">{profile.phone}</strong>
                  </div>

                  <div className="detail-item-box">
                    <span className="detail-label">Date of Birth</span>
                    <strong className="detail-value">{profile.dob}</strong>
                  </div>

                  <div className="detail-item-box">
                    <span className="detail-label">Blood Group</span>
                    <strong className="detail-value text-red">{profile.blood_group}</strong>
                  </div>

                  <div className="detail-item-box detail-span-full">
                    <span className="detail-label">Emergency Contact</span>
                    <strong className="detail-value">{profile.emergency_contact}</strong>
                  </div>
                </div>
              )}

              {/* Consent & Access Manager Footer */}
              <div className="profile-consent-card-footer">
                <div className="consent-footer-meta">
                  <ShieldCheck width={20} height={20} className="text-emerald" />
                  <div>
                    <strong>Consent &amp; Access Controls</strong>
                    <p>Manage which attending doctors can access your prescriptions and history.</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-consent-access"
                  onClick={() => {
                    setToastMessage('✓ Consent access status: Active & Encrypted with Dr. Priya Sharma.');
                    setTimeout(() => setToastMessage(''), 3500);
                  }}
                >
                  Consent &amp; Access
                </button>
              </div>
            </div>
          )}

          {activeMenu === 'notifications' && (
            <div className="settings-sub-pane">
              <h3>Notification Preferences</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '18px' }}>
                Control reminders, refill alerts, and doctor messages.
              </p>
              <div className="settings-toggles-list">
                {Object.keys(notifications).map((k) => (
                  <label key={k} className="settings-toggle-row">
                    <span style={{ textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}</span>
                    <input
                      type="checkbox"
                      checked={notifications[k]}
                      onChange={() => setNotifications({ ...notifications, [k]: !notifications[k] })}
                      style={{ width: '18px', height: '18px', accentColor: '#0284c7' }}
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeMenu === 'security' && (
            <div className="settings-sub-pane">
              <h3>Security &amp; Encryption</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '18px' }}>
                Your account is protected by HIPAA &amp; FHIR encryption standards.
              </p>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '12px' }}>
                <strong style={{ color: '#15803d' }}>✓ Two-Factor Authentication Active</strong>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#166534' }}>
                  Secure session token valid. All doctor access requests require cryptographic patient consent.
                </p>
              </div>
            </div>
          )}

          {activeMenu === 'privacy' && (
            <div className="settings-sub-pane">
              <h3>Privacy &amp; Data Consent</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '18px' }}>
                MedSync does not share your health records with third parties without explicit authorization.
              </p>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px' }}>
                <strong>Authorized Practitioners:</strong>
                <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#475569' }}>
                  • Dr. Priya Sharma (General Physician)<br />
                  • Dr. Rahul Menon (Cardiologist)
                </p>
              </div>
            </div>
          )}

          {activeMenu === 'help' && (
            <div className="settings-sub-pane">
              <h3>Help &amp; Support</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '18px' }}>
                Need assistance with medication schedules or appointment bookings?
              </p>
              <p>Email: <strong>support@medsync.care</strong><br />Toll-free: <strong>1800-MED-SYNC (24/7)</strong></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
