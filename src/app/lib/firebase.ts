import { app, auth, db, isFirebaseConfigured, storage } from "../../firebase";

export { isFirebaseConfigured };

export function getFirebaseApp() {
  return app;
}

export function getDb() {
  return db;
}

export function getFirebaseAuth() {
  return auth;
}

export function getFirebaseStorage() {
  return storage;
}
