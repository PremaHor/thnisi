import { ReactNode, useState } from "react";
import { useNavigate, Link } from "react-router";
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Bell,
  MessageSquare,
  Star,
  Megaphone,
  Languages,
  Vibrate,
  Sparkles,
  Trash2,
  History,
  FileText,
  Shield,
  Info,
  Check,
  KeyRound,
  CheckCircle,
} from "lucide-react";
import { useAppSettings } from "../contexts/ThemeContext";
import { Switch } from "../components/ui/switch";
import { Modal } from "../components/Modal";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import {
  ThemePreference,
  LanguagePreference,
  clearAllLocalData,
} from "../data/settingsStore";
import { clearPassedIds, saveLikedIds } from "../data/swipePreferencesStore";
import { getUserProviders, linkPasswordToCurrentUser } from "../../lib/auth";
import { mapFirebaseAuthError, MIN_PASSWORD_LENGTH } from "../lib/firebaseAuthErrors";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";

const APP_VERSION = "1.0.0";

const THEME_OPTIONS: {
  value: ThemePreference;
  label: string;
  Icon: typeof Sun;
}[] = [
  { value: "light", label: "Světlý", Icon: Sun },
  { value: "dark", label: "Tmavý", Icon: Moon },
  { value: "system", label: "Systém", Icon: Monitor },
];

const LANGUAGE_OPTIONS: { value: LanguagePreference; label: string; flag: string }[] = [
  { value: "cs", label: "Čeština", flag: "🇨🇿" },
  { value: "en", label: "English", flag: "🇬🇧" },
];

