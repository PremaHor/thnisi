import {
  EmailAuthProvider,
  GoogleAuthProvider,
  linkWithCredential,
  signInWithPopup,
  getRedirectResult,
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
provider.addScope("profile");
provider.addScope("email");

/**
 * Consumes a pending Google redirect result on app startup.
 * This is a safety-net for any stale redirect state left in storage
 * (e.g. from a previous redirect attempt). Returns user or null.
 */
export async function consumeGoogleRedirectResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      try { await ensureUserDocument(result.user); } catch { /* non-fatal */ }
      return result.user;
    }
  } catch {
    // No redirect result, or error — ignore
  }
  return null;
}

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

/**
 * Google sign-in using popup in all environments.
 *
 * iOS < 16.4 in PWA standalone blocks window.open() → auth/popup-blocked.
 * iOS ≥ 16.4 in PWA standalone supports window.open() → popup works.
 *
 * signInWithRedirect is intentionally NOT used for PWA because it navigates
 * the entire page away from the PWA context; iOS then opens the return URL
 * in Safari instead of returning to the PWA, breaking the auth flow entirely.
 *
 * If popup is blocked the caller receives the auth/popup-blocked error which
 * maps to a user-friendly message in firebaseAuthErrors.ts.
 */
export const signInWithGoogle = async (): Promise<User | null> => {
  // #region agent log
  const isPWA = typeof window !== "undefined" && (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
  fetch('http://127.0.0.1:7942/ingest/25be6b19-1e16-4c08-b1ae-27fa0e446bf5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e70cc9'},body:JSON.stringify({sessionId:'e70cc9',location:'auth.ts:signInWithGoogle',message:'starting popup sign-in',data:{isPWA,userAgent:navigator.userAgent.substring(0,120)},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  const result = await signInWithPopup(auth, provider);
  // #region agent log
  fetch('http://127.0.0.1:7942/ingest/25be6b19-1e16-4c08-b1ae-27fa0e446bf5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e70cc9'},body:JSON.stringify({sessionId:'e70cc9',location:'auth.ts:signInWithGoogle',message:'popup success',data:{uid:result.user.uid,email:result.user.email},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
  // #endregion
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
