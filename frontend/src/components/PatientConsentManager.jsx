import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  X,
  Users,
  Share2,
} from './Icons';
import {
  getPatientAccessRequests,
  respondToAccessRequest,
  revokeAccess,
  getAuditLogs,
} from '../firebase/firestoreService';
import '../PatientLookup.css';

export default function PatientConsentManager({
  currentUser,
  onShowToast,
}) {
  const patientId = currentUser?.patient_id || 'MED-P-88492014';
  const patientName = currentUser?.full_name || 'Alice Johnson';

  const [requests, setRequests] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [reqs, logs] = await Promise.all([
        getPatientAccessRequests(patientId, patientName),
        getAuditLogs(patientId),
      ]);
      setRequests(reqs);
      setAuditLogs(logs);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [patientId, patientName]);

  const copyPatientId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(patientId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      if (onShowToast) onShowToast(`Patient ID "${patientId}" copied to clipboard!`);
    }
  };

  const shareWithDoctor = async () => {
    const shareText = `Hello Doctor, here is my MedSync Patient ID: ${patientId}. You can enter this ID in your MedSync Doctor Portal to request authorized access to my medical history and medication regimen.`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `MedSync Patient ID - ${patientName}`,
          text: shareText,
          url: window.location.origin,
        });
        if (onShowToast) onShowToast('Patient ID shared with doctor successfully!');
        return;
      } catch {
        // User cancelled
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      if (onShowToast) onShowToast('Doctor share message copied! You can paste in WhatsApp, SMS, or Email.');
    }
  };

  const handleRespond = async (uuid, status) => {
    try {
      await respondToAccessRequest(uuid, status);
      if (onShowToast) {
        onShowToast(status === 'approved' ? 'Doctor medical access approved.' : 'Doctor access request declined.');
      }
      loadData();
    } catch (err) {
      alert(err.message || 'Error updating access request.');
    }
  };

  const handleRevoke = async (uuid) => {
    if (!window.confirm('Are you sure you want to revoke this doctor\'s access to your medical records?')) return;
    try {
      await revokeAccess(uuid);
      if (onShowToast) onShowToast('Doctor access to medical records revoked.');
      loadData();
    } catch (err) {
      alert(err.message || 'Error revoking access.');
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const approvedDoctors = requests.filter((r) => r.status === 'approved');

  return (
    <div className="patient-consent-manager-card">
      {/* Patient ID Banner */}
      <div className="patient-id-hero-banner">
        <div className="patient-id-badge-left">
          <span className="id-micro-label">YOUR SECURE PATIENT ID</span>
          <div className="patient-id-code-row">
            <strong className="patient-id-text">{patientId}</strong>
            <button
              type="button"
              className={`btn-copy-id ${copied ? 'copied' : ''}`}
              onClick={copyPatientId}
              title="Copy Patient ID to share with your doctor"
            >
              {copied ? '✓ Copied' : 'Copy ID'}
            </button>
            <button
              type="button"
              className="btn-share-id"
              onClick={shareWithDoctor}
              title="Share Patient ID with your doctor via device or message"
            >
              <Share2 width={14} height={14} />
              <span>Share with Doctor</span>
            </button>
          </div>
        </div>

        <div className="patient-id-info-right">
          <ShieldCheck width={18} height={18} className="text-teal" />
          <p>
            Share this ID with your attending physicians so they can request access to your medication regimen and health history.
          </p>
        </div>
      </div>

      {/* Pending Doctor Access Requests */}
      <div className="consent-sub-section">
        <div className="consent-section-title">
          <div className="flex-row items-center gap-2">
            <Clock width={16} height={16} className="text-amber" />
            <strong>Pending Access Requests from Doctors</strong>
          </div>
          <span className="badge-pill-outline">{pendingRequests.length} Pending</span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="consent-empty-notice">
            <span>✓ No pending access requests. Your records are completely secure.</span>
          </div>
        ) : (
          <div className="pending-requests-list">
            {pendingRequests.map((req) => (
              <div key={req.id || req.uuid} className="pending-request-item">
                <div className="pending-req-meta">
                  <div className="flex-row items-center gap-2">
                    <strong className="doctor-req-name">{req.doctor_name}</strong>
                    <span className="spec-badge">{req.doctor_specialty || 'Physician'}</span>
                  </div>
                  <p className="purpose-text"><strong>Purpose:</strong> {req.purpose}</p>
                  <span className="req-timestamp">Requested: {req.requested_at || 'Recently'}</span>
                </div>

                <div className="pending-actions-row">
                  <button
                    type="button"
                    className="btn-approve-access"
                    onClick={() => handleRespond(req.uuid, 'approved')}
                  >
                    <CheckCircle2 width={15} height={15} />
                    <span>Approve Access</span>
                  </button>
                  <button
                    type="button"
                    className="btn-reject-access"
                    onClick={() => handleRespond(req.uuid, 'rejected')}
                  >
                    <X width={15} height={15} />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Currently Authorized Doctors */}
      <div className="consent-sub-section">
        <div className="consent-section-title">
          <div className="flex-row items-center gap-2">
            <ShieldCheck width={16} height={16} className="text-teal" />
            <strong>Currently Authorized Doctors</strong>
          </div>
          <span className="badge-pill-outline">{approvedDoctors.length} Active</span>
        </div>

        {approvedDoctors.length === 0 ? (
          <div className="consent-empty-notice">
            <span>No doctors currently authorized to view your medical records.</span>
          </div>
        ) : (
          <div className="authorized-doctors-list">
            {approvedDoctors.map((doc) => (
              <div key={doc.id || doc.uuid} className="authorized-doc-item">
                <div className="auth-doc-info">
                  <div className="flex-row items-center gap-2">
                    <strong>{doc.doctor_name}</strong>
                    <span className="active-auth-pill">Active Consent</span>
                  </div>
                  <p className="auth-purpose-text">{doc.purpose}</p>
                  <span className="auth-since-tag">Authorized on: {doc.responded_at || doc.requested_at || 'Recently'}</span>
                </div>

                <button
                  type="button"
                  className="btn-revoke-access"
                  onClick={() => handleRevoke(doc.uuid)}
                  title="Immediately revoke this doctor's medical records access"
                >
                  Revoke Access
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Access Audit Trail Preview */}
      {auditLogs.length > 0 && (
        <div className="consent-sub-section">
          <div className="consent-section-title">
            <div className="flex-row items-center gap-2">
              <Clock width={16} height={16} className="text-teal" />
              <strong>Recent Record Access Activity Log (HIPAA Audit)</strong>
            </div>
            <span className="audit-micro-count">{auditLogs.slice(0, 3).length} Recent Events</span>
          </div>

          <div className="mini-audit-feed">
            {auditLogs.slice(0, 3).map((log) => (
              <div key={log.id || log.uuid} className="mini-audit-item">
                <span className="audit-time-pill">{log.timestamp}</span>
                <span className="audit-text">
                  <strong>{log.doctor_name}</strong>: {log.details}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
