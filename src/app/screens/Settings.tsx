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
} from "lucide-react";
import { useAppSettings } from "../contexts/ThemeContext";
import { Switch } from "../components/ui/switch";
import { Modal } from "../components/Modal";
import { Button } from "../components/Button";
import {
  ThemePreference,
  LanguagePreference,
  clearAllLocalData,
} from "../data/settingsStore";
import { clearPassedIds, saveLikedIds } from "../data/swipePreferencesStore";

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

  const [languageOpen, setLanguageOpen] = useState(false);
  const [confirmClearSwipes, setConfirmClearSwipes] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

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
