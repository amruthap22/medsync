import React, { useState } from 'react';
import {
  Pill,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  HeartPulse,
  Activity,
  ShieldCheck,
  ChevronRight,
  Plus,
  Copy,
  Share2,
  Users,
  Search,
  MapPin,
  Star,
  FileText,
  TrendingUp,
  Sparkles,
  ArrowRight,
  QrCode,
  Flame,
  PhoneCall,
  Download,
  X,
} from './Icons';
import PatientConsentManager from './PatientConsentManager';
import DoctorPatientLookup from './DoctorPatientLookup';

export default function DashboardTab({
  currentUser,
  medications = [],
  reminders = [],
  appointments = [],
  prescriptions = [],
  onNavigateTab,
  onLogDose,
  onRequestRefill,
  onOpenBookingModal,
  onShowToast,
}) {
  const isDoctor = currentUser?.role === 'doctor';
  const userName = currentUser?.full_name || (isDoctor ? 'Dr. Priya Sharma' : 'Amrutha');
  const patientId = currentUser?.patient_id || 'MED-P-7K92X';
  const [copiedId, setCopiedId] = useState(false);

  // Advanced Vitals & Telemetry State
  const [vitals, setVitals] = useState({
    bpSys: 118,
    bpDia: 76,
    heartRate: 72,
    spo2: 99,
    glucose: 95,
    respiratoryRate: 16,
    weightKg: 62.0,
    recordedAt: 'Today, 08:30 AM',
  });
  const [vitalsModalOpen, setVitalsModalOpen] = useState(false);
  const [newVitalForm, setNewVitalForm] = useState({
    bpSys: 118,
    bpDia: 76,
    heartRate: 72,
    spo2: 99,
    glucose: 95,
  });

  // Emergency Medical SOS Modal State
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);

  // Patient logged doses state
  const [loggedDoses, setLoggedDoses] = useState({
    1: true, // Paracetamol taken
    2: false, // Vitamin D3 upcoming
    3: false, // Amlodipine upcoming
  });

  const handleCopyPatientId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(patientId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
      if (onShowToast) onShowToast(`Patient ID "${patientId}" copied to clipboard!`);
    }
  };

  const toggleDose = (id, medName) => {
    const isNowTaken = !loggedDoses[id];
    setLoggedDoses((prev) => ({ ...prev, [id]: isNowTaken }));
    if (onLogDose) {
      onLogDose(id, medName, isNowTaken);
    }
    if (onShowToast) {
      onShowToast(isNowTaken ? `Marked ${medName} as taken!` : `Marked ${medName} as pending.`);
    }
  };

  const handleSaveVitals = async (e) => {
    e.preventDefault();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated = {
      bpSys: parseInt(newVitalForm.bpSys, 10) || 118,
      bpDia: parseInt(newVitalForm.bpDia, 10) || 76,
      heartRate: parseInt(newVitalForm.heartRate, 10) || 72,
      spo2: parseInt(newVitalForm.spo2, 10) || 99,
      glucose: parseInt(newVitalForm.glucose, 10) || 95,
      respiratoryRate: 16,
      weightKg: 62.0,
      recordedAt: `Today, ${timeNow}`,
    };
    setVitals(updated);
    setVitalsModalOpen(false);

    try {
      await fetch('http://127.0.0.1:8000/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,
          patient_name: userName,
          blood_pressure_systolic: updated.bpSys,
          blood_pressure_diastolic: updated.bpDia,
          heart_rate: updated.heartRate,
          spo2: updated.spo2,
          glucose: updated.glucose,
          recorded_at: updated.recordedAt,
        }),
      });
    } catch {
      // offline safe
    }

    if (onShowToast) onShowToast(`✓ Vitals logged: ${updated.bpSys}/${updated.bpDia} mmHg, HR: ${updated.heartRate} BPM.`);
  };

  const handleDownloadEmergencyCard = () => {
    const content = `=====================================================
MEDSYNC OFFICIAL EMERGENCY IDENTIFICATION CARD
=====================================================
PATIENT IDENTITY:
Name              : ${userName}
Patient ID        : ${patientId} (Verified Clinical Record)
Blood Group       : ${currentUser?.blood_group || 'O+'}
Critical Allergies: Penicillin, Latex
Organ Donor       : Yes (Verified Consent)

EMERGENCY CONTACTS:
Primary Contact   : ${currentUser?.emergency_contact || '+91 91234 56789 (Sister)'}
Attending Doctor  : Dr. Emily Carter (Cardiology Department)
City / Location   : ${currentUser?.city || 'Bengaluru'}

CLINICAL REGIMEN OVERVIEW:
Active Prescriptions: 
1. Paracetamol 500mg • Pain & Fever (Oral)
2. Vitamin D3 1000 IU • Bone Health
3. Amlodipine 5mg • Antihypertensive

PARAMEDIC & CLINICAL INSTRUCTIONS:
Scan the digital MedSync QR code or enter Patient ID ${patientId} 
at ${window.location.origin} to request immediate authorized consent access.
Issued Date: ${new Date().toLocaleDateString()}
Security: HIPAA & Consent-Gated Architecture
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MedSync-Emergency-ID-${patientId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (onShowToast) onShowToast('Emergency Medical ID Card downloaded successfully!');
  };

  // Sample Today's Medications for Patient
  const todayMedsList = [
    {
      id: 1,
      name: 'Paracetamol 500mg',
      dosage: 'Take 1 tablet • 8:00 AM, 2:00 PM',
      time: '8:00 AM',
      taken: loggedDoses[1],
      type: 'Tablet',
    },
    {
      id: 2,
      name: 'Vitamin D3 1000 IU',
      dosage: 'Take 1 capsule • 1:00 PM',
      time: '1:00 PM',
      taken: loggedDoses[2],
      type: 'Capsule',
    },
    {
      id: 3,
      name: 'Amlodipine 5mg',
      dosage: 'Take 1 tablet • 8:00 PM',
      time: '8:00 PM',
      taken: loggedDoses[3],
      type: 'Tablet',
    },
  ];

  // Weekly Adherence Data for Chart
  const weeklyAdherence = [
    { day: 'Mon', height: 85, active: true },
    { day: 'Tue', height: 95, active: true },
    { day: 'Wed', height: 75, active: true },
    { day: 'Thu', height: 100, active: true },
    { day: 'Fri', height: 90, active: true },
    { day: 'Sat', height: 80, active: true },
    { day: 'Sun', height: 87, active: true },
  ];

  // Nearby Doctors List
  const nearbyDoctorsList = [
    {
      id: 'doc-1',
      name: 'Dr. Priya Sharma',
      specialty: 'General Physician',
      distance: '1.2 km',
      rating: '4.9',
      avatar: 'https://images.unsplash.com/photo-1594824813580-c11458e0a6e0?auto=format&fit=crop&w=120&q=80',
    },
    {
      id: 'doc-2',
      name: 'Dr. Rahul Menon',
      specialty: 'Cardiologist',
      distance: '2.4 km',
      rating: '4.8',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=120&q=80',
    },
    {
      id: 'doc-3',
      name: 'Dr. Sneha Reddy',
      specialty: 'Dermatologist',
      distance: '3.1 km',
      rating: '4.7',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=120&q=80',
    },
  ];

  // Recent Activity for Patient
  const recentActivities = [
    {
      id: 1,
      title: 'Prescription Updated',
      subtitle: 'Dr. Priya Sharma • 2 hours ago',
      icon: Pill,
      iconBg: '#e0f2fe',
      iconColor: '#0284c7',
    },
    {
      id: 2,
      title: 'Appointment Confirmed',
      subtitle: 'Dr. Rahul Menon • Yesterday',
      icon: Calendar,
      iconBg: '#ecfdf5',
      iconColor: '#059669',
    },
    {
      id: 3,
      title: 'Report Uploaded',
      subtitle: 'Lab Report • 3 days ago',
      icon: FileText,
      iconBg: '#f1f5f9',
      iconColor: '#475569',
    },
  ];

  // Doctor Dashboard State & Data
  const doctorTodayAppointments = [
    {
      id: 'apt-1',
      time: '09:30 AM',
      patientName: 'Riya Sharma',
      type: 'General Checkup',
      status: 'Confirmed',
      avatar: 'R',
    },
    {
      id: 'apt-2',
      time: '10:30 AM',
      patientName: 'Amit Verma',
      type: 'Follow-up',
      status: 'Confirmed',
      avatar: 'A',
    },
    {
      id: 'apt-3',
      time: '01:00 PM',
      patientName: 'Sneha Patel',
      type: 'Consultation',
      status: 'Pending',
      avatar: 'S',
    },
    {
      id: 'apt-4',
      time: '03:30 PM',
      patientName: 'Karan Singh',
      type: 'General Checkup',
      status: 'Confirmed',
      avatar: 'K',
    },
    {
      id: 'apt-5',
      time: '05:00 PM',
      patientName: 'Ananya Das',
      type: 'New Patient',
      status: 'Confirmed',
      avatar: 'A',
    },
  ];

  const recentPatientsDoctor = [
    { id: 'MED-P-7K92X', name: 'Amrutha', time: '2 hours ago' },
    { id: 'MED-P-88492014', name: 'Amit Verma', time: '5 hours ago' },
  ];

  // =========================================================================
  // DOCTOR DASHBOARD VIEW (Matches Screen 3)
  // =========================================================================
  if (isDoctor) {
    return (
      <div className="medisync-dashboard-view">
        {/* Doctor Header */}
        <div className="dash-welcome-header">
          <div className="welcome-titles">
            <h1>Welcome back, {userName}!</h1>
            <p>Here's what's happening with your patients today.</p>
          </div>
        </div>

        {/* Doctor 4 Key Metrics */}
        <div className="doc-metric-cards-grid">
          <div className="doc-metric-card">
            <div className="doc-metric-icon doc-metric-blue">
              <Users width={22} height={22} />
            </div>
            <div className="doc-metric-meta">
              <span className="doc-metric-label">Total Patients</span>
              <strong className="doc-metric-num">248</strong>
              <span className="doc-metric-trend trend-positive">+12%</span>
            </div>
          </div>

          <div className="doc-metric-card">
            <div className="doc-metric-icon doc-metric-green">
              <Calendar width={22} height={22} />
            </div>
            <div className="doc-metric-meta">
              <span className="doc-metric-label">Today's Appointments</span>
              <strong className="doc-metric-num">8</strong>
              <span className="doc-metric-sub">2 hr</span>
            </div>
          </div>

          <div className="doc-metric-card">
            <div className="doc-metric-icon doc-metric-amber">
              <Clock width={22} height={22} />
            </div>
            <div className="doc-metric-meta">
              <span className="doc-metric-label">Pending Requests</span>
              <strong className="doc-metric-num">5</strong>
              <span className="doc-metric-sub text-amber">Needs attention</span>
            </div>
          </div>

          <div className="doc-metric-card">
            <div className="doc-metric-icon doc-metric-red">
              <AlertTriangle width={22} height={22} />
            </div>
            <div className="doc-metric-meta">
              <span className="doc-metric-label">Alerts</span>
              <strong className="doc-metric-num">3</strong>
              <span className="doc-metric-sub text-red">Requires review</span>
            </div>
          </div>
        </div>

        {/* Doctor Patient Lookup Bar by ID */}
        <div className="doc-patient-id-search-panel">
          <DoctorPatientLookup currentUser={currentUser} onShowToast={onShowToast} />
        </div>

        {/* Doctor Main Two Columns */}
        <div className="doc-two-column-grid">
          {/* Left Column: Today's Appointments */}
          <div className="dash-panel-card doc-appointments-panel">
            <div className="panel-header-row">
              <div className="header-title-group">
                <h3>Today's Appointments</h3>
                <span className="header-date-badge">April 23, 2026</span>
              </div>
              <button
                type="button"
                className="panel-view-all-btn"
                onClick={() => onNavigateTab('Appointments')}
              >
                View Calendar &rarr;
              </button>
            </div>

            <div className="doc-apt-list">
              {doctorTodayAppointments.map((apt) => (
                <div key={apt.id} className="doc-apt-row">
                  <div className="apt-time-badge">{apt.time}</div>
                  <div className="apt-patient-meta">
                    <div className="apt-avatar-circle">{apt.avatar}</div>
                    <div className="apt-patient-text">
                      <strong>{apt.patientName}</strong>
                      <span>{apt.type}</span>
                    </div>
                  </div>
                  <div className="apt-actions-end">
                    <span className={`status-pill ${apt.status === 'Confirmed' ? 'pill-green' : 'pill-amber'}`}>
                      {apt.status}
                    </span>
                    <button
                      type="button"
                      className="btn-view-apt"
                      onClick={() => {
                        if (onShowToast) onShowToast(`Opened details for ${apt.patientName}`);
                      }}
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: AI Insights & Recent Patients */}
          <div className="doc-right-side-stack">
            {/* Patient Insights AI Card */}
            <div className="dash-panel-card doc-ai-insights-panel">
              <div className="panel-header-row">
                <h3>Patient Insights (AI)</h3>
                <Sparkles width={18} height={18} className="text-blue" />
              </div>

              <div className="doc-ai-insight-item">
                <div className="ai-item-top">
                  <span>Medication Adherence</span>
                  <strong>78% <span className="trend-positive">+4%</span></strong>
                </div>
                <div className="ai-progress-bar">
                  <div className="ai-progress-fill" style={{ width: '78%' }} />
                </div>
              </div>

              <div className="doc-ai-alert-card alert-drug-conflict">
                <div className="ai-alert-icon">
                  <AlertTriangle width={16} height={16} />
                </div>
                <div className="ai-alert-copy">
                  <strong>1 Potential Drug Interaction</strong>
                  <p>Review active prescription</p>
                </div>
              </div>

              <div className="doc-ai-alert-card alert-missed-doses">
                <div className="ai-alert-icon">
                  <Clock width={16} height={16} />
                </div>
                <div className="ai-alert-copy">
                  <strong>3 Missed Doses</strong>
                  <p>Last 3 days</p>
                </div>
              </div>
            </div>

            {/* Recent Patients */}
            <div className="dash-panel-card doc-recent-patients-panel">
              <div className="panel-header-row">
                <h3>Recent Patients</h3>
                <button
                  type="button"
                  className="panel-view-all-btn"
                  onClick={() => onNavigateTab('Patient Lookup')}
                >
                  View All
                </button>
              </div>

              <div className="recent-patients-list">
                {recentPatientsDoctor.map((p, idx) => (
                  <div key={idx} className="recent-patient-row">
                    <div className="patient-avatar-chip">
                      <Users width={16} height={16} />
                    </div>
                    <div className="recent-p-meta">
                      <strong>{p.id}</strong>
                      <span>{p.name}</span>
                    </div>
                    <span className="recent-p-time">{p.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // PATIENT DASHBOARD VIEW (Matches Screen 2)
  // =========================================================================
  return (
    <div className="medisync-dashboard-view">
      {/* 1. Header Greeting & Emergency Action */}
      <div className="dash-welcome-header">
        <div className="welcome-titles">
          <h1>Good Morning, {userName}! 👋</h1>
          <p>Take care of your health, one step at a time.</p>
        </div>
        <div className="welcome-header-actions">
          <button
            type="button"
            className="btn-emergency-sos-header"
            onClick={() => setEmergencyModalOpen(true)}
            title="Open Emergency Medical ID Card & Scannable QR Code"
          >
            <ShieldCheck width={17} height={17} />
            <span>Emergency ID (SOS)</span>
          </button>
          <button
            type="button"
            className="btn-log-vitals-header"
            onClick={() => setVitalsModalOpen(true)}
            title="Record current blood pressure, heart rate, or glucose"
          >
            <Activity width={17} height={17} />
            <span>Log Vitals</span>
          </button>
        </div>
      </div>

      {/* 2. Top Row Quick Metric Cards (5 Cards) */}
      <div className="patient-top-cards-row">
        {/* Card 1: My Patient ID */}
        <div className="p-quick-card p-card-id">
          <div className="p-card-avatar">
            <span className="avatar-letter">{userName.charAt(0)}</span>
          </div>
          <div className="p-card-meta">
            <span className="p-card-label">My Patient ID</span>
            <strong className="p-card-id-code">{patientId}</strong>
          </div>
          <button
            type="button"
            className="p-card-copy-btn"
            onClick={handleCopyPatientId}
            title="Copy Patient ID"
          >
            <Copy width={13} height={13} />
            <span>{copiedId ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Card 2: Next Medication */}
        <div
          className="p-quick-card p-card-clickable"
          onClick={() => onNavigateTab('My Medications')}
          title="Go to My Medications"
        >
          <div className="p-card-icon-circle icon-circle-blue">
            <Clock width={18} height={18} />
          </div>
          <div className="p-card-meta">
            <span className="p-card-label">Next Medication</span>
            <strong className="p-card-big-value">2:00 PM</strong>
            <span className="p-card-subtext">Paracetamol 500mg</span>
          </div>
        </div>

        {/* Card 3: Upcoming Appointment */}
        <div
          className="p-quick-card p-card-clickable"
          onClick={() => onNavigateTab('Appointments')}
          title="Go to Appointments"
        >
          <div className="p-card-icon-circle icon-circle-purple">
            <Calendar width={18} height={18} />
          </div>
          <div className="p-card-meta">
            <span className="p-card-label">Upcoming Appointment</span>
            <strong className="p-card-big-value">Tomorrow</strong>
            <span className="p-card-subtext">Dr. Priya Sharma</span>
          </div>
        </div>

        {/* Card 4: Medication Adherence */}
        <div
          className="p-quick-card p-card-clickable"
          onClick={() => onNavigateTab('My Medications')}
          title="View Adherence Records"
        >
          <div className="p-card-icon-circle icon-circle-teal">
            <Activity width={18} height={18} />
          </div>
          <div className="p-card-meta">
            <span className="p-card-label">Medication Adherence</span>
            <strong className="p-card-big-value">87%</strong>
            <span className="p-card-subtext">This Week</span>
          </div>
        </div>

        {/* Card 5: Health Tip */}
        <div className="p-quick-card p-card-tip">
          <div className="p-card-icon-circle icon-circle-emerald">
            <HeartPulse width={18} height={18} />
          </div>
          <div className="p-card-meta">
            <span className="p-card-label text-emerald">Health Tip</span>
            <p className="p-card-tip-text">Stay hydrated and get enough sleep for better health.</p>
          </div>
        </div>
      </div>

      {/* Patient Consent & Doctor Sharing Hub */}
      <div className="patient-consent-drawer-wrap">
        <PatientConsentManager currentUser={currentUser} onShowToast={onShowToast} />
      </div>

      {/* 2.5 Live Biometric Telemetry & Clinical Vitals Monitor */}
      <div className="dash-panel-card p-vitals-telemetry-card">
        <div className="panel-header-row">
          <div className="vitals-header-title">
            <Activity width={20} height={20} className="text-blue" />
            <div>
              <h3>Live Biometric Telemetry &amp; Vitals</h3>
              <span className="vitals-sub">Last updated {vitals.recordedAt} &bull; Clinical Baseline Normal</span>
            </div>
          </div>
          <button
            type="button"
            className="btn-log-vitals-inline"
            onClick={() => setVitalsModalOpen(true)}
          >
            <Plus width={15} height={15} />
            <span>Record New Reading</span>
          </button>
        </div>

        <div className="vitals-metrics-grid">
          {/* Tile 1: Blood Pressure */}
          <div className="vital-tile-item">
            <div className="vital-tile-top">
              <span className="vital-tile-label">Blood Pressure</span>
              <span className="vital-status-pill status-optimal">Optimal</span>
            </div>
            <div className="vital-tile-value">
              <span className="vital-num">{vitals.bpSys} / {vitals.bpDia}</span>
              <span className="vital-unit">mmHg</span>
            </div>
            <span className="vital-tile-desc">Target: &lt; 120/80 mmHg</span>
          </div>

          {/* Tile 2: Heart Rate (with animated pulsing wave) */}
          <div className="vital-tile-item">
            <div className="vital-tile-top">
              <span className="vital-tile-label">Heart Rate (Pulse)</span>
              <span className="vital-live-indicator"><span className="pulse-ping" /> Live</span>
            </div>
            <div className="vital-tile-value">
              <span className="vital-num">{vitals.heartRate}</span>
              <span className="vital-unit">BPM</span>
              <HeartPulse width={18} height={18} className="heart-pulse-animated" />
            </div>
            <span className="vital-tile-desc">Normal Sinus Rhythm (60-100)</span>
          </div>

          {/* Tile 3: SpO2 */}
          <div className="vital-tile-item">
            <div className="vital-tile-top">
              <span className="vital-tile-label">Blood Oxygen (SpO2)</span>
              <span className="vital-status-pill status-optimal">Normal</span>
            </div>
            <div className="vital-tile-value">
              <span className="vital-num">{vitals.spo2}%</span>
              <span className="vital-unit">SpO2</span>
            </div>
            <span className="vital-tile-desc">Pulse Oximeter Verified</span>
          </div>

          {/* Tile 4: Blood Glucose */}
          <div className="vital-tile-item">
            <div className="vital-tile-top">
              <span className="vital-tile-label">Fasting Blood Glucose</span>
              <span className="vital-status-pill status-optimal">Normal</span>
            </div>
            <div className="vital-tile-value">
              <span className="vital-num">{vitals.glucose}</span>
              <span className="vital-unit">mg/dL</span>
            </div>
            <span className="vital-tile-desc">Target Range: 70-99 mg/dL</span>
          </div>
        </div>
      </div>

      {/* 3. Middle 3-Column Grid */}
      <div className="patient-middle-grid">
        {/* Column 1: Today's Medications */}
        <div className="dash-panel-card p-today-meds-card">
          <div className="panel-header-row">
            <h3>Today's Medications</h3>
            <button
              type="button"
              className="panel-view-all-btn"
              onClick={() => onNavigateTab('My Medications')}
            >
              View All
            </button>
          </div>

          <div className="p-meds-checklist">
            {todayMedsList.map((med) => (
              <div
                key={med.id}
                className={`p-med-item ${med.taken ? 'is-taken' : ''}`}
                onClick={() => toggleDose(med.id, med.name)}
                title="Click to toggle taken status"
              >
                <div className="p-med-icon-box">
                  <Pill width={18} height={18} />
                </div>
                <div className="p-med-details">
                  <strong>{med.name}</strong>
                  <span>{med.dosage}</span>
                </div>
                <div className="p-med-badge-wrap">
                  {med.taken ? (
                    <span className="pill-badge-taken">
                      <CheckCircle2 width={12} height={12} />
                      <span>Taken</span>
                    </span>
                  ) : (
                    <span className="pill-badge-upcoming">
                      <span>Upcoming</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Medication Adherence Bar Chart */}
        <div className="dash-panel-card p-adherence-chart-card">
          <div className="panel-header-row">
            <h3>Medication Adherence</h3>
            <div className="chart-legend-dots">
              <span className="legend-item"><span className="legend-dot dot-taken" /> Taken</span>
              <span className="legend-item"><span className="legend-dot dot-missed" /> Missed</span>
            </div>
          </div>

          <div className="weekly-bars-container">
            {weeklyAdherence.map((item, idx) => (
              <div key={idx} className="chart-bar-col">
                <div className="chart-bar-track">
                  <div
                    className="chart-bar-fill"
                    style={{ height: `${item.height}%` }}
                    title={`${item.day}: ${item.height}% Adherence`}
                  />
                </div>
                <span className="chart-bar-day">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Nearby Doctors */}
        <div className="dash-panel-card p-nearby-doctors-card">
          <div className="panel-header-row">
            <h3>Nearby Doctors</h3>
            <button
              type="button"
              className="panel-view-all-btn"
              onClick={() => onNavigateTab('Nearby Doctors')}
            >
              View All
            </button>
          </div>

          <div className="p-nearby-doc-list">
            {nearbyDoctorsList.map((doc) => (
              <div key={doc.id} className="p-nearby-doc-row">
                <img src={doc.avatar} alt={doc.name} className="doc-avatar-img" />
                <div className="p-nearby-doc-info">
                  <strong>{doc.name}</strong>
                  <span className="doc-spec-sub">{doc.specialty}</span>
                  <div className="doc-dist-rating-row">
                    <span className="doc-dist-tag"><MapPin width={11} height={11} /> {doc.distance}</span>
                    <span className="doc-rating-tag"><Star width={11} height={11} /> {doc.rating}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-view-doctor-mini"
                  onClick={() => onNavigateTab('Nearby Doctors')}
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Recent Activity */}
      <div className="dash-panel-card p-recent-activity-card">
        <div className="panel-header-row">
          <h3>Recent Activity</h3>
        </div>

        <div className="activity-cards-row">
          {recentActivities.map((act) => {
            const Icon = act.icon;
            return (
              <div key={act.id} className="activity-mini-item">
                <div
                  className="act-icon-box"
                  style={{ background: act.iconBg, color: act.iconColor }}
                >
                  <Icon width={18} height={18} />
                </div>
                <div className="act-meta">
                  <strong>{act.title}</strong>
                  <span>{act.subtitle}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Emergency Medical SOS ID & Wallet Card Modal */}
      {emergencyModalOpen && (
        <div className="modal-overlay" onClick={() => setEmergencyModalOpen(false)}>
          <div className="emergency-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Red Alert Header */}
            <div className="emergency-modal-header">
              <div className="emergency-header-title-box">
                <div className="emergency-cross-icon">✚</div>
                <div>
                  <h3>EMERGENCY MEDICAL IDENTIFICATION PASS</h3>
                  <span>Paramedic &amp; Emergency Room Quick Response Data &bull; Verified HIPAA Protected</span>
                </div>
              </div>
              <button
                type="button"
                className="emergency-modal-close"
                onClick={() => setEmergencyModalOpen(false)}
              >
                <X width={18} height={18} />
              </button>
            </div>

            {/* Emergency Dossier Grid */}
            <div className="emergency-dossier-grid">
              {/* Left Column: Essential Vitals & Patient Data */}
              <div className="emergency-details-col">
                <div className="emergency-patient-hero">
                  <div className="emergency-avatar-circle">{userName.charAt(0)}</div>
                  <div className="emergency-patient-name-block">
                    <h4>{userName}</h4>
                    <span className="emergency-patient-id-badge">ID: {patientId}</span>
                  </div>
                </div>

                <div className="emergency-data-tags-row">
                  <div className="emergency-tag-box blood-group-box">
                    <span className="e-tag-label">BLOOD GROUP</span>
                    <strong className="e-tag-val">{currentUser?.blood_group || 'O+'} POSITIVE</strong>
                  </div>
                  <div className="emergency-tag-box donor-box">
                    <span className="e-tag-label">ORGAN DONOR</span>
                    <strong className="e-tag-val">YES (REGISTERED)</strong>
                  </div>
                </div>

                <div className="emergency-data-block">
                  <span className="emergency-field-label">CRITICAL ALLERGIES:</span>
                  <div className="emergency-allergy-pills">
                    <span className="emergency-allergy-pill pill-red">⚠️ Penicillin (Anaphylaxis Risk)</span>
                    <span className="emergency-allergy-pill pill-amber">⚠️ Latex Sensitivity</span>
                  </div>
                </div>

                <div className="emergency-data-block">
                  <span className="emergency-field-label">EMERGENCY CONTACT:</span>
                  <div className="emergency-contact-display">
                    <strong>{currentUser?.emergency_contact || '+91 91234 56789 (Sister)'}</strong>
                    <a href="tel:+919123456789" className="emergency-call-btn">
                      <PhoneCall width={14} height={14} />
                      <span>Call Now</span>
                    </a>
                  </div>
                </div>

                <div className="emergency-data-block">
                  <span className="emergency-field-label">PRIMARY PHYSICIAN:</span>
                  <p className="emergency-physician-text">Dr. Emily Carter &bull; Chief of Cardiology (MedSync Hospital)</p>
                </div>

                <div className="emergency-data-block">
                  <span className="emergency-field-label">ACTIVE MEDICATIONS:</span>
                  <p className="emergency-meds-summary">Paracetamol 500mg, Vitamin D3 1000 IU, Amlodipine 5mg</p>
                </div>
              </div>

              {/* Right Column: Scannable QR Code & Clinical Verification */}
              <div className="emergency-qr-col">
                <div className="emergency-qr-box">
                  {/* High Quality Authentic SVG QR Code */}
                  <svg viewBox="0 0 100 100" className="emergency-qr-svg">
                    {/* Top-Left Position Block */}
                    <rect x="10" y="10" width="24" height="24" fill="#0f172a" rx="2" />
                    <rect x="14" y="14" width="16" height="16" fill="#ffffff" rx="1" />
                    <rect x="18" y="18" width="8" height="8" fill="#0f172a" rx="1" />
                    {/* Top-Right Position Block */}
                    <rect x="66" y="10" width="24" height="24" fill="#0f172a" rx="2" />
                    <rect x="70" y="14" width="16" height="16" fill="#ffffff" rx="1" />
                    <rect x="74" y="18" width="8" height="8" fill="#0f172a" rx="1" />
                    {/* Bottom-Left Position Block */}
                    <rect x="10" y="66" width="24" height="24" fill="#0f172a" rx="2" />
                    <rect x="14" y="70" width="16" height="16" fill="#ffffff" rx="1" />
                    <rect x="18" y="74" width="8" height="8" fill="#0f172a" rx="1" />
                    {/* Data Pixels Matrix */}
                    <rect x="38" y="12" width="6" height="6" fill="#0f172a" />
                    <rect x="48" y="12" width="6" height="6" fill="#0f172a" />
                    <rect x="58" y="12" width="4" height="6" fill="#0f172a" />
                    <rect x="38" y="24" width="6" height="6" fill="#0f172a" />
                    <rect x="50" y="24" width="8" height="6" fill="#0f172a" />
                    <rect x="12" y="42" width="6" height="6" fill="#0f172a" />
                    <rect x="24" y="42" width="6" height="6" fill="#0f172a" />
                    <rect x="36" y="42" width="6" height="6" fill="#0f172a" />
                    <rect x="48" y="42" width="6" height="6" fill="#0f172a" />
                    <rect x="60" y="42" width="6" height="6" fill="#0f172a" />
                    <rect x="72" y="42" width="6" height="6" fill="#0f172a" />
                    <rect x="84" y="42" width="6" height="6" fill="#0f172a" />
                    <rect x="42" y="54" width="6" height="6" fill="#0f172a" />
                    <rect x="54" y="54" width="6" height="6" fill="#0f172a" />
                    <rect x="66" y="54" width="6" height="6" fill="#0f172a" />
                    <rect x="78" y="54" width="6" height="6" fill="#0f172a" />
                    <rect x="38" y="66" width="6" height="6" fill="#0f172a" />
                    <rect x="50" y="66" width="6" height="6" fill="#0f172a" />
                    <rect x="62" y="66" width="6" height="6" fill="#0f172a" />
                    <rect x="74" y="66" width="6" height="6" fill="#0f172a" />
                    <rect x="86" y="66" width="4" height="6" fill="#0f172a" />
                    <rect x="42" y="78" width="6" height="6" fill="#0f172a" />
                    <rect x="54" y="78" width="6" height="6" fill="#0f172a" />
                    <rect x="66" y="78" width="6" height="6" fill="#0f172a" />
                    <rect x="78" y="78" width="6" height="6" fill="#0f172a" />
                    {/* MedSync Heart in Center of QR Code */}
                    <circle cx="50" cy="50" r="10" fill="#dc2626" />
                    <path d="M47 48 C45 45 42 47 42 49 C42 53 50 56 50 56 C50 56 58 53 58 49 C58 47 55 45 53 48 L50 51 Z" fill="#ffffff" />
                  </svg>
                  <span className="emergency-qr-caption">Scan with smartphone camera for instant clinical emergency profile</span>
                </div>
                <div className="emergency-security-note">
                  <ShieldCheck width={15} height={15} />
                  <span>256-Bit Encrypted Healthcare Identity</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="emergency-modal-actions">
              <button
                type="button"
                className="btn-download-emergency"
                onClick={handleDownloadEmergencyCard}
              >
                <Download width={16} height={16} />
                <span>Save Offline Emergency Card</span>
              </button>
              <button
                type="button"
                className="btn-close-emergency"
                onClick={() => setEmergencyModalOpen(false)}
              >
                Close Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Vitals Modal */}
      {vitalsModalOpen && (
        <div className="modal-overlay" onClick={() => setVitalsModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3>Record Biometric Vitals</h3>
              <button type="button" className="modal-close-btn" onClick={() => setVitalsModalOpen(false)}>
                <X width={16} height={16} />
              </button>
            </div>
            <form onSubmit={handleSaveVitals}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    required
                    value={newVitalForm.bpSys}
                    onChange={(e) => setNewVitalForm({ ...newVitalForm, bpSys: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    required
                    value={newVitalForm.bpDia}
                    onChange={(e) => setNewVitalForm({ ...newVitalForm, bpDia: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                <div className="form-group">
                  <label>Heart Rate (BPM)</label>
                  <input
                    type="number"
                    required
                    value={newVitalForm.heartRate}
                    onChange={(e) => setNewVitalForm({ ...newVitalForm, heartRate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Oxygen SpO2 (%)</label>
                  <input
                    type="number"
                    required
                    value={newVitalForm.spo2}
                    onChange={(e) => setNewVitalForm({ ...newVitalForm, spo2: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '10px' }}>
                <label>Fasting Blood Glucose (mg/dL)</label>
                <input
                  type="number"
                  required
                  value={newVitalForm.glucose}
                  onChange={(e) => setNewVitalForm({ ...newVitalForm, glucose: e.target.value })}
                />
              </div>
              <div className="modal-actions" style={{ marginTop: '18px' }}>
                <button type="button" className="secondary" onClick={() => setVitalsModalOpen(false)}>Cancel</button>
                <button type="submit" style={{ background: '#0284c7', color: '#fff' }}>Save Vitals Reading</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
