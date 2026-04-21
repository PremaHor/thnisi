import { useEffect, useState } from "react";
import { onAuthStateChanged, signInAnonymously, type User } from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "../lib/firebase";

type AuthState = {
  user: User | null;
  loading: boolean;
  error: Error | null;
  configured: boolean;
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
    setLoading(true);
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(
      auth,
      async (u) => {
        if (u) {
          setUser(u);
          setError(null);
          setLoading(false);
          return;
        }
        try {
          const cred = await signInAnonymously(auth);
          setUser(cred.user);
          setError(null);
        } catch (e) {
          setError(e instanceof Error ? e : new Error(String(e)));
        } finally {
          setLoading(false);
        }
      },
      (e) => {
        setError(e);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  return { user, loading, error, configured };
}
