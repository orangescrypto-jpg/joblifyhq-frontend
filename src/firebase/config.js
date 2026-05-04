import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// 🔥 Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBQPOxX3Bd9bLcNKmGiCB4q9bKFgf3mPVU",
  authDomain: "joblifyhq.firebaseapp.com",
  projectId: "joblifyhq",
  storageBucket: "joblifyhq.firebasestorage.app",
  messagingSenderId: "431701069746",
  appId: "1:431701069746:web:fd369d1c754ecd9fd89eab",
  measurementId: "G-4CC79TR5TL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
