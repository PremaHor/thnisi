import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { AppLogo } from "../components/AppLogo";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { mapFirebaseAuthError } from "../lib/firebaseAuthErrors";
import { loginWithEmail, signInWithGoogle, resetPassword } from "../../lib/auth";

function GoogleGIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTarget = (location.state as { from?: string } | null)?.from ?? "/";
  const wasRedirected = Boolean((location.state as { from?: string } | null)?.from);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);

  const handleResetPassword = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setErrors((e) => ({ ...e, email: "Zadejte e-mail pro reset hesla" }));
      return;
    }
    setResetBusy(true);
    setFormError(null);
    try {
      await resetPassword(trimmed);
      setResetSent(true);
    } catch (err) {
      setFormError(mapFirebaseAuthError(err));
    } finally {
      setResetBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setFormError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
      navigate(redirectTarget, { replace: true });
    } catch (e) {
      console.error("Google sign-in error:", e);
      // #region agent log
      const errCode = (e as { code?: string })?.code ?? "unknown";
      fetch('http://127.0.0.1:7942/ingest/25be6b19-1e16-4c08-b1ae-27fa0e446bf5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e70cc9'},body:JSON.stringify({sessionId:'e70cc9',location:'SignIn.tsx:handleGoogleSignIn',message:'Google sign-in error',data:{errorCode:errCode,errorMsg:String(e)},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      setFormError(mapFirebaseAuthError(e));
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    setFormError(null);

    if (!email) newErrors.email = "E-mail je povinný";
    if (!password) newErrors.password = "Heslo je povinné";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      await loginWithEmail(email.trim(), password);
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      console.error("Email sign-in error:", err);
      const msg = mapFirebaseAuthError(err);
      setFormError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-center">
          <AppLogo to="/" size="lg" />
        </div>
      </div>
      <div className="w-full max-w-sm rounded-[20px] border border-border bg-card p-5 shadow-[var(--shadow-elev-2)] sm:p-8">
        <div className="mb-6 text-center sm:mb-8">
          <h1>Vítej zpátky</h1>
        </div>

        {wasRedirected && !formError && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            Vaše přihlášení vypršelo. Přihlaste se prosím znovu.
          </div>
        )}

        {formError && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </div>
        )}

        <div className="mb-5 space-y-4">
          <Button
            type="button"
            variant="outline"
            fullWidth
            disabled={busy}
            className="gap-2 border border-border bg-background font-medium shadow-none hover:bg-muted"
            onClick={() => void handleGoogleSignIn()}
          >
            <GoogleGIcon className="h-5 w-5 shrink-0" />
            Přihlásit se přes Google
          </Button>

          <div className="flex items-center gap-3" role="separator" aria-label="nebo e-mailem">
            <div className="h-px min-h-0 flex-1 bg-border" />
            <span className="shrink-0 text-xs font-medium tracking-wide text-muted-foreground">nebo</span>
            <div className="h-px min-h-0 flex-1 bg-border" />
          </div>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <Input
            type="email"
            label="E-mail"
            name="email"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="off"
            autoCorrect="off"
            placeholder="vy@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            disabled={busy}
          />

          <Input
            type="password"
            label="Heslo"
            name="password"
            autoComplete="current-password"
            placeholder="Zadejte heslo"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            disabled={busy}
          />

          {resetSent ? (
            <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-400">
              Email s odkazem na reset hesla byl odeslán.
            </p>
          ) : (
            <button
              type="button"
              disabled={resetBusy}
              onClick={() => void handleResetPassword()}
              className="text-sm text-link hover:text-link-hover hover:underline disabled:opacity-50"
            >
              {resetBusy ? "Odesílám…" : "Zapomněli jste heslo?"}
            </button>
          )}

          <Button type="submit" fullWidth disabled={busy}>
            {busy ? "Přihlašování…" : "Přihlásit se"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground">
            Nemáte účet?{" "}
            <Link to="/sign-up" className="text-link hover:text-link-hover hover:underline">
              Registrace
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
