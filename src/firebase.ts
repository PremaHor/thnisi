import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserPopupRedirectResolver,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey:
    (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_FIREBASE_API_KEY ?? "",
  authDomain:
    (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_FIREBASE_AUTH_DOMAIN ??
    "",
  projectId:
    (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_FIREBASE_PROJECT_ID ??
    "",
  storageBucket:
    (import.meta as { env?: Record<string, string | undefined> }).env
      ?.VITE_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId:
    (import.meta as { env?: Record<string, string | undefined> }).env
      ?.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId:
    (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_FIREBASE_APP_ID ?? "",
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.storageBucket &&
      firebaseConfig.messagingSenderId &&
      firebaseConfig.appId
  );
}

export const app = initializeApp(firebaseConfig);

// Matches getAuth() defaults exactly:
//   – persistence: IndexedDB → localStorage fallback (same as getAuth)
//   – popupRedirectResolver: required for signInWithPopup AND signInWithRedirect
// Using initializeAuth (not getAuth) sets persistence synchronously at
// creation time, removing the race condition with getAuth+setPersistence.
export const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence],
  popupRedirectResolver: browserPopupRedirectResolver,
});

export const db = getFirestore(app);
export const storage = getStorage(app);

