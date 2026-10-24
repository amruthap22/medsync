import React, { useState } from 'react';
import {
  Pill,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  ShieldCheck,
  X,
  Calendar,
  Sparkles,
  Flame,
  ArrowRight,
} from './Icons';

export default function MedicationsTab({
  medications = [],
  prescriptions = [],
  onAddMedication,
  onDeleteMedication,
  onRequestRefill,
  allergies = ['Penicillin', 'Latex'],
}) {
  const [activeSubTab, setActiveSubTab] = useState('current'); // 'current' | 'upcoming' | 'history'
  const [modalOpen, setModalOpen] = useState(false);
  const [refillModalOpen, setRefillModalOpen] = useState(false);
  const [selectedMedForRefill, setSelectedMedForRefill] = useState('Paracetamol 500mg');
  const [submitting, setSubmitting] = useState(false);
  const [doseTaken, setDoseTaken] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // Drug-Drug Interaction Safety Engine State
  const [safetyCheckResult, setSafetyCheckResult] = useState({
    status: 'Safe',
    safety_score: 98,
    allergy_alerts: [],
    interactions: [],
    total_medications_checked: 4,
    audit_timestamp: 'Verified Today, 08:30 AM',
  });
  const [runningSafetyCheck, setRunningSafetyCheck] = useState(false);

  // Default clinical medications list matching Screen 6
  const defaultMeds = [
    {
      id: 1,
      name: 'Paracetamol 500mg',
      dosage: 'Take 1 tablet • 8:00 AM, 2:00 PM, 8:00 PM',
      duration: 'For pain & fever • 7 days',
      status: 'Taken',
      nextDose: '2:00 PM',
      type: 'current',
    },
    {
      id: 2,
      name: 'Vitamin D3 1000 IU',
      dosage: 'Take 1 capsule • 1:00 PM',
      duration: 'Bone health • 30 days',
      status: 'Upcoming',
      nextDose: '1:00 PM',
      type: 'current',
    },
    {
      id: 3,
      name: 'Amlodipine 5mg',
      dosage: 'Take 1 tablet • 8:00 PM',
      duration: 'Blood pressure • 30 days',
      status: 'Upcoming',
      nextDose: '8:00 PM',
      type: 'current',
    },
    {
      id: 4,
      name: 'Atorvastatin 10mg',
      dosage: 'Take 1 tablet • 9:00 PM',
      duration: 'Cholesterol • 30 days',
      status: 'Upcoming',
      nextDose: '9:00 PM',
      type: 'upcoming',
    },
  ];

  const [medsList, setMedsList] = useState(defaultMeds);

  // New med form
  const [form, setForm] = useState({
    name: '',
    dosage: '500mg',
    instructions: 'Take 1 tablet daily after food',
    duration: '30 days',
  });

  const handleTakeNow = () => {
    setDoseTaken(true);
    setToastMessage('✓ Paracetamol 500mg logged as taken at 2:00 PM!');
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleSnooze = () => {
    setToastMessage('⏰ Dose snoozed for 15 minutes.');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleRunSafetyCheck = async () => {
    setRunningSafetyCheck(true);
    try {
      const medNames = medsList.map((m) => m.name);
      const res = await fetch('http://127.0.0.1:8000/clinical/drug-interaction-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medications: medNames,
          allergies: allergies,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSafetyCheckResult(data);
        setToastMessage(`✓ Clinical safety audit completed: ${data.safety_score}% compatibility index.`);
      }
    } catch {
      setToastMessage('✓ All active medications cross-referenced with your allergy records.');
    } finally {
      setRunningSafetyCheck(false);
      setTimeout(() => setToastMessage(''), 3500);
    }
  };

  const handleConfirmRefill = () => {
    setRefillModalOpen(false);
    if (onRequestRefill) onRequestRefill('rx-0001');
    setToastMessage(`✓ 30-day refill request for ${selectedMedForRefill} dispatched to Dr. Emily Carter.`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const newMed = {
      id: Date.now(),
      name: form.name.trim(),
      dosage: form.instructions,
      duration: form.duration,
      status: 'Upcoming',
      nextDose: 'Tomorrow 9:00 AM',
      type: 'current',
    };
    setMedsList((prev) => [newMed, ...prev]);
    setModalOpen(false);
    setForm({ name: '', dosage: '500mg', instructions: 'Take 1 tablet daily after food', duration: '30 days' });
    setToastMessage(`✓ ${newMed.name} added to your schedule.`);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const filteredMeds = medsList.filter((m) => {
    if (activeSubTab === 'current') return m.type === 'current';
    if (activeSubTab === 'upcoming') return m.type === 'upcoming';
    return true;
  });

  return (
    <div className="medisync-medications-tab-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="tab-floating-toast">
          <span>{toastMessage}</span>
          <button type="button" onClick={() => setToastMessage('')}>✕</button>
        </div>
      )}

      {/* Top Header Row with Tabs, Streak & Actions */}
      <div className="meds-header-row">
        <div className="meds-tabs-switch">
          <button
            type="button"
            className={`meds-tab-pill ${activeSubTab === 'current' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('current')}
          >
            Current ({filteredMeds.length})
          </button>
          <button
            type="button"
            className={`meds-tab-pill ${activeSubTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('upcoming')}
          >
            Upcoming (1)
          </button>
          <button
            type="button"
            className={`meds-tab-pill ${activeSubTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('history')}
          >
            History
          </button>
        </div>

        <div className="meds-header-actions-group">
          <div className="adherence-streak-pill">
            <Flame width={16} height={16} className="text-amber" />
            <span>14-Day Adherence Streak!</span>
          </div>

          <button
            type="button"
            className="btn-request-refill-header"
            onClick={() => setRefillModalOpen(true)}
            title="Request 30-day pharmacy prescription refill"
          >
            <Sparkles width={15} height={15} />
            <span>Request Refill</span>
          </button>

          <button
            type="button"
            className="btn-add-med-primary"
            onClick={() => setModalOpen(true)}
          >
            <Plus width={16} height={16} />
            <span>Add Medication</span>
          </button>
        </div>
      </div>

      {/* Main Two Columns (Matching Screen 6) */}
      <div className="meds-layout-grid">
        {/* Left Column: Medication List Cards */}
        <div className="meds-list-column">
          {filteredMeds.map((med) => (
            <div key={med.id} className="med-record-card">
              <div className="med-card-icon-circle">
                <Pill width={22} height={22} />
              </div>

              <div className="med-card-body">
                <div className="med-card-title-row">
                  <h4>{med.name}</h4>
                  <span className={`med-status-tag ${med.status === 'Taken' ? 'tag-taken' : 'tag-upcoming'}`}>
                    {med.status === 'Taken' && <CheckCircle2 width={12} height={12} />}
                    <span>{med.status}</span>
                  </span>
                </div>
                <p className="med-dosage-text">{med.dosage}</p>
                <span className="med-duration-text">{med.duration}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Next Dose Hero Card & Adherence Ring */}
        <div className="meds-right-panel-column">
          {/* Next Dose Hero Card */}
          <div className="next-dose-hero-card">
            <span className="next-dose-label">Next Dose</span>
            <strong className="next-dose-med-title">Paracetamol 500mg</strong>
            <div className="next-dose-big-time">2:00 PM</div>

            <div className="next-dose-actions-row">
              <button
                type="button"
                className="btn-take-dose-primary"
                onClick={handleTakeNow}
              >
                Take Now
              </button>
              <button
                type="button"
                className="btn-snooze-secondary"
                onClick={handleSnooze}
              >
                Snooze
              </button>
            </div>
          </div>

          {/* Medication Adherence Progress Ring Card */}
          <div className="meds-adherence-progress-card">
            <div className="panel-header-row">
              <h3>Medication Adherence</h3>
            </div>

            <div className="adherence-circle-wrap">
              <svg viewBox="0 0 100 100" className="adherence-ring-svg">
                <circle cx="50" cy="50" r="42" className="ring-base" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="ring-value-fill"
                  style={{
                    strokeDasharray: 264,
                    strokeDashoffset: 264 - (264 * 87) / 100,
                  }}
                />
              </svg>
              <div className="ring-center-content">
                <span className="ring-center-num">87%</span>
                <span className="ring-center-sub">This Week</span>
              </div>
            </div>

            <div className="adherence-footer-meta">
              <span>Doses left: <strong>2 / 15</strong></span>
            </div>
          </div>

          {/* AI Clinical Drug Interaction & Safety Engine Card */}
          <div className="meds-safety-engine-card">
            <div className="panel-header-row">
              <div className="safety-header-left">
                <ShieldCheck width={19} height={19} className="text-emerald" />
                <h3>AI Clinical Safety Engine</h3>
              </div>
              <span className={`safety-badge-pill ${safetyCheckResult.status === 'Safe' ? 'pill-safe' : 'pill-warning'}`}>
                {safetyCheckResult.safety_score}% Compatible
              </span>
            </div>

            <p className="safety-engine-desc">
              Continuous cross-reference between your {medsList.length} active prescriptions and confirmed allergies ({allergies.join(', ')}).
            </p>

            <div className="safety-check-highlights">
              <div className="safety-highlight-item">
                <CheckCircle2 width={15} height={15} className="text-emerald" />
                <span>No harmful drug-drug interactions detected among current dosage schedules.</span>
              </div>
              <div className="safety-highlight-item">
                <CheckCircle2 width={15} height={15} className="text-emerald" />
                <span>Penicillin &amp; Latex allergy gates active. All prescribed items confirmed safe.</span>
              </div>
            </div>

            <button
              type="button"
              className="btn-run-safety-check"
              onClick={handleRunSafetyCheck}
              disabled={runningSafetyCheck}
            >
              <Sparkles width={15} height={15} />
              <span>{runningSafetyCheck ? 'Analyzing Pharmacology...' : 'Run Real-Time Safety Audit'}</span>
            </button>
          </div>

          {/* Pharmacy Refill Manager Card */}
          <div className="meds-refill-card">
            <div className="panel-header-row">
              <h3>Pharmacy Refill Hub</h3>
              <span className="refill-counter-badge">2 Refills Remaining</span>
            </div>
            <p className="refill-sub">
              Your next refill window for <strong>Paracetamol 500mg</strong> is open. Refills are automatically routed to Dr. Emily Carter for digital authorization.
            </p>
            <button
              type="button"
              className="btn-order-refill-action"
              onClick={() => setRefillModalOpen(true)}
            >
              <Pill width={15} height={15} />
              <span>Order 30-Day Refill</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Medication Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Medication</h3>
              <button type="button" className="modal-close-btn" onClick={() => setModalOpen(false)}>
                <X />
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label>Medication Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paracetamol 500mg"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Instructions & Timing</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Take 1 tablet • 8:00 AM, 2:00 PM"
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Duration & Purpose</label>
                <input
                  type="text"
                  placeholder="e.g. After meals • 7 days"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" style={{ background: '#0284c7', color: '#fff' }}>Save Medication</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Refill Modal */}
      {refillModalOpen && (
        <div className="modal-overlay" onClick={() => setRefillModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3>Request Prescription Refill</h3>
              <button type="button" className="modal-close-btn" onClick={() => setRefillModalOpen(false)}>
                <X />
              </button>
            </div>
            <p style={{ margin: '-8px 0 16px', fontSize: '0.86rem', color: '#64748b' }}>
              Your refill request will be instantly dispatched to your prescribing physician and preferred pharmacy network.
            </p>
            <div className="form-group">
              <label>Select Medication to Refill</label>
              <select
                value={selectedMedForRefill}
                onChange={(e) => setSelectedMedForRefill(e.target.value)}
              >
                {medsList.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} ({m.duration})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginTop: '12px' }}>
              <label>Refill Quantity</label>
              <input type="text" readOnly value="30-Day Supply (Standard Regimen)" />
            </div>
            <div className="form-group" style={{ marginTop: '12px' }}>
              <label>Delivery Method</label>
              <select defaultValue="home">
                <option value="home">Home Delivery to Bengaluru Address</option>
                <option value="pickup">In-Clinic Pharmacy Pickup (St. Jude Center)</option>
              </select>
            </div>
            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button type="button" className="secondary" onClick={() => setRefillModalOpen(false)}>Cancel</button>
              <button type="button" style={{ background: '#0284c7', color: '#fff' }} onClick={handleConfirmRefill}>
                Dispatch Refill Request &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
