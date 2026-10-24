# 🔥 MedSync Firebase & Firestore Setup Guide

This guide explains how to connect **MedSync** to Google Firebase Authentication and Cloud Firestore for production-grade security, immutable Patient IDs, and patient consent governance.

---

## 1. Create a Firebase Project

1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project**, enter project name `medsync-healthcare`, and follow the prompts.
3. Once created, click on **Project Settings** (gear icon) and add a **Web App** (`</>`).
4. Copy the `firebaseConfig` keys provided.

---

## 2. Configure Environment Variables

Create a file named `.env` in `frontend/`:

```env
VITE_FIREBASE_API_KEY=AIzaSyAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=medsync-healthcare.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=medsync-healthcare
VITE_FIREBASE_STORAGE_BUCKET=medsync-healthcare.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

---

## 3. Enable Authentication & Firestore

1. In the Firebase Console, go to **Build** &rarr; **Authentication** &rarr; **Sign-in method**.
2. Enable **Email/Password**.
3. Under **Build** &rarr; **Firestore Database**, click **Create database**.
4. Select **Start in production mode** and choose your region (e.g. `asia-south1` or `us-central1`).

---

## 4. Deploy Firestore Security Rules

Install the Firebase CLI and deploy the custom [`firestore.rules`](./firestore.rules) file:

```bash
npm install -g firebase-tools
firebase login
firebase use --add medsync-healthcare
firebase deploy --only firestore:rules
```

### Security Rules Summary
- **Immutable Patient ID**: `request.resource.data.patientId == resource.data.patientId` ensures patient IDs can never be altered or hijacked.
- **Strict Doctor Authorization**: Doctors can only access patient medical records if an active approved document exists in `doctor_access/{doctorId_patientId}` with `status == 'approved'`.
- **Consent Governance**: Only the patient can update access status (`approved`, `rejected`, `revoked`).
- **Audit Log Immutability**: All access and note creation events in `access_logs` are strictly append-only; updates and deletions are forbidden (`allow update, delete: if false`).

---

## 5. Dual-Mode Architecture (Production & Local Demo)

MedSync features a **resilient hybrid architecture**:
- When Firebase environment keys are configured, it seamlessly communicates with Cloud Firestore and Firebase Auth.
- For local testing, evaluation, and MCA project demonstration, MedSync includes an identical local SQLite backend service running at `http://127.0.0.1:8000` that enforces the exact same authorization, consent workflow, and audit logging rules without requiring third-party cloud billing.
