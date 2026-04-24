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
          const code =
            typeof e === "object" && e !== null && "code" in e
              ? String((e as { code: string }).code)
              : "";
          let msg = e instanceof Error ? e.message : String(e);
          if (code === "auth/operation-not-allowed") {
            msg =
              "Anonymní přihlášení není zapnuté. V Firebase Console → Authentication → Sign-in method povolte „Anonymous“.";
          } else if (code === "auth/configuration-not-found" || code === "auth/invalid-api-key") {
            msg =
              "Neplatná nebo chybějící Firebase konfigurace. Zkontrolujte VITE_FIREBASE_* v .env a znovu spusťte dev server / build.";
          }
          setError(new Error(msg));
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
