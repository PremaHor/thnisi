import { uploadOfferFile, uploadProfileAvatar } from "../../lib/storage";
import { isFirebaseConfigured } from "./firebase";

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
  if (params.scope.startsWith("profile")) {
    const file =
      params.file instanceof File
        ? params.file
        : new File([params.file], `avatar.${extFromFile(new File([params.file], "avatar", { type: params.contentType }))}`, {
            type: params.contentType,
          });
    return uploadProfileAvatar(params.userId, file);
  }
  const file =
    params.file instanceof File
      ? params.file
      : new File([params.file], `offer.${params.contentType === "application/pdf" ? "pdf" : "jpg"}`, {
          type: params.contentType,
        });
  return uploadOfferFile(params.userId, file);
}

export function canUseFirebaseUpload(): boolean {
  return isFirebaseConfigured();
}
