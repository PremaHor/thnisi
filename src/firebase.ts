import { initializeApp } from "firebase/app";
import { initializeAuth, indexedDBLocalPersistence, browserLocalPersistence } from "firebase/auth";
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

// Use initializeAuth with the same persistence chain as getAuth() default:
// IndexedDB first (preferred, same as the old getAuth default),
// localStorage as fallback. This ensures old sessions stored in IndexedDB
// are still found after upgrading from getAuth to initializeAuth.
// Persistence is set synchronously at creation time — no race condition.
export const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence],
});

export const db = getFirestore(app);
export const storage = getStorage(app);

// #region agent log
if (isFirebaseConfigured()) {
  const lsKeys = Object.keys(localStorage).filter((k) => k.startsWith("firebase:"));
  fetch('http://127.0.0.1:7942/ingest/25be6b19-1e16-4c08-b1ae-27fa0e446bf5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e70cc9'},body:JSON.stringify({sessionId:'e70cc9',location:'firebase.ts:init',message:'auth initialized',data:{persistenceType:'[indexedDBLocalPersistence, browserLocalPersistence]',localStorageFirebaseKeys:lsKeys,hasSessionInLS:lsKeys.length>0},timestamp:Date.now(),runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
}
// #endregion
