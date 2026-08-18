import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "development-placeholder",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "salaf-platform.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "salaf-platform",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "salaf-platform.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:1234567890abcdef"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const authPersistenceReady = setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Unable to enable browser-local authentication persistence:', error);
});
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
