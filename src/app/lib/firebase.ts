import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const appId = import.meta.env.VITE_FIREBASE_APP_ID;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;

export function isFirebaseConfigured(): boolean {
  return Boolean(
    apiKey && projectId && appId && authDomain && storageBucket && messagingSenderId
  );
}

let app: FirebaseApp | null = null;
let firestore: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;

function getConfig() {
  return {
    apiKey: apiKey!,
    projectId: projectId!,
    appId: appId!,
    authDomain: authDomain!,
    storageBucket: storageBucket!,
    messagingSenderId: messagingSenderId!,
  };
}

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase není nakonfigurován. Doplňte proměnné VITE_FIREBASE_* v .env");
  }
  if (!getApps().length) {
    const c = getConfig();
    app = initializeApp({
      apiKey: c.apiKey,
      authDomain: c.authDomain,
      projectId: c.projectId,
      storageBucket: c.storageBucket,
      messagingSenderId: c.messagingSenderId,
      appId: c.appId,
    });
  } else {
    app = getApp();
  }
  return app;
}

export function getDb(): Firestore {
  if (firestore) return firestore;
  firestore = getFirestore(getFirebaseApp());
  return firestore;
}

export function getFirebaseAuth(): Auth {
  if (auth) return auth;
  auth = getAuth(getFirebaseApp());
  return auth;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (storage) return storage;
  storage = getStorage(getFirebaseApp());
  return storage;
}
