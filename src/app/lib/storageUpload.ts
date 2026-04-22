import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getFirebaseApp, getFirebaseStorage, isFirebaseConfigured } from "./firebase";

function extFromFile(file: File): string {
  const n = file.name.toLowerCase();
  if (n.endsWith(".png")) return "png";
  if (n.endsWith(".webp")) return "webp";
  if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "jpg";
  if (n.endsWith(".pdf")) return "pdf";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "application/pdf") return "pdf";
  return "bin";
}

/**
 * Nahraje soubor do Firebase Storage pod cestu uploads/{uid}/...
 * Vyžaduje nakonfigurované Firebase a přihlášeného uživatele (včetně anonymního).
 */
export async function uploadUserAsset(params: {
  userId: string;
  /** např. offers/1 nebo offers/draft */
  scope: string;
  file: File | Blob;
  /** např. image/jpeg */
  contentType: string;
}): Promise<string> {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase není nakonfigurován");
  }
  getFirebaseApp();
  const storage = getFirebaseStorage();
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const ext =
    params.file instanceof File
      ? extFromFile(params.file)
      : params.contentType === "application/pdf"
        ? "pdf"
        : "jpg";
  const path = `uploads/${params.userId}/${params.scope}/${id}.${ext}`;
  const r = ref(storage, path);
  await uploadBytes(r, params.file, { contentType: params.contentType });
  return getDownloadURL(r);
}

export function canUseFirebaseUpload(): boolean {
  return isFirebaseConfigured();
}
