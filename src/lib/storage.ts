import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase";

const MAX_OFFER_FILE_BYTES = 8 * 1024 * 1024;
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

function safeFileName(name: string): string {
  return name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

export async function uploadOfferFile(userId: string, file: File): Promise<string> {
  const isAllowedType = file.type.startsWith("image/") || file.type === "application/pdf";
  if (!isAllowedType) {
    throw new Error("Offer soubor musí být image/* nebo application/pdf.");
  }
  if (file.size > MAX_OFFER_FILE_BYTES) {
    throw new Error("Offer soubor může mít maximálně 8 MB.");
  }
  const path = `uploads/${userId}/offers/${Date.now()}-${safeFileName(file.name)}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file, { contentType: file.type || "application/octet-stream" });
  return getDownloadURL(fileRef);
}

export async function uploadProfileAvatar(userId: string, file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Profilový avatar musí být image/*.");
  }
  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error("Profilový avatar může mít maximálně 5 MB.");
  }
  const path = `uploads/${userId}/profile/${Date.now()}-${safeFileName(file.name)}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file, { contentType: file.type });
  return getDownloadURL(fileRef);
}
