import { Link, useNavigate } from "react-router";
import { Edit2, Settings, LogOut, FileText, Shield } from "lucide-react";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { CURRENT_RATER_ID, getUserRatingSummary } from "../data/ratingsStore";
import { loadUserProfile } from "../data/userProfileStore";

const MOCK_STATS = {
  completedTrades: 12,
  activeOffers: 3,
  memberSince: "leden 2026",
};

export function Profile() {
  const navigate = useNavigate();
  const ownRating = getUserRatingSummary(CURRENT_RATER_ID);
  const user = loadUserProfile();

  return (
    <div className="app-screen">
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 py-4 pt-safe backdrop-blur">
        <div className="app-container">
          <h1>Profil</h1>
        </div>
      </div>

      <div className="app-container space-y-6 py-6">
        {/* User info */}
        <div className="flex flex-col items-center text-center">
          <Avatar size="xl" className="mb-4" src={user.avatarUrl || undefined} />
          <h2 className="mb-1">{user.name}</h2>
          <p className="text-muted-foreground mb-1">{user.email}</p>
          {user.location ? (
            <p className="text-sm text-muted-foreground mb-1">{user.location}</p>
          ) : null}
          {user.bio && (
            <p className="text-sm text-muted-foreground mb-3">{user.bio}</p>
          )}
          <Link to="/profile/edit">
            <Button variant="outline" size="sm">
              <Edit2 className="w-4 h-4 mr-2" />
              Upravit profil
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid min-w-0 grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-card border border-border rounded-lg p-3 text-center sm:p-4">
            <div className="mb-1">{MOCK_STATS.completedTrades}</div>
            <p className="text-xs text-muted-foreground">Dokončené směny</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 text-center sm:p-4">
            <div className="mb-1">{MOCK_STATS.activeOffers}</div>
            <p className="text-xs text-muted-foreground">Aktivní nabídky</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 text-center sm:p-4">
            <div className="mb-1 text-lg font-bold sm:text-xl">
              {ownRating ? ownRating.label : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              {ownRating
                ? `Hodnocení (${ownRating.count}×)`
                : "Zatím bez hodnocení"}
            </p>
          </div>
        </div>

        {/* Settings menu */}
        <div className="space-y-2">
          <h3 className="mb-3">Nastavení</h3>

          <Link
            to="/terms"
            className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-lg hover:bg-secondary transition-colors min-h-[56px]"
          >
            <FileText className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1">Podmínky služby</span>
          </Link>

          <Link
            to="/privacy"
            className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-lg hover:bg-secondary transition-colors min-h-[56px]"
          >
            <Shield className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1">Ochrana osobních údajů</span>
          </Link>

          <Link
            to="/settings"
            className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-lg hover:bg-secondary transition-colors min-h-[56px]"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1">Nastavení aplikace</span>
          </Link>

          <button
            onClick={() => navigate("/sign-in")}
            className="w-full flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-lg hover:bg-secondary transition-colors text-destructive min-h-[56px]"
          >
            <LogOut className="w-5 h-5" />
            <span className="flex-1 text-left">Odhlásit se</span>
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Členem od {MOCK_STATS.memberSince}
        </p>
      </div>
    </div>
  );
}
