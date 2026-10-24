// MedSync Clinical Data & Firestore Service
// Provides authorization-checked data operations for Patient ID lookup, consent management, and audit logging.

const API_BASE = "http://127.0.0.1:8000";

/**
 * Look up a patient by Patient ID (e.g. MED-P-88492014)
 * Returns masked metadata if consent not approved; full dossier if approved.
 */
export async function lookupPatientById(patientId, doctorEmail) {
  const encId = encodeURIComponent(patientId.trim().toUpperCase());
  const encDoc = encodeURIComponent(doctorEmail.trim().toLowerCase());
  const response = await fetch(`${API_BASE}/patient-lookup/${encId}?doctor_email=${encDoc}`);
  
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `No patient found with ID '${patientId}'.`);
  }
  return await response.json();
}

/**
 * Dispatch an access request from a doctor to a patient
 */
export async function requestPatientAccess({ patientId, purpose, doctorName, doctorEmail, doctorSpecialty }) {
  const response = await fetch(`${API_BASE}/access-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      patient_id: patientId.trim().toUpperCase(),
      purpose: purpose || "Clinical Consultation & Medication Review",
      doctor_name: doctorName,
      doctor_email: doctorEmail,
      doctor_specialty: doctorSpecialty || "Cardiology",
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to submit access request.");
  }
  return await response.json();
}

/**
 * Fetch consent requests and authorized doctors for a patient
 */
export async function getPatientAccessRequests(patientId, patientName) {
  const query = patientId ? `patient_id=${encodeURIComponent(patientId)}` : `patient_name=${encodeURIComponent(patientName)}`;
  const response = await fetch(`${API_BASE}/patient/access-requests?${query}`);
  if (!response.ok) return [];
  return await response.json();
}

/**
 * Patient approves or rejects a doctor's access request
 */
export async function respondToAccessRequest(requestUuid, status) {
  const response = await fetch(`${API_BASE}/access-requests/${requestUuid}/respond`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Unable to update access request.");
  }
  return await response.json();
}

/**
 * Patient revokes doctor's medical records access
 */
export async function revokeAccess(requestUuid) {
  const response = await fetch(`${API_BASE}/access-requests/${requestUuid}/revoke`, {
    method: "PATCH",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Unable to revoke access.");
  }
  return await response.json();
}

/**
 * Authorized doctor adds a clinical treatment note (append-only)
 */
export async function addTreatmentNote({ patientId, doctorName, doctorEmail, noteTitle, content }) {
  const response = await fetch(`${API_BASE}/treatment-notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      patient_id: patientId,
      doctor_name: doctorName,
      doctor_email: doctorEmail,
      note_title: noteTitle,
      content,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to add clinical treatment note.");
  }
  return await response.json();
}

/**
 * Fetch immutable audit logs for governance
 */
export async function getAuditLogs(patientId = "", doctorEmail = "") {
  let url = `${API_BASE}/audit-logs`;
  if (patientId) url += `?patient_id=${encodeURIComponent(patientId)}`;
  else if (doctorEmail) url += `?doctor_email=${encodeURIComponent(doctorEmail)}`;

  const response = await fetch(url);
  if (!response.ok) return [];
  return await response.json();
}
