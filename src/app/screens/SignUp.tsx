import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { AppLogo } from "../components/AppLogo";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { mapFirebaseAuthError, MIN_PASSWORD_LENGTH } from "../lib/firebaseAuthErrors";
import { registerWithEmail } from "../../lib/auth";

export function SignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    setFormError(null);

    if (!name.trim()) newErrors.name = "Jméno je povinné";
    if (!email.trim()) newErrors.email = "E-mail je povinný";
    if (!password) newErrors.password = "Heslo je povinné";
    else if (password.length < MIN_PASSWORD_LENGTH) {
      newErrors.password = `Heslo musí mít alespoň ${MIN_PASSWORD_LENGTH} znaků.`;
    }
    if (password !== confirmPassword) newErrors.confirmPassword = "Hesla se neshodují";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      await registerWithEmail(email.trim(), password);
      navigate("/");
    } catch (err) {
      console.error("Email registration error:", err);
      setFormError(mapFirebaseAuthError(err));
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
          <p className="mb-1 text-xs font-medium text-muted-foreground">Přidat se</p>
          <h1 className="mb-2">Vytvořit účet</h1>
          <p className="text-muted-foreground">Registrace přes Firebase (e-mail a heslo).</p>
        </div>

        {formError && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <Input
            type="text"
            label="Jméno"
            placeholder="Vaše jméno"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            disabled={busy}
            autoComplete="name"
          />

          <Input
            type="email"
            label="E-mail"
            placeholder="vy@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            disabled={busy}
            autoComplete="email"
          />

          <Input
            type="password"
            label="Heslo"
            placeholder="Zvolte heslo"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            disabled={busy}
            autoComplete="new-password"
          />

          <Input
            type="password"
            label="Potvrzení hesla"
            placeholder="Potvrďte heslo"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            disabled={busy}
            autoComplete="new-password"
          />

          <Button type="submit" fullWidth disabled={busy}>
            {busy ? "Registrace…" : "Registrovat se"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground">
            Už máte účet?{" "}
            <Link to="/sign-in" className="text-link hover:text-link-hover hover:underline">
              Přihlásit se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
