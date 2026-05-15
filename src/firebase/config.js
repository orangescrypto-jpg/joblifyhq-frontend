import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// All values MUST come from environment variables.
// Copy .env.example → .env.local and fill in your project values.
// NEVER hardcode API keys in source files.
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Guard: fail fast in development if any env var is missing
if (import.meta.env.DEV) {
  const missing = Object.entries(firebaseConfig)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length > 0) {
    console.error(
      `[Firebase] Missing environment variables: ${missing.join(', ')}.\n` +
      'Copy .env.example → .env.local and fill in your project values.'
    );
  }
}

const app = initializeApp(firebaseConfig);

export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);

// Analytics — only in browser, never during build/SSR
export const getAnalyticsInstance = () => {
  if (typeof window !== 'undefined') {
    return import('firebase/analytics').then(({ getAnalytics }) => getAnalytics(app));
  }
  return null;
};

export default app;