export function Settings() {
  const navigate = useNavigate();
  const { settings, setTheme, updateSettings } = useAppSettings();
  const { user } = useFirebaseAuth();

  const [languageOpen, setLanguageOpen] = useState(false);
  const [confirmClearSwipes, setConfirmClearSwipes] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  // Přidání hesla ke Google účtu
  const [addPasswordOpen, setAddPasswordOpen] = useState(false);
  const [addPwPassword, setAddPwPassword] = useState("");
  const [addPwConfirm, setAddPwConfirm] = useState("");
  const [addPwError, setAddPwError] = useState<string | null>(null);
  const [addPwErrors, setAddPwErrors] = useState<{ password?: string; confirm?: string }>({});
  const [addPwBusy, setAddPwBusy] = useState(false);
  const [addPwDone, setAddPwDone] = useState(false);

  const providers = getUserProviders();
  const isGoogleOnly = !!user && providers.includes("google.com") && !providers.includes("password");
  const hasPassword = providers.includes("password");

  const handleAddPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof addPwErrors = {};
    setAddPwError(null);
    if (!addPwPassword) errs.password = "Heslo je povinné";
    else if (addPwPassword.length < MIN_PASSWORD_LENGTH)
      errs.password = `Heslo musí mít alespoň ${MIN_PASSWORD_LENGTH} znaků.`;
    if (addPwPassword !== addPwConfirm) errs.confirm = "Hesla se neshodují";
    if (Object.keys(errs).length > 0) { setAddPwErrors(errs); return; }
    setAddPwErrors({});
    setAddPwBusy(true);
    try {
      await linkPasswordToCurrentUser(addPwPassword);
      setAddPwDone(true);
    } catch (err) {
      setAddPwError(mapFirebaseAuthError(err));
    } finally {
      setAddPwBusy(false);
    }
  };

  const selectedLanguage =
    LANGUAGE_OPTIONS.find((l) => l.value === settings.language) ?? LANGUAGE_OPTIONS[0];

  return (
    <div className="app-screen">
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 pt-safe backdrop-blur">
        <div className="app-container flex items-center gap-2 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-secondary sm:-ml-1"
            aria-label="Zpět"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h2 className="min-w-0 flex-1">Nastavení</h2>
        </div>
      </div>

      <div className="app-container space-y-8 py-6">
        {/* Appearance */}
        <Section title="Vzhled" subtitle="Přizpůsobte si, jak aplikace vypadá.">
          <div className="rounded-2xl border border-border bg-card p-1.5">
            <div
              role="radiogroup"
              aria-label="Barevný motiv"
              className="grid grid-cols-3 gap-1"
            >
              {THEME_OPTIONS.map(({ value, label, Icon }) => {
                const active = settings.theme === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setTheme(value)}
                    className={`relative flex flex-col items-center justify-center gap-1.5 rounded-xl px-2 py-3 text-sm font-medium transition-all active:scale-[0.97] ${
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 2} />
                    <span className="leading-none">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Section>

        {/* Notifications */}
        <Section
          title="Oznámení"
          subtitle="Vyberte, o čem vás chceme informovat."
        >
          <SettingList>
            <ToggleRow
              icon={<Bell className="h-5 w-5" />}
              title="Nové nabídky na směnu"
              description="Upozorníme vás, když někdo nabídne směnu."
              checked={settings.notifications.newTrades}
              onChange={(v) =>
                updateSettings({
                  notifications: { ...settings.notifications, newTrades: v },
                })
              }
            />
            <ToggleRow
              icon={<MessageSquare className="h-5 w-5" />}
              title="Zprávy"
              description="Push notifikace o nových zprávách v chatu."
              checked={settings.notifications.messages}
              onChange={(v) =>
                updateSettings({
                  notifications: { ...settings.notifications, messages: v },
                })
              }
            />
            <ToggleRow
              icon={<Star className="h-5 w-5" />}
              title="Hodnocení a recenze"
              description="Když vás někdo ohodnotí nebo napíše recenzi."
              checked={settings.notifications.ratings}
              onChange={(v) =>
                updateSettings({
                  notifications: { ...settings.notifications, ratings: v },
                })
              }
            />
            <ToggleRow
              icon={<Megaphone className="h-5 w-5" />}
              title="Novinky a tipy"
              description="Občasné e‑maily o novinkách v aplikaci."
              checked={settings.notifications.marketing}
              onChange={(v) =>
                updateSettings({
                  notifications: { ...settings.notifications, marketing: v },
                })
              }
            />
          </SettingList>
        </Section>

        {/* Preferences */}
        <Section title="Předvolby">
          <SettingList>
            <NavRow
              icon={<Languages className="h-5 w-5" />}
              title="Jazyk"
              value={`${selectedLanguage.flag} ${selectedLanguage.label}`}
              onClick={() => setLanguageOpen(true)}
            />
            <ToggleRow
              icon={<Sparkles className="h-5 w-5" />}
              title="Omezit animace"
              description="Zmírní pohyby a přechody v rozhraní."
              checked={settings.reduceMotion}
              onChange={(v) => updateSettings({ reduceMotion: v })}
            />
            <ToggleRow
              icon={<Vibrate className="h-5 w-5" />}
              title="Haptická odezva"
              description="Jemné vibrace při interakcích (pokud je zařízení podporuje)."
              checked={settings.hapticFeedback}
              onChange={(v) => updateSettings({ hapticFeedback: v })}
            />
          </SettingList>
        </Section>

        {/* Privacy & data */}
        <Section title="Soukromí a data">
          <SettingList>
            <ActionRow
              icon={<History className="h-5 w-5" />}
              title="Obnovit přehlédnuté nabídky"
              description="Znovu uvidíte nabídky, které jste odmítli."
              onClick={() => setConfirmClearSwipes(true)}
            />
            <ActionRow
              icon={<Trash2 className="h-5 w-5" />}
              title="Vymazat data aplikace"
              description="Odstraní všechna lokálně uložená nastavení a historii."
              destructive
              onClick={() => setConfirmClearAll(true)}
            />
          </SettingList>
        </Section>

        {/* Security */}
        {user && (
          <Section title="Zabezpečení účtu" subtitle="Správa způsobů přihlášení.">
            <SettingList>
              {isGoogleOnly && (
                <ActionRow
                  icon={<KeyRound className="h-5 w-5" />}
                  title="Přidat přihlášení e-mailem"
                  description="Nastav heslo a přihlásíš se i bez Google."
                  onClick={() => { setAddPwDone(false); setAddPwPassword(""); setAddPwConfirm(""); setAddPwError(null); setAddPwErrors({}); setAddPasswordOpen(true); }}
                />
              )}
              {hasPassword && (
                <div className="flex items-center gap-3 px-4 py-3 min-h-[56px]">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-icon-well text-foreground">
                    <KeyRound className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">Přihlášení e-mailem</p>
                    <p className="text-xs text-muted-foreground">Aktivní — máš nastavené heslo.</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                </div>
              )}
              {providers.includes("google.com") && (
                <div className="flex items-center gap-3 px-4 py-3 min-h-[56px]">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-icon-well text-foreground">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">Google</p>
                    <p className="text-xs text-muted-foreground">Aktivní — {user.email}</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                </div>
              )}
            </SettingList>
          </Section>
        )}

        {/* Legal & about */}
        <Section title="O aplikaci">
          <SettingList>
            <NavLinkRow
              icon={<FileText className="h-5 w-5" />}
              title="Podmínky služby"
              to="/terms"
            />
            <NavLinkRow
              icon={<Shield className="h-5 w-5" />}
              title="Ochrana osobních údajů"
              to="/privacy"
            />
            <div className="flex items-center gap-3 px-4 py-3 min-h-[56px]">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-icon-well text-foreground">
                <Info className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">Verze aplikace</p>
              </div>
              <span className="text-sm text-muted-foreground">
                {APP_VERSION}
              </span>
            </div>
          </SettingList>
        </Section>

        <p className="pt-2 text-center text-xs text-muted-foreground">
          Vyrobeno s péčí · Trhnisi © 2026
        </p>
      </div>

      {/* Language modal */}
      <Modal
        isOpen={languageOpen}
        onClose={() => setLanguageOpen(false)}
        title="Vyberte jazyk"
      >
        <div className="space-y-1">
          {LANGUAGE_OPTIONS.map((opt) => {
            const active = settings.language === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  updateSettings({ language: opt.value });
                  setLanguageOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 min-h-[56px] text-left transition-colors ${
                  active ? "bg-secondary" : "hover:bg-secondary"
                }`}
              >
                <span className="text-2xl leading-none">{opt.flag}</span>
                <span className="flex-1 font-medium">{opt.label}</span>
                {active && <Check className="h-5 w-5 text-primary" />}
              </button>
            );
          })}
          <p className="px-4 pt-2 text-xs text-muted-foreground">
            Změna jazyka se plně projeví v některých částech aplikace po
            opětovném načtení.
          </p>
        </div>
      </Modal>

      {/* Confirm clear swipes */}
      <Modal
        isOpen={confirmClearSwipes}
        onClose={() => setConfirmClearSwipes(false)}
        title="Obnovit přehlédnuté?"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Všechny nabídky, které jste odmítli swipem doleva, se znovu objeví
            v balíčku. Oblíbené zůstanou nedotčené.
          </p>
          <div className="flex flex-col gap-2 min-[400px]:flex-row-reverse">
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                clearPassedIds();
                setConfirmClearSwipes(false);
              }}
            >
              Obnovit
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => setConfirmClearSwipes(false)}
            >
              Zrušit
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add password modal */}
      <Modal
        isOpen={addPasswordOpen}
        onClose={() => setAddPasswordOpen(false)}
        title="Přidat přihlášení e-mailem"
      >
        {addPwDone ? (
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <CheckCircle className="h-12 w-12 text-primary" />
            <p className="font-medium">Heslo přidáno!</p>
            <p className="text-sm text-muted-foreground">
              Teď se můžeš přihlásit e-mailem i přes Google — vždy do stejného účtu.
            </p>
            <Button fullWidth onClick={() => setAddPasswordOpen(false)}>
              Hotovo
            </Button>
          </div>
        ) : (
          <form onSubmit={(e) => void handleAddPassword(e)} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Nastav heslo ke svému účtu ({user?.email}). Po přidání se budeš moci přihlásit e-mailem i Googlem.
            </p>
            {addPwError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {addPwError}
              </div>
            )}
            <Input
              type="password"
              label="Nové heslo"
              placeholder="Zvolte heslo"
              value={addPwPassword}
              onChange={(e) => setAddPwPassword(e.target.value)}
              error={addPwErrors.password}
              disabled={addPwBusy}
              autoComplete="new-password"
            />
            <Input
              type="password"
              label="Potvrzení hesla"
              placeholder="Potvrďte heslo"
              value={addPwConfirm}
              onChange={(e) => setAddPwConfirm(e.target.value)}
              error={addPwErrors.confirm}
              disabled={addPwBusy}
              autoComplete="new-password"
            />
            <div className="flex gap-2">
              <Button variant="outline" fullWidth type="button" onClick={() => setAddPasswordOpen(false)}>
                Zrušit
              </Button>
              <Button fullWidth type="submit" disabled={addPwBusy}>
                {addPwBusy ? "Ukládám…" : "Přidat heslo"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Confirm clear all */}
      <Modal
        isOpen={confirmClearAll}
        onClose={() => setConfirmClearAll(false)}
        title="Vymazat všechna data?"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Smažeme vaše lokální nastavení, oblíbené, historii swipů a další
            předvolby uložené v tomto zařízení. Účet ani data na serveru se
            nesmažou.
          </p>
          <div className="flex flex-col gap-2 min-[400px]:flex-row-reverse">
            <Button
              variant="destructive"
              fullWidth
              onClick={() => {
                clearAllLocalData();
                saveLikedIds([]);
                clearPassedIds();
                setConfirmClearAll(false);
                navigate("/profile");
              }}
            >
              Vymazat
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => setConfirmClearAll(false)}
            >
              Zrušit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ------------------------- Helper presentational ------------------------- */

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="px-1">
        <h3 className="mb-0.5">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function SettingList({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card divide-y divide-border">
      {children}
    </div>
  );
}

