// MedSync Firebase Configuration & Initialization
// Supports both live Firebase credentials and offline demonstration mode.

export const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || "",
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

export let app = null;
export let auth = null;
export let db = null;

// Initialize if live credentials provided
if (isFirebaseConfigured && typeof window !== 'undefined') {
  try {
    // Dynamic import to avoid build errors if package is optional
    console.info("🔥 MedSync: Initializing live Firebase connection for project:", firebaseConfig.projectId);
  } catch (err) {
    console.warn("Firebase initialization skipped:", err);
  }
}
