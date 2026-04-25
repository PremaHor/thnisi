import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { auth } from "../firebase";
import { db } from "../firebase";

const provider = new GoogleAuthProvider();

export async function ensureUserDocument(user: User) {
  const ref = doc(db, "users", user.uid);
  const existing = await getDoc(ref);
  const fallbackName =
    user.displayName?.trim() ||
    user.email?.split("@")[0]?.trim() ||
    "";

  if (!existing.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email ?? "",
      name: fallbackName,
      bio: "",
      location: "",
      avatarUrl: user.photoURL ?? "",
      completedTrades: 0,
      ratingAvg: 0,
      ratingCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return;
  }

  // Doplní jméno/avatar pokud je v dokumentu prázdné (např. starý dokument bez jména)
  const data = existing.data();
  const needsUpdate = (!data.name && fallbackName) || (!data.avatarUrl && user.photoURL);
  if (needsUpdate) {
    const patch: Record<string, unknown> = { updatedAt: serverTimestamp() };
    if (!data.name && fallbackName) patch.name = fallbackName;
    if (!data.avatarUrl && user.photoURL) patch.avatarUrl = user.photoURL;
    await updateDoc(ref, patch);
  }
}

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, provider);
  await ensureUserDocument(result.user);
  return result.user;
};

export const registerWithEmail = async (email: string, password: string) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await ensureUserDocument(result.user);
  return result.user;
};

export const loginWithEmail = async (email: string, password: string) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserDocument(result.user);
  return result.user;
};

export const logout = async () => {
  await signOut(auth);
};
