import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, Camera, Loader2 } from "lucide-react";
import { Input } from "../components/Input";
import { Textarea } from "../components/Textarea";
import { Button } from "../components/Button";
import { Avatar } from "../components/Avatar";
import { loadUserProfile, saveUserProfile } from "../data/userProfileStore";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { blobToDataUrl, compressImageToJpegBlob } from "../lib/imageCompress";
import { canUseFirebaseUpload, uploadUserAsset } from "../lib/storageUpload";

export function EditProfile() {
  const navigate = useNavigate();
  const initial = loadUserProfile();
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [bio, setBio] = useState(initial.bio);
  const [location, setLocation] = useState(initial.location);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { user, loading: authLoading } = useFirebaseAuth();

  const handleAvatarChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) {
      setAvatarError("Vyberte obrázek.");
      return;
    }
    setAvatarError(null);
    setAvatarBusy(true);
    try {
      const blob = await compressImageToJpegBlob(file, 800, 0.86);
      if (canUseFirebaseUpload() && user?.uid) {
        const url = await uploadUserAsset({
          userId: user.uid,
          scope: "profile",
          file: blob,
          contentType: "image/jpeg",
        });
        setAvatarUrl(url);
      } else {
        setAvatarUrl(await blobToDataUrl(blob));
      }
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Nahrání fotky selhalo.");
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveUserProfile({ name, email, bio, location, avatarUrl });
    navigate("/profile");
  };

  return (
    <div className="app-screen">
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 pt-safe backdrop-blur">
        <div className="app-container flex items-center gap-2 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-secondary transition-colors sm:-ml-1"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h2 className="min-w-0 flex-1">Upravit profil</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="app-container space-y-6 py-6">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />

        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <Avatar size="xl" src={avatarUrl || undefined} />
            <button
              type="button"
              disabled={avatarBusy || authLoading}
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-opacity disabled:opacity-50"
              aria-label="Změnit fotku profilu"
            >
              {avatarBusy ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Camera className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Klepněte pro změnu fotky
            {!canUseFirebaseUpload() && " (bez Firebase se uloží jen v tomto prohlížeči)"}
          </p>
          {avatarError && (
            <p className="mt-2 text-sm text-destructive" role="alert">
              {avatarError}
            </p>
          )}
        </div>

        <Input
          label="Jméno"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          type="email"
          label="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Textarea
          label="O mně"
          placeholder="Napište něco o sobě…"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <Input
          label="Lokalita"
          placeholder="Město nebo oblast"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <div className="flex flex-col gap-3 pt-4 min-[400px]:flex-row">
          <Button type="button" variant="outline" fullWidth onClick={() => navigate(-1)}>
            Zrušit
          </Button>
          <Button type="submit" fullWidth>
            Uložit změny
          </Button>
        </div>
      </form>
    </div>
  );
}
