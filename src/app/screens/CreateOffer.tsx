import { useState, useLayoutEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronLeft, Upload, X } from "lucide-react";
import { loadUserOfferForm, saveUserOfferForm } from "../data/userOfferForms";
import { Input } from "../components/Input";
import { Textarea } from "../components/Textarea";
import { Button } from "../components/Button";

const CATEGORIES = ["Jídlo", "Služby", "Elektronika", "Ostatní"];

export function CreateOffer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [wantsInReturn, setWantsInReturn] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<string[]>([]);

  useLayoutEffect(() => {
    if (!id) return;
    const data = loadUserOfferForm(id);
    if (!data) return;
    setTitle(data.title);
    setDescription(data.description);
    setWantsInReturn(data.wantsInReturn);
    setCategory(data.category);
    setTags(data.tags);
    setLocation(data.location);
    setImages([...data.images]);
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      saveUserOfferForm(id, {
        title,
        description,
        wantsInReturn,
        category,
        tags,
        location,
        images,
      });
    }
    navigate("/my-offers");
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
          <h2 className="min-w-0 flex-1">
            {isEditing ? "Upravit nabídku" : "Nová nabídka"}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="app-container space-y-6 py-6">
        <div>
          <label className="mb-2 block">Fotky</label>
          <div className="mb-2 grid grid-cols-2 gap-2 min-[400px]:grid-cols-3 sm:gap-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <button
                type="button"
                className="aspect-square bg-input-background border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-secondary transition-colors"
              >
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Nahrát</span>
              </button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">Maximálně 5 fotek</p>
        </div>

        <Input
          label="Název"
          placeholder="Co nabízíte?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Textarea
          label="Popis"
          placeholder="Podrobně popište nabídku…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <Textarea
          label="Hledám na oplátku"
          placeholder="Např. domácí zavařeniny, pár hodin pomoci na zahradě, drobnou službu… (orientačně, můžete vždy dál domluvit v chatu.)"
          value={wantsInReturn}
          onChange={(e) => setWantsInReturn(e.target.value)}
        />
        <p className="text-sm text-muted-foreground -mt-2">
          Zobrazí se u vaší nabídky, aby ostatní hned věděli, co vám můžou výměnou nabídnout.
        </p>

        <div>
          <label className="block mb-2">Kategorie</label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`min-h-[44px] px-4 py-2.5 rounded-lg transition-colors ${
                  category === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-input-background border border-border hover:bg-secondary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Štítky"
          placeholder="např. bio, ruční práce (oddělené čárkou)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        <Input
          label="Lokalita"
          placeholder="Město nebo oblast"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />

        <div className="flex flex-col gap-3 pt-4 min-[400px]:flex-row">
          <Button type="button" variant="outline" fullWidth onClick={() => navigate(-1)}>
            Zrušit
          </Button>
          <Button type="submit" fullWidth>
            {isEditing ? "Uložit změny" : "Zveřejnit nabídku"}
          </Button>
        </div>
      </form>
    </div>
  );
}
