import React, { useState, useEffect } from 'react';
import {
  Search,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Pill,
  FileText,
  Calendar,
  Users,
  Eye,
  Plus,
  X,
} from './Icons';
import {
  lookupPatientById,
  requestPatientAccess,
  addTreatmentNote,
  getAuditLogs,
} from '../firebase/firestoreService';
import '../PatientLookup.css';

export default function DoctorPatientLookup({
  currentUser,
  onShowToast,
}) {
  const [patientIdInput, setPatientIdInput] = useState('MED-P-88492014');
  const [searching, setSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [lookupResult, setLookupResult] = useState(null);

  // Request Access Form State
  const [requestPurpose, setRequestPurpose] = useState('Clinical Consultation & Medication Review');
  const [requesting, setRequesting] = useState(false);

  // Add Treatment Note State
  const [noteFormOpen, setNoteFormOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [showAuditLogs, setShowAuditLogs] = useState(false);

  // Document Preview Modal State
  const [previewDoc, setPreviewDoc] = useState(null);

  const doctorEmail = currentUser?.email || 'doctor@medicare.com';
  const doctorName = currentUser?.full_name || 'Dr. Emily Carter';

  // Automatically lookup default demo patient on mount
  useEffect(() => {
    handleSearch('MED-P-88492014');
  }, []);

  const handleSearch = async (idToSearch) => {
    const pId = (idToSearch || patientIdInput).trim().toUpperCase();
    if (!pId) {
      setErrorMsg('Please enter a valid Patient ID.');
      return;
    }

    setSearching(true);
    setErrorMsg('');
    try {
      const data = await lookupPatientById(pId, doctorEmail);
      setLookupResult(data);
      if (data.records_authorized) {
        loadAuditLogs(pId);
      }
    } catch (err) {
      setLookupResult(null);
      setErrorMsg(err.message || `No patient found with ID '${pId}'.`);
    } finally {
      setSearching(false);
    }
  };

  const loadAuditLogs = async (pId) => {
    try {
      const logs = await getAuditLogs(pId);
      setAuditLogs(logs);
    } catch {
      // ignore
    }
  };

  const handleRequestAccess = async (e) => {
    e.preventDefault();
    if (!lookupResult?.patient_id) return;

    setRequesting(true);
    try {
      const res = await requestPatientAccess({
        patientId: lookupResult.patient_id,
        purpose: requestPurpose,
        doctorName: doctorName,
        doctorEmail: doctorEmail,
        doctorSpecialty: 'Cardiology',
      });
      if (onShowToast) onShowToast(res.message || 'Access request dispatched to patient.');
      // Refresh lookup state
      await handleSearch(lookupResult.patient_id);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit access request.');
    } finally {
      setRequesting(false);
    }
  };

  const handleAddNoteSubmit = async (e) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    setSavingNote(true);
    try {
      await addTreatmentNote({
        patientId: lookupResult.patient_id,
        doctorName: doctorName,
        doctorEmail: doctorEmail,
        noteTitle: noteTitle.trim(),
        content: noteContent.trim(),
      });
      if (onShowToast) onShowToast('Clinical treatment note recorded in audit log.');
      setNoteTitle('');
      setNoteContent('');
      setNoteFormOpen(false);
      // Refresh lookup
      await handleSearch(lookupResult.patient_id);
    } catch (err) {
      alert(err.message || 'Error saving treatment note.');
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div className="doctor-lookup-container">
      {/* Header Bar */}
      <div className="section-header-bar">
        <div>
          <h2>Patient ID &amp; Medical History Access</h2>
          <p>Secure clinical records query with automated patient consent verification &amp; HIPAA-compliant audit logging.</p>
        </div>
        <div className="flex-row items-center gap-2">
          <span className="demo-data-pill">Demo Mode: Realistic Sample Records</span>
        </div>
      </div>

      {/* Patient ID Search Panel */}
      <div className="lookup-search-card">
        <form
          className="lookup-search-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <div className="lookup-input-wrapper">
            <Search width={18} height={18} className="lookup-search-icon" />
            <input
              type="text"
              placeholder="Enter Patient ID (e.g. MED-P-88492014)..."
              value={patientIdInput}
              onChange={(e) => setPatientIdInput(e.target.value.toUpperCase())}
            />
          </div>

          <button
            type="submit"
            className="btn-lookup-submit"
            disabled={searching}
          >
            {searching ? 'Querying...' : 'Lookup Patient'}
          </button>
        </form>

        {/* Quick Demo ID Suggestions */}
        <div className="demo-id-quick-pills">
          <span className="demo-label">Quick Demo Patient Dossiers:</span>
          <button
            type="button"
            className="demo-id-chip"
            onClick={() => {
              setPatientIdInput('MED-P-88492014');
              handleSearch('MED-P-88492014');
            }}
          >
            Alice Johnson (MED-P-88492014) &bull; Type 2 Diabetes, HTN (Approved)
          </button>
          <button
            type="button"
            className="demo-id-chip"
            onClick={() => {
              setPatientIdInput('MED-P-73419205');
              handleSearch('MED-P-73419205');
            }}
          >
            Rohan Mehta (MED-P-73419205) &bull; Asthma, Allergic Rhinitis
          </button>
          <button
            type="button"
            className="demo-id-chip"
            onClick={() => {
              setPatientIdInput('MED-P-51928374');
              handleSearch('MED-P-51928374');
            }}
          >
            Sana Khan (MED-P-51928374) &bull; Hypothyroidism, Prenatal
          </button>
          <button
            type="button"
            className="demo-id-chip"
            onClick={() => {
              setPatientIdInput('MED-P-64820193');
              handleSearch('MED-P-64820193');
            }}
          >
            Maya Patel (MED-P-64820193) &bull; Coronary Artery Disease, Osteoarthritis
          </button>
          <button
            type="button"
            className="demo-id-chip"
            onClick={() => {
              setPatientIdInput('MED-P-42819056');
              handleSearch('MED-P-42819056');
            }}
          >
            David Chen (MED-P-42819056) &bull; Mixed Dyslipidemia
          </button>
          <button
            type="button"
            className="demo-id-chip"
            onClick={() => {
              setPatientIdInput('MED-P-90384712');
              handleSearch('MED-P-90384712');
            }}
          >
            Priya Nambiar (MED-P-90384712) &bull; Migraine with Visual Aura
          </button>
          <button
            type="button"
            className="demo-id-chip"
            onClick={() => {
              setPatientIdInput('MED-P-38192047');
              handleSearch('MED-P-38192047');
            }}
          >
            Vikram Malhotra (MED-P-38192047) &bull; Stage 2 CKD
          </button>
          <button
            type="button"
            className="demo-id-chip"
            onClick={() => {
              setPatientIdInput('MED-P-E55D5BEB');
              handleSearch('MED-P-E55D5BEB');
            }}
          >
            Amrutha (MED-P-E55D5BEB) &bull; Annual Wellness Screen (Approved)
          </button>
        </div>
      </div>

      {/* Error / Invalid ID State */}
      {errorMsg && (
        <div className="lookup-state-card state-error">
          <AlertTriangle width={22} height={22} />
          <div>
            <strong>Invalid Patient ID</strong>
            <p>{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Loading Indicator State */}
      {searching && (
        <div className="lookup-state-card state-loading">
          <div className="loading-spinner-ring" />
          <p>Verifying Patient ID and checking consent authorization in Firestore...</p>
        </div>
      )}

      {/* Results View */}
      {lookupResult && !searching && (
        <div className="lookup-results-wrapper">
          {/* STATE 1 & 2: NO ACCESS OR PENDING CONSENT */}
          {!lookupResult.records_authorized && (
            <div className="consent-gate-card">
              <div className="gate-header">
                <div className="gate-icon-badge">
                  <ShieldCheck width={28} height={28} />
                </div>
                <div>
                  <div className="flex-row items-center gap-2">
                    <h3>Patient Record Protected: {lookupResult.patient_name}</h3>
                    <span className="patient-id-badge">{lookupResult.patient_id}</span>
                  </div>
                  <p className="gate-subtitle">
                    In compliance with MedSync Patient Privacy Governance, complete medical history is restricted until patient consent is granted.
                  </p>
                </div>
              </div>

              {lookupResult.status === 'pending' ? (
                <div className="consent-status-banner banner-pending">
                  <Clock width={20} height={20} className="pulse-icon" />
                  <div>
                    <strong>Consent Request Pending Patient Approval</strong>
                    <p>
                      An access request for <em>"{lookupResult.purpose}"</em> was dispatched to {lookupResult.patient_name} on {lookupResult.requested_at || 'Recently'}. The patient must approve before records are unlocked.
                    </p>
                  </div>
                </div>
              ) : lookupResult.status === 'rejected' ? (
                <div className="consent-status-banner banner-rejected">
                  <AlertTriangle width={20} height={20} />
                  <div>
                    <strong>Access Request Declined by Patient</strong>
                    <p>The patient has rejected authorization to share their medical records. You may re-submit a request with a revised clinical purpose.</p>
                  </div>
                </div>
              ) : lookupResult.status === 'revoked' ? (
                <div className="consent-status-banner banner-rejected">
                  <AlertTriangle width={20} height={20} />
                  <div>
                    <strong>Access Revoked by Patient</strong>
                    <p>Previous authorization was revoked by the patient. A new consent request is required.</p>
                  </div>
                </div>
              ) : (
                <div className="consent-request-box">
                  <div className="flex-row items-center gap-2 mb-2">
                    <Plus width={16} height={16} className="text-teal" />
                    <strong>Request Patient Authorization:</strong>
                  </div>
                  <form onSubmit={handleRequestAccess} className="request-access-form">
                    <div className="form-group flex-1">
                      <label>Clinical Consultation Purpose:</label>
                      <select
                        value={requestPurpose}
                        onChange={(e) => setRequestPurpose(e.target.value)}
                      >
                        <option value="Clinical Consultation & Medication Review">Clinical Consultation &amp; Medication Review</option>
                        <option value="Diabetic & Metabolic Screening Follow-up">Diabetic &amp; Metabolic Screening Follow-up</option>
                        <option value="Prescription Refill & Dosage Adjustment">Prescription Refill &amp; Dosage Adjustment</option>
                        <option value="Emergency Care & Pre-Operative Assessment">Emergency Care &amp; Pre-Operative Assessment</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="btn-send-access-req"
                      disabled={requesting}
                    >
                      {requesting ? 'Dispatching...' : 'Request Patient Access'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* STATE 3: APPROVED ACCESS - FULL MEDICAL DOSSIER */}
          {lookupResult.records_authorized && (
            <div className="authorized-dossier-container">
              {/* Authorized Banner */}
              <div className="access-granted-banner">
                <div className="flex-row items-center gap-2">
                  <ShieldCheck width={22} height={22} className="text-emerald" />
                  <div>
                    <strong>Authorized Patient Medical Dossier &bull; Consent Active</strong>
                    <span className="access-meta-sub">
                      Authorized by {lookupResult.profile?.full_name} for Dr. Emily Carter &bull; Purpose: {lookupResult.access_info?.purpose}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-toggle-audit"
                  onClick={() => setShowAuditLogs(!showAuditLogs)}
                >
                  <Clock width={15} height={15} />
                  <span>{showAuditLogs ? 'Hide Audit Log' : 'View Access Audit Log'}</span>
                </button>
              </div>

              {/* Patient Identity & Demographics Bar */}
              <div className="patient-demographics-card">
                <div className="demographics-avatar-box">
                  <div className="demographics-avatar">
                    {lookupResult.profile?.full_name ? lookupResult.profile.full_name.charAt(0) : 'P'}
                  </div>
                  <span className="avatar-status-dot" title="Active Patient Profile" />
                </div>
                <div className="demographics-info">
                  <div className="demographics-header-row">
                    <div className="patient-name-wrapper">
                      <h3 className="patient-name-heading">{lookupResult.profile?.full_name}</h3>
                      <span className="patient-id-badge large">{lookupResult.profile?.patient_id}</span>
                      <span className="verified-badge">✓ Verified Patient</span>
                    </div>
                  </div>
                  <p className="demographics-condition-sub">
                    Primary Care Plan / Diagnosis: <strong>{lookupResult.profile?.condition || 'General Preventative Health Maintenance'}</strong>
                  </p>
                  <div className="demographics-chips-grid">
                    <div className="vital-chip">
                      <span className="chip-label">AGE</span>
                      <strong className="chip-value">{lookupResult.profile?.age} yrs</strong>
                    </div>
                    <div className="vital-chip">
                      <span className="chip-label">GENDER</span>
                      <strong className="chip-value">{lookupResult.profile?.gender}</strong>
                    </div>
                    <div className="vital-chip vital-chip-accent">
                      <span className="chip-label">BLOOD GROUP</span>
                      <strong className="chip-value text-teal">{lookupResult.profile?.blood_group}</strong>
                    </div>
                    <div className="vital-chip">
                      <span className="chip-label">LOCATION</span>
                      <strong className="chip-value">{lookupResult.profile?.city}</strong>
                    </div>
                    <div className="vital-chip vital-chip-contact">
                      <span className="chip-label">EMERGENCY CONTACT</span>
                      <strong className="chip-value">{lookupResult.profile?.emergency_contact}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documented Allergies Warning Strip */}
              {lookupResult.allergies?.length > 0 && (
                <div className="dossier-allergies-banner">
                  <div className="allergies-banner-icon">
                    <AlertTriangle width={20} height={20} className="text-red" />
                  </div>
                  <div className="allergies-content">
                    <span className="allergies-heading">Critical Drug Allergies &amp; Documented Precautions:</span>
                    <div className="allergy-pills-row">
                      {lookupResult.allergies.map((alg) => {
                        const isNkda = alg.name.toLowerCase().includes('zero') || alg.severity === 'None';
                        return (
                          <span
                            key={alg.name}
                            className={`allergy-warning-pill ${isNkda ? 'pill-nkda' : `pill-sev-${(alg.severity || 'moderate').toLowerCase()}`}`}
                          >
                            <strong>{alg.name}</strong>
                            {alg.reaction && alg.reaction !== 'None' ? `: ${alg.reaction}` : ''}
                            <span className="allergy-severity-badge">({alg.severity})</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Two Column Medical Dossier Sections */}
              <div className="dossier-columns-grid">
                {/* Left Column: Active Medications & Prescriptions */}
                <div className="dossier-column">
                  {/* Medications & Schedule */}
                  <div className="dossier-card">
                    <div className="dossier-card-header">
                      <div className="flex-row items-center gap-2">
                        <Pill width={18} height={18} className="text-teal" />
                        <h4>Active Medications Regimen</h4>
                      </div>
                      <span className="badge-pill-outline">{lookupResult.medications?.length || 0} Meds</span>
                    </div>

                    <div className="dossier-items-list">
                      {lookupResult.medications?.map((med) => (
                        <div key={med.id || med.medicine_name} className="dossier-item">
                          <div className="dossier-item-header">
                            <strong className="dossier-item-name">{med.medicine_name}</strong>
                            <span className="dosage-pill">{med.dosage}</span>
                          </div>
                          <p className="dossier-sub">{med.frequency} &bull; Prescribed by {med.doctor_name || 'Cardiologist'}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prescriptions & Refills */}
                  <div className="dossier-card">
                    <div className="dossier-card-header">
                      <div className="flex-row items-center gap-2">
                        <FileText width={18} height={18} className="text-blue" />
                        <h4>Active Prescriptions &amp; Refills</h4>
                      </div>
                      <span className="badge-pill-outline">{lookupResult.prescriptions?.length || 0} Rx</span>
                    </div>

                    <div className="dossier-items-list">
                      {lookupResult.prescriptions?.map((rx) => (
                        <div key={rx.id || rx.medication_name} className="dossier-item">
                          <div className="dossier-item-header">
                            <strong className="dossier-item-name">
                              {rx.medication_name} <span className="rx-strength-tag">{rx.dosage}</span>
                            </strong>
                            <span className="refill-counter-badge">{rx.refills_remaining} Refills Left</span>
                          </div>
                          <p className="dossier-sub">{rx.instructions}</p>
                          <div className="dossier-item-footer">
                            <span className="issued-tag">Issued: {rx.issued_date || '2026-10-18'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Uploaded Clinical Documents */}
                  <div className="dossier-card">
                    <div className="dossier-card-header">
                      <div className="flex-row items-center gap-2">
                        <FileText width={18} height={18} className="text-teal" />
                        <h4>Medical Reports &amp; Prescriptions</h4>
                      </div>
                      <span className="badge-pill-outline">{lookupResult.documents?.length || 0} Files</span>
                    </div>

                    <div className="dossier-items-list">
                      {lookupResult.documents?.map((doc) => (
                        <div key={doc.id || doc.title} className="dossier-item flex-row items-center justify-between">
                          <div className="doc-item-details">
                            <strong className="dossier-item-name">{doc.title}</strong>
                            <p className="dossier-sub">{doc.file_type} &bull; {doc.file_size || '1.5 MB'} &bull; {doc.doctor_name}</p>
                          </div>
                          <button
                            type="button"
                            className="btn-preview-doc"
                            onClick={() => setPreviewDoc(doc)}
                          >
                            <Eye width={14} height={14} />
                            <span>View</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Disease History, Treatment Notes, Appointments */}
                <div className="dossier-column">
                  {/* Clinical Disease History */}
                  <div className="dossier-card">
                    <div className="dossier-card-header">
                      <div className="flex-row items-center gap-2">
                        <Calendar width={18} height={18} className="text-teal" />
                        <h4>Clinical Medical History</h4>
                      </div>
                      <span className="badge-pill-outline">{lookupResult.disease_history?.length || 0} Records</span>
                    </div>

                    <div className="dossier-items-list">
                      {lookupResult.disease_history?.map((dh) => (
                        <div key={dh.id || dh.disease_name} className="dossier-item">
                          <div className="dossier-item-header">
                            <strong className="dossier-item-name">{dh.disease_name}</strong>
                            <span className={`severity-tag sev-${(dh.severity || 'Moderate').toLowerCase()}`}>
                              {dh.severity}
                            </span>
                          </div>
                          <p className="dossier-sub">{dh.notes}</p>
                          <div className="dossier-item-footer">
                            <span className="diagnosed-tag">Diagnosed: {dh.diagnosed_on || '2024-05-10'} by {dh.doctor_name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Doctor Clinical Treatment Notes */}
                  <div className="dossier-card treatment-notes-card">
                    <div className="dossier-card-header">
                      <div className="flex-row items-center gap-2">
                        <FileText width={18} height={18} className="text-teal" />
                        <h4>Doctor Consultation &amp; Treatment Notes</h4>
                      </div>
                      <button
                        type="button"
                        className="btn-add-note"
                        onClick={() => setNoteFormOpen(!noteFormOpen)}
                      >
                        <Plus width={14} height={14} />
                        <span>{noteFormOpen ? 'Close Form' : 'Add Clinical Note'}</span>
                      </button>
                    </div>

                    {noteFormOpen && (
                      <form onSubmit={handleAddNoteSubmit} className="treatment-note-form">
                        <div className="form-group">
                          <label>Clinical Note Title *</label>
                          <input
                            type="text"
                            placeholder="e.g. Follow-up Observation on Blood Pressure"
                            value={noteTitle}
                            onChange={(e) => setNoteTitle(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Observations &amp; Recommendations *</label>
                          <textarea
                            rows="3"
                            placeholder="Record clinical exam notes, adjustments, and follow-up plan..."
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex-row justify-end gap-2">
                          <button
                            type="button"
                            className="btn-cancel"
                            onClick={() => setNoteFormOpen(false)}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="btn-confirm-save"
                            disabled={savingNote}
                          >
                            {savingNote ? 'Recording...' : 'Save & Log Note'}
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="dossier-items-list">
                      {lookupResult.treatment_notes?.map((tn) => (
                        <div key={tn.id || tn.uuid} className="treatment-note-entry">
                          <div className="treatment-note-header">
                            <strong className="treatment-note-title">{tn.note_title}</strong>
                            <span className="note-date">{tn.created_at}</span>
                          </div>
                          <p className="note-content-text">{tn.content}</p>
                          <div className="dossier-item-footer">
                            <span className="note-author">Recorded by {tn.doctor_name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Appointment History */}
                  <div className="dossier-card">
                    <div className="dossier-card-header">
                      <div className="flex-row items-center gap-2">
                        <Calendar width={18} height={18} className="text-blue" />
                        <h4>Appointment History</h4>
                      </div>
                      <span className="badge-pill-outline">{lookupResult.appointments?.length || 0} Visits</span>
                    </div>

                    <div className="dossier-items-list">
                      {lookupResult.appointments?.map((apt) => (
                        <div key={apt.id || apt.uuid} className="dossier-item">
                          <div className="dossier-item-header">
                            <strong className="dossier-item-name">{apt.doctor_name} ({apt.specialty})</strong>
                            <span className="status-badge badge-confirmed">{apt.status}</span>
                          </div>
                          <p className="dossier-sub">{apt.reason}</p>
                          <div className="dossier-item-footer">
                            <span className="issued-tag">{apt.appointment_date} at {apt.appointment_time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Audit Log Drawer */}
              {showAuditLogs && (
                <div className="audit-log-drawer">
                  <div className="audit-header">
                    <div className="flex-row items-center gap-2">
                      <Clock width={18} height={18} className="text-teal" />
                      <h4>HIPAA &amp; Security Access Audit Trail for {lookupResult.profile?.patient_id}</h4>
                    </div>
                    <span className="audit-count">{auditLogs.length} Events</span>
                  </div>

                  <div className="audit-table-wrapper">
                    <table className="audit-table">
                      <thead>
                        <tr>
                          <th>Timestamp</th>
                          <th>Doctor / Practitioner</th>
                          <th>Action</th>
                          <th>Details</th>
                          <th>Terminal IP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.map((log) => (
                          <tr key={log.id || log.uuid}>
                            <td>{log.timestamp}</td>
                            <td><strong>{log.doctor_name}</strong> ({log.doctor_email})</td>
                            <td>
                              <span className={`audit-badge badge-${log.action?.toLowerCase()}`}>
                                {log.action}
                              </span>
                            </td>
                            <td>{log.details}</td>
                            <td><code>{log.ip_address || '127.0.0.1'}</code></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="modal-backdrop">
          <div className="modal-content-card doc-preview-modal">
            <div className="modal-header">
              <div className="flex-row items-center gap-2">
                <FileText width={20} height={20} className="text-teal" />
                <div>
                  <h3>{previewDoc.title}</h3>
                  <p>Authorized Clinical Record &bull; Patient {lookupResult?.profile?.patient_id}</p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setPreviewDoc(null)}
              >
                <X width={18} height={18} />
              </button>
            </div>

            <div className="doc-preview-body">
              <div className="rx-preview-sheet">
                <div className="rx-sheet-header">
                  <div className="rx-sheet-logo">
                    <strong>MedSync Clinical Dossier</strong>
                    <span>Verified Medical Vault Document</span>
                  </div>
                  <div className="rx-sheet-meta">
                    <span>Uploaded: {previewDoc.uploaded_date || '2026-10-18'}</span>
                    <span>Provider: {previewDoc.doctor_name}</span>
                  </div>
                </div>
                <div className="rx-sheet-divider" />
                <div className="rx-sheet-content">
                  <h4>DOCUMENT CONTENT</h4>
                  <p><strong>Title:</strong> {previewDoc.title}</p>
                  <p><strong>Physician:</strong> {previewDoc.doctor_name}</p>
                  <p><strong>Format:</strong> {previewDoc.file_type} ({previewDoc.file_size || '1.8 MB'})</p>
                  <p><strong>Clinical Notes:</strong> {previewDoc.notes || 'Baseline cardiovascular panel results and prescription regimen.'}</p>
                </div>
                <div className="rx-sheet-footer">
                  <ShieldCheck width={18} height={18} className="text-teal" />
                  <span>Authorized for Dr. Emily Carter under active patient consent.</span>
                </div>
              </div>
            </div>

            <div className="modal-actions-row">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setPreviewDoc(null)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
