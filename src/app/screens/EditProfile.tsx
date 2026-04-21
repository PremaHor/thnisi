import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, Camera } from "lucide-react";
import { Input } from "../components/Input";
import { Textarea } from "../components/Textarea";
import { Button } from "../components/Button";
import { Avatar } from "../components/Avatar";

export function EditProfile() {
  const navigate = useNavigate();
  const [name, setName] = useState("Jan Novák");
  const [email, setEmail] = useState("jan.novak@example.com");
  const [bio, setBio] = useState("Zahradničení a směna domácích dobrot");
  const [location, setLocation] = useState("Praha, Česká republika");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <Avatar size="xl" />
            <button
              type="button"
              className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Klepněte pro změnu fotky
          </p>
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
