import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBQPOxX3Bd9bLcNKmGiCB4q9bKFgf3mPVU",
  authDomain: "joblifyhq.firebaseapp.com",
  projectId: "joblifyhq",
  storageBucket: "joblifyhq.firebasestorage.app",
  messagingSenderId: "431701069746",
  appId: "1:431701069746:web:fd369d1c754ecd9fd89eab",
  measurementId: "G-4CC79TR5TL"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics — only in browser, never during build/SSR
export const getAnalyticsInstance = () => {
  if (typeof window !== 'undefined') {
    return import('firebase/analytics').then(({ getAnalytics }) => getAnalytics(app));
  }
  return null;
};

export default app;
