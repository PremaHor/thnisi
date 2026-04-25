import { useState, useLayoutEffect, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronLeft, Upload, X, Paperclip, FileText, Loader2 } from "lucide-react";
import { clearUserOfferForm, loadUserOfferForm, saveUserOfferForm } from "../data/userOfferForms";
import type { OfferAttachment } from "../data/barterOffers";
import { Input } from "../components/Input";
import { Textarea } from "../components/Textarea";
import { Button } from "../components/Button";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { blobToDataUrl, compressImageToJpegBlob } from "../lib/imageCompress";
import { canUseFirebaseUpload, uploadUserAsset } from "../lib/storageUpload";
import { createOffer, getOfferById, updateOffer } from "../../lib/offers";
import { getUserProfile } from "../../lib/profile";

const CATEGORIES = ["Jídlo", "Služby", "Elektronika", "Ostatní"];
const MAX_IMAGES = 5;
const MAX_ATTACHMENTS = 4;
const MAX_PDF_BYTES = 7 * 1024 * 1024;

export function CreateOffer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const attachInputRef = useRef<HTMLInputElement>(null);
  const { user, loading: authLoading } = useFirebaseAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [wantsInReturn, setWantsInReturn] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<OfferAttachment[]>([]);
  const [uploadBusy, setUploadBusy] = useState<"photo" | "attach" | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitBusy, setSubmitBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const storageFolder = id ?? "draft";

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
    setAttachments([...(data.attachments ?? [])]);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const draft = loadUserOfferForm(id);
    if (draft) return;
    void (async () => {
      try {
        const remote = await getOfferById(id);
        if (!remote) return;
        setTitle(remote.title);
        setDescription(remote.description);
        setWantsInReturn(remote.wantsInReturn);
        setCategory(remote.category);
        setTags(remote.tags.join(", "));
        setLocation(remote.location);
        setImages([...remote.images]);
        setAttachments([...(remote.attachments ?? [])]);
      } catch (e) {
        console.error("Offer load error:", e);
      }
    })();
  }, [id]);

  useEffect(() => {
    const draftId = id ?? "draft";
    saveUserOfferForm(draftId, {
      title,
      description,
      wantsInReturn,
      category,
      tags,
      location,
      images,
      attachments,
    });
  }, [id, title, description, wantsInReturn, category, tags, location, images, attachments]);

  async function addImageFromFile(file: File) {
    setUploadError(null);
    if (!file.type.startsWith("image/")) {
      setUploadError("Vyberte obrázek (JPG, PNG…).");
      return;
    }
    setUploadBusy("photo");
    try {
      const blob = await compressImageToJpegBlob(file);
      let url: string;
      if (canUseFirebaseUpload() && user?.uid) {
        url = await uploadUserAsset({
          userId: user.uid,
          scope: `offers/${storageFolder}`,
          file: blob,
          contentType: "image/jpeg",
        });
      } else {
        url = await blobToDataUrl(blob);
      }
      setImages((prev) => (prev.length < MAX_IMAGES ? [...prev, url] : prev));
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Nahrání fotky se nezdařilo.");
    } finally {
      setUploadBusy(null);
    }
  }

  async function addAttachmentFromFile(file: File) {
    setUploadError(null);
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isImage = file.type.startsWith("image/");
    if (!isPdf && !isImage) {
      setUploadError("Podporujeme PDF nebo obrázek.");
      return;
    }
    if (isPdf && file.size > MAX_PDF_BYTES) {
      setUploadError("PDF může mít nejvýše cca 7 MB.");
      return;
    }
    if (isPdf && (!canUseFirebaseUpload() || !user?.uid)) {
      setUploadError("PDF lze nahrát jen s nakonfigurovaným Firebase a přihlášením.");
      return;
    }
    setUploadBusy("attach");
    try {
      let url: string;
      if (isPdf && user?.uid) {
        url = await uploadUserAsset({
          userId: user.uid,
          scope: `offers/${storageFolder}/attachments`,
          file,
          contentType: file.type || "application/pdf",
        });
      } else if (isImage) {
        const blob = await compressImageToJpegBlob(file);
        if (canUseFirebaseUpload() && user?.uid) {
          url = await uploadUserAsset({
            userId: user.uid,
            scope: `offers/${storageFolder}/attachments`,
            file: blob,
            contentType: "image/jpeg",
          });
        } else {
          url = await blobToDataUrl(blob);
        }
      } else {
        return;
      }
      const name = file.name.trim() || (isPdf ? "dokument.pdf" : "soubor.jpg");
      setAttachments((prev) =>
        prev.length < MAX_ATTACHMENTS ? [...prev, { name, url }] : prev
      );
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Nahrání přílohy se nezdařilo.");
    } finally {
      setUploadBusy(null);
    }
  }

  const onPickPhotos: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    const remaining = MAX_IMAGES - images.length;
    const list = Array.from(files).slice(0, Math.max(0, remaining));
    for (const f of list) {
      await addImageFromFile(f);
    }
    e.target.value = "";
  };

  const onPickAttachments: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    const remaining = MAX_ATTACHMENTS - attachments.length;
    const list = Array.from(files).slice(0, Math.max(0, remaining));
    for (const f of list) {
      await addAttachmentFromFile(f);
    }
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!user?.uid) {
      setSubmitError("Pro publikování nabídky se nejdřív přihlaste.");
      return;
    }
    setSubmitBusy(true);
    try {
      const sellerProfile = await getUserProfile(user.uid);
      const sellerName =
        sellerProfile?.name?.trim() ||
        user.displayName?.trim() ||
        user.email?.split("@")[0]?.trim() ||
        "";
      const payload = {
        title: title.trim(),
        description: description.trim(),
        wantsInReturn: wantsInReturn.trim(),
        category: category.trim(),
        location: location.trim(),
        isRemote: false,
        image: images[0] ?? "",
        images,
        attachments,
        tags: tags
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        sellerId: user.uid,
        sellerName,
        sellerAvatar: sellerProfile?.avatarUrl || user.photoURL || "",
      };

      if (id) {
        await updateOffer(id, payload);
        clearUserOfferForm(id);
      } else {
        const newId = await createOffer(payload);
        clearUserOfferForm("draft");
        if (newId) {
          navigate("/my-offers");
          return;
        }
      }
      navigate("/my-offers");
    } catch (err) {
      console.error("Offer save error:", err);
      setSubmitError("Uložení nabídky se nezdařilo.");
    } finally {
      setSubmitBusy(false);
    }
  };

  const busy = uploadBusy !== null || authLoading || submitBusy;

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

      <form onSubmit={(e) => void handleSubmit(e)} className="app-container space-y-6 py-6">
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onPickPhotos}
        />
        <input
          ref={attachInputRef}
          type="file"
          accept="image/*,.pdf,application/pdf"
          multiple
          className="hidden"
          onChange={onPickAttachments}
        />

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
            {images.length < MAX_IMAGES && (
              <button
                type="button"
                disabled={busy}
                onClick={() => photoInputRef.current?.click()}
                className="aspect-square bg-input-background border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-secondary transition-colors disabled:opacity-50"
              >
                {uploadBusy === "photo" ? (
                  <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                ) : (
                  <Upload className="w-6 h-6 text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground">Nahrát</span>
              </button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Maximálně {MAX_IMAGES} fotek
            {!canUseFirebaseUpload() && " — bez Firebase se ukládají jen zmenšené náhledy v prohlížeči."}
          </p>
        </div>

        <div>
          <label className="mb-2 block">Přílohy</label>
          <p className="text-sm text-muted-foreground mb-2">
            PDF nebo další obrázek (např. leták). PDF vyžaduje Firebase Storage.
          </p>
          <div className="space-y-2">
            {attachments.map((a, idx) => (
              <div
                key={`${a.url}-${idx}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"
              >
                <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-sm">{a.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                  className="shrink-0 rounded p-1 hover:bg-secondary"
                  aria-label="Odstranit přílohu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {attachments.length < MAX_ATTACHMENTS && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => attachInputRef.current?.click()}
                className="w-full sm:w-auto"
              >
                {uploadBusy === "attach" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Paperclip className="mr-2 h-4 w-4" />
                )}
                Přidat přílohu
              </Button>
            )}
          </div>
        </div>

        {uploadError && (
          <p className="text-sm text-destructive" role="alert">
            {uploadError}
          </p>
        )}
        {submitError && (
          <p className="text-sm text-destructive" role="alert">
            {submitError}
          </p>
        )}

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
