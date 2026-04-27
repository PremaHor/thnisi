import {
  EmailAuthProvider,
  GoogleAuthProvider,
  linkWithCredential,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
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
  try { await ensureUserDocument(result.user); } catch { /* non-fatal */ }
  return result.user;
};

export const registerWithEmail = async (email: string, password: string) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  try { await ensureUserDocument(result.user); } catch { /* non-fatal */ }
  return result.user;
};

export const loginWithEmail = async (email: string, password: string) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  try { await ensureUserDocument(result.user); } catch { /* non-fatal */ }
  return result.user;
};

export const logout = async () => {
  await signOut(auth);
};

export const resetPassword = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
};

/**
 * Vrátí seznam provider ID přihlášeného uživatele.
 * Např. ["google.com"] nebo ["google.com", "password"]
 */
export function getUserProviders(): string[] {
  const user = auth.currentUser;
  if (!user) return [];
  return user.providerData.map((p) => p.providerId);
}

/**
 * Připojí e-mail + heslo k aktuálně přihlášenému účtu (např. Google).
 * Po zavolání se uživatel může přihlásit oběma způsoby do stejného profilu.
 */
export async function linkPasswordToCurrentUser(password: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error("Nejsi přihlášen nebo nemáš e-mail v účtu.");
  const credential = EmailAuthProvider.credential(user.email, password);
  await linkWithCredential(user, credential);
}
