import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Edit2, Settings, LogOut, FileText, Shield } from "lucide-react";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { useFirebase } from "../contexts/FirebaseContext";
import { logout } from "../../lib/auth";
import { getUserProfile } from "../../lib/profile";
import { getOffersBySellerId } from "../../lib/offers";
import { getRatingSummaryForUser, type RatingSummary } from "../../lib/ratings";

export function Profile() {
  const navigate = useNavigate();
  const { user: authUser } = useFirebase();
  const [ownRating, setOwnRating] = useState<RatingSummary | null>(null);
  const [profile, setProfile] = useState({
    name: "",
    email: authUser?.email ?? "",
    bio: "",
    location: "",
    avatarUrl: "",
    completedTrades: 0,
  });
  const [activeOffers, setActiveOffers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authUser?.uid) {
      setLoading(false);
      return;
    }
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const [userProfile, sellerOffers, ratingSummary] = await Promise.all([
          getUserProfile(authUser.uid),
          getOffersBySellerId(authUser.uid),
          getRatingSummaryForUser(authUser.uid),
        ]);
        setOwnRating(ratingSummary);
        if (userProfile) {
          setProfile({
            name: userProfile.name,
            email: userProfile.email || authUser.email || "",
            bio: userProfile.bio,
            location: userProfile.location,
            avatarUrl: userProfile.avatarUrl,
            completedTrades: userProfile.completedTrades,
          });
        } else {
          setProfile((prev) => ({ ...prev, email: authUser.email || prev.email }));
        }
        setActiveOffers(sellerOffers.filter((offer) => offer.status === "active").length);
      } catch (e) {
        console.error("Profile load error:", e);
        setError("Profil se nepodařilo načíst.");
      } finally {
        setLoading(false);
      }
    })();
  }, [authUser]);

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
          <Avatar size="xl" className="mb-4" src={profile.avatarUrl || undefined} />
          <h2 className="mb-1">{profile.name || "Uživatel"}</h2>
          <p className="text-muted-foreground mb-1">{profile.email}</p>
          {profile.location ? (
            <p className="text-sm text-muted-foreground mb-1">{profile.location}</p>
          ) : null}
          {profile.bio && (
            <p className="text-sm text-muted-foreground mb-3">{profile.bio}</p>
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
            <div className="mb-1">{profile.completedTrades ?? 0}</div>
            <p className="text-xs text-muted-foreground">Dokončené směny</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 text-center sm:p-4">
            <div className="mb-1">{activeOffers}</div>
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
            type="button"
            onClick={() => {
              void (async () => {
                await logout();
                navigate("/sign-in");
              })();
            }}
            className="flex min-h-[56px] w-full items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-destructive transition-colors hover:bg-secondary"
          >
            <LogOut className="h-5 w-5" />
            <span className="flex-1 text-left">Odhlásit se</span>
          </button>
        </div>

        {loading && <p className="text-center text-xs text-muted-foreground">Načítání profilu…</p>}
        {error && <p className="text-center text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}
