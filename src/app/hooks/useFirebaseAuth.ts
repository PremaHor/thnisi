import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "../lib/firebase";
import { ensureUserDocument, consumeGoogleRedirectResult } from "../../lib/auth";

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

    // Consume any pending Google redirect result (iOS PWA redirect sign-in).
    // This must run before onAuthStateChanged subscription so the resolved
    // user fires through the normal auth state pipeline.
    void consumeGoogleRedirectResult();

    const auth = getFirebaseAuth();
    let cancelled = false;
    // Debounce timer: when onAuthStateChanged fires with null, we wait briefly
    // before accepting it as the final state. On iOS PWA, Firebase can fire null
    // before it has fully restored the session from IndexedDB, which would
    // incorrectly redirect authenticated users to the sign-in page.
    let nullDebounceTimer: ReturnType<typeof setTimeout> | null = null;

    const commitNull = () => {
      if (cancelled) return;
      nullDebounceTimer = null;
      // #region agent log
      fetch('http://127.0.0.1:7942/ingest/25be6b19-1e16-4c08-b1ae-27fa0e446bf5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e70cc9'},body:JSON.stringify({sessionId:'e70cc9',location:'useFirebaseAuth.ts:commitNull',message:'debounce expired – setting user null',data:{timestamp:Date.now()},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      setUser(null);
      setError(null);
      setLoading(false);
    };

    const unsubscribe = onAuthStateChanged(
      auth,
      async (u) => {
        if (cancelled) return;

        // Cancel any pending "commit null" debounce
        if (nullDebounceTimer !== null) {
          clearTimeout(nullDebounceTimer);
          nullDebounceTimer = null;
        }

        // #region agent log
        fetch('http://127.0.0.1:7942/ingest/25be6b19-1e16-4c08-b1ae-27fa0e446bf5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e70cc9'},body:JSON.stringify({sessionId:'e70cc9',location:'useFirebaseAuth.ts:onAuthStateChanged',message:u?'user received':'null received',data:{uid:u?.uid??null,email:u?.email??null,timestamp:Date.now()},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
        // #endregion

        if (u) {
          try { await ensureUserDocument(u); } catch { /* ignore */ }
          if (cancelled) return;
          // #region agent log
          fetch('http://127.0.0.1:7942/ingest/25be6b19-1e16-4c08-b1ae-27fa0e446bf5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e70cc9'},body:JSON.stringify({sessionId:'e70cc9',location:'useFirebaseAuth.ts:afterEnsure',message:'setUser called',data:{uid:u.uid,cancelled},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          setUser(u);
          setError(null);
          setLoading(false);
        } else {
          // Delay setting null by 1200 ms — if the real user fires within this
          // window (iOS session restoration), the timer is cancelled above.
          nullDebounceTimer = setTimeout(commitNull, 1200);
        }
      },
      (e) => {
        if (cancelled) return;
        if (nullDebounceTimer !== null) {
          clearTimeout(nullDebounceTimer);
          nullDebounceTimer = null;
        }
        setError(e);
        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
      if (nullDebounceTimer !== null) clearTimeout(nullDebounceTimer);
      unsubscribe();
    };
  }, []);

  return { user, loading, error, configured, isAuthenticated: Boolean(user) };
}
