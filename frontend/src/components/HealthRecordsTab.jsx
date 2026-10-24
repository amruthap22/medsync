import React, { useState } from 'react';
import doctorPatientSceneImg from '../assets/medisync-left-showcase-clean.png';
import {
  FileText,
  Upload,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  ShieldCheck,
  Eye,
  Download,
  Share2,
} from './Icons';

export default function HealthRecordsTab({
  historyRecords = [],
  documents = [],
  allergies = ['Penicillin', 'Latex'],
  onAddHistoryRecord,
  onDeleteHistoryRecord,
  onUploadDocument,
  onDeleteDocument,
  onAddAllergy,
}) {
  const [activeSubTab, setActiveSubTab] = useState('prescriptions'); // 'prescriptions' | 'reports' | 'documents'
  const [modalOpen, setModalOpen] = useState(false);
  const [consentModalOpen, setConsentModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Access history log list matching Screen 9
  const accessHistory = [
    {
      id: 1,
      doctor: 'Dr. Priya Sharma',
      action: 'Viewed',
      timestamp: 'Mar 20, 2026, 10:15 AM',
      avatar: 'P',
    },
    {
      id: 2,
      doctor: 'Dr. Rahul Menon',
      action: 'Viewed',
      timestamp: 'Mar 18, 2026, 04:30 PM',
      avatar: 'R',
    },
  ];

  // Prescriptions List
  const prescriptionsList = [
    {
      id: 'rx-1',
      title: 'Post-Consultation Prescription',
      doctor: 'Dr. Priya Sharma',
      date: 'Mar 20, 2026',
      items: 'Paracetamol 500mg, Vitamin D3 1000 IU',
      status: 'Active',
    },
    {
      id: 'rx-2',
      title: 'Cardiology Care Regimen',
      doctor: 'Dr. Rahul Menon',
      date: 'Mar 15, 2026',
      items: 'Amlodipine 5mg, Atorvastatin 10mg',
      status: 'Active',
    },
  ];

  // Lab Reports List
  const labReportsList = [
    {
      id: 'rep-1',
      title: 'Comprehensive Metabolic Panel',
      lab: 'Metropolis Healthcare Labs',
      date: 'Mar 10, 2026',
      result: 'Normal (Glucose: 96 mg/dL, HbA1c: 5.4%)',
      status: 'Verified',
    },
    {
      id: 'rep-2',
      title: 'Lipid Profile & Cholesterol Assay',
      lab: 'Apollo Diagnostic Center',
      date: 'Feb 28, 2026',
      result: 'Normal (Total: 182 mg/dL, LDL: 104 mg/dL)',
      status: 'Verified',
    },
  ];

  const handleDownloadFile = (title) => {
    const content = `MEDSYNC OFFICIAL CLINICAL RECORD REPORT\n=======================================\nDocument: ${title}\nPatient: Amrutha (MED-P-7K92X)\nDate: ${new Date().toLocaleDateString()}\nStatus: Verified Clinical Record\nSecurity: HIPAA & Consent Compliant Encrypted`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToastMessage(`✓ Downloaded ${title}`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="medisync-records-tab-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="tab-floating-toast">
          <span>{toastMessage}</span>
          <button type="button" onClick={() => setToastMessage('')}>✕</button>
        </div>
      )}

      {/* Top Header Row with Tabs and Upload Button */}
      <div className="meds-header-row">
        <div className="meds-tabs-switch">
          <button
            type="button"
            className={`meds-tab-pill ${activeSubTab === 'prescriptions' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('prescriptions')}
          >
            Prescriptions
          </button>
          <button
            type="button"
            className={`meds-tab-pill ${activeSubTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('reports')}
          >
            Reports
          </button>
          <button
            type="button"
            className={`meds-tab-pill ${activeSubTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('documents')}
          >
            Documents
          </button>
        </div>

        <button
          type="button"
          className="btn-add-med-primary"
          onClick={() => setModalOpen(true)}
        >
          <Upload width={16} height={16} />
          <span>Upload Record</span>
        </button>
      </div>

      {/* Main Two Columns (Matching Screen 9) */}
      <div className="records-layout-grid">
        {/* Left Column: Medical Health Records Overview & Active Tab Cards */}
        <div className="records-left-column">
          <div className="dash-panel-card records-intro-card">
            <h3>Medical Health Records</h3>
            <p>
              MedSync is a modern healthcare platform that connects patients and doctors, simplifies medication management, and ensures better health outcomes through technology.
            </p>
            <div className="records-art-wrap">
              <img
                src={doctorPatientSceneImg}
                alt="Doctor patient consultation"
                className="records-art-img"
              />
            </div>
          </div>

          {/* Sub-tab Content List */}
          <div className="records-items-stream">
            {activeSubTab === 'prescriptions' && (
              <div className="stream-cards-list">
                {prescriptionsList.map((rx) => (
                  <div key={rx.id} className="record-item-card">
                    <div className="record-icon-box">
                      <FileText width={20} height={20} />
                    </div>
                    <div className="record-details">
                      <strong>{rx.title}</strong>
                      <span className="record-sub">Issued by {rx.doctor} • {rx.date}</span>
                      <p className="record-items-text">{rx.items}</p>
                    </div>
                    <button
                      type="button"
                      className="btn-download-record"
                      onClick={() => handleDownloadFile(rx.title)}
                      title="Download record"
                    >
                      <Download width={16} height={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeSubTab === 'reports' && (
              <div className="stream-cards-list">
                {labReportsList.map((rep) => (
                  <div key={rep.id} className="record-item-card">
                    <div className="record-icon-box text-emerald">
                      <ShieldCheck width={20} height={20} />
                    </div>
                    <div className="record-details">
                      <strong>{rep.title}</strong>
                      <span className="record-sub">{rep.lab} • {rep.date}</span>
                      <p className="record-items-text text-emerald">{rep.result}</p>
                    </div>
                    <button
                      type="button"
                      className="btn-download-record"
                      onClick={() => handleDownloadFile(rep.title)}
                      title="Download report"
                    >
                      <Download width={16} height={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeSubTab === 'documents' && (
              <div className="stream-cards-list">
                <div className="record-item-card">
                  <div className="record-icon-box text-blue">
                    <FileText width={20} height={20} />
                  </div>
                  <div className="record-details">
                    <strong>Patient Health Summary & ID Pass</strong>
                    <span className="record-sub">Official MedSync Profile Card • Updated</span>
                    <p className="record-items-text">Certified Patient ID: MED-P-7K92X (Amrutha)</p>
                  </div>
                  <button
                    type="button"
                    className="btn-download-record"
                    onClick={() => handleDownloadFile('MedSync-Patient-ID-Pass')}
                  >
                    <Download width={16} height={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Share With Doctor & Access History Log */}
        <div className="records-right-column">
          {/* Share with Doctor Card */}
          <div className="dash-panel-card share-doctor-panel">
            <div className="share-doctor-header">
              <Share2 width={20} height={20} className="text-blue" />
              <h4>Share with Doctor</h4>
            </div>
            <p>Give your doctor access to your medical history and active prescriptions.</p>

            <button
              type="button"
              className="btn-manage-consent-primary"
              onClick={() => setConsentModalOpen(true)}
            >
              Manage Consent
            </button>
          </div>

          {/* Access History Log */}
          <div className="dash-panel-card access-history-panel">
            <div className="panel-header-row">
              <h4>Access History</h4>
              <ShieldCheck width={16} height={16} className="text-emerald" />
            </div>

            <div className="access-history-list">
              {accessHistory.map((item) => (
                <div key={item.id} className="access-history-row">
                  <div className="history-avatar-chip">{item.avatar}</div>
                  <div className="history-meta">
                    <strong>{item.doctor}</strong>
                    <span>{item.action} • {item.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Manage Consent Modal */}
      {consentModalOpen && (
        <div className="modal-overlay" onClick={() => setConsentModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Doctor Consent & Access Control</h3>
              <button type="button" className="modal-close-btn" onClick={() => setConsentModalOpen(false)}>
                <X />
              </button>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
              Your medical history is consent-gated. Only verified doctors you approve can view your records.
            </p>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <strong>Active Doctor Permissions:</strong>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <span>Dr. Priya Sharma (General Physician)</span>
                <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.85rem' }}>✓ Authorized</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <span>Dr. Rahul Menon (Cardiologist)</span>
                <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.85rem' }}>✓ Authorized</span>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="secondary" onClick={() => setConsentModalOpen(false)}>Close</button>
              <button
                type="button"
                style={{ background: '#0284c7', color: '#fff' }}
                onClick={() => {
                  setConsentModalOpen(false);
                  setToastMessage('✓ Consent permissions verified and locked.');
                  setTimeout(() => setToastMessage(''), 3000);
                }}
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Record Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload Medical Record</h3>
              <button type="button" className="modal-close-btn" onClick={() => setModalOpen(false)}>
                <X />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              setModalOpen(false);
              setToastMessage('✓ Health record uploaded and encrypted.');
              setTimeout(() => setToastMessage(''), 3500);
            }}>
              <div className="form-group">
                <label>Document Title</label>
                <input type="text" required placeholder="e.g. Blood Test Report, Dental X-Ray" />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select defaultValue="Lab Report">
                  <option>Lab Report</option>
                  <option>Doctor Prescription</option>
                  <option>Discharge Summary</option>
                  <option>Vaccination Record</option>
                </select>
              </div>
              <div className="form-group">
                <label>File Upload (PDF, PNG, JPG)</label>
                <input type="file" />
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" style={{ background: '#0284c7', color: '#fff' }}>Upload to Cloud</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