function IconBadge({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-icon-well text-foreground">
      {children}
    </span>
  );
}

function ToggleRow({
  icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 px-4 py-3 min-h-[60px] transition-colors hover:bg-secondary/60">
      <IconBadge>{icon}</IconBadge>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

function NavRow({
  icon,
  title,
  value,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  value?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3 min-h-[60px] text-left transition-colors hover:bg-secondary/60"
    >
      <IconBadge>{icon}</IconBadge>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
      </div>
      {value && (
        <span className="shrink-0 text-sm text-muted-foreground">{value}</span>
      )}
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
    </button>
  );
}

function NavLinkRow({
  icon,
  title,
  to,
}: {
  icon: ReactNode;
  title: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-3 min-h-[60px] transition-colors hover:bg-secondary/60"
    >
      <IconBadge>{icon}</IconBadge>
      <span className="min-w-0 flex-1 font-medium">{title}</span>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
    </Link>
  );
}

function ActionRow({
  icon,
  title,
  description,
  onClick,
  destructive,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3 min-h-[60px] text-left transition-colors hover:bg-secondary/60 ${
        destructive ? "text-destructive" : ""
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          destructive
            ? "bg-destructive/10 text-destructive"
            : "bg-icon-well text-foreground"
        }`}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
        {description && (
          <p
            className={`text-xs ${
              destructive ? "text-destructive/80" : "text-muted-foreground"
            }`}
          >
            {description}
          </p>
        )}
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 opacity-60" />
    </button>
  );
}
