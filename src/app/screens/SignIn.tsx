import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { AppLogo } from "../components/AppLogo";
import { Input } from "../components/Input";
import { Button } from "../components/Button";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleGoogleSignIn = () => {
    navigate("/");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!email) newErrors.email = "E-mail je povinný";
    if (!password) newErrors.password = "Heslo je povinné";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    navigate("/");
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-transparent px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-center">
          <AppLogo to="/" size="lg" />
        </div>
      </div>
      <div className="w-full max-w-sm rounded-3xl border-2 border-border/50 bg-card/90 p-5 shadow-2xl backdrop-blur-sm sm:p-8">
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="mb-2">Vítej zpátky</h1>
          <p className="text-muted-foreground">Hned jsi uvnitř a můžeš zase něco směnit.</p>
        </div>

        <div className="mb-5 space-y-4">
          <Button
            type="button"
            variant="outline"
            fullWidth
            className="gap-2 border-2 border-border/90 bg-card font-semibold shadow-sm hover:bg-secondary/80"
            onClick={handleGoogleSignIn}
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

        <form onSubmit={handleSubmit} className="space-y-4">
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
          />

          <button
            type="button"
            className="text-sm text-link hover:text-link-hover hover:underline"
          >
            Zapomněli jste heslo?
          </button>

          <Button type="submit" fullWidth>
            Přihlásit se
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
