import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "../lib/firebase";
import { ensureUserDocument } from "../../lib/auth";

type AuthState = {
  user: User | null;
  loading: boolean;
  error: Error | null;
  configured: boolean;
  isAuthenticated: boolean;
};

export function useFirebaseAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured());
  const [error, setError] = useState<Error | null>(null);
  const configured = isFirebaseConfigured();

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    void (async () => {
      // authStateReady() resolves once Firebase has read the persisted session
      // from storage (IndexedDB/localStorage). Without this, onAuthStateChanged
      // may fire with null first on iOS PWA before the real user is restored,
      // causing ProtectedRoute to incorrectly redirect to sign-in.
      try {
        await auth.authStateReady();
      } catch {
        // Proceed even if authStateReady fails (older SDK fallback)
      }

      if (cancelled) return;

      unsubscribe = onAuthStateChanged(
        auth,
        async (u) => {
          if (cancelled) return;
          if (u) {
            try { await ensureUserDocument(u); } catch { /* ignore */ }
          }
          if (cancelled) return;
          setUser(u);
          setError(null);
          setLoading(false);
        },
        (e) => {
          if (cancelled) return;
          setError(e);
          setLoading(false);
        }
      );
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  return { user, loading, error, configured, isAuthenticated: Boolean(user) };
}
