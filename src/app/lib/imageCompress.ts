/** Zmenší obrázek a uloží jako JPEG pro menší objem dat / upload. */
export async function compressImageToJpegBlob(
  file: File,
  maxEdge = 1600,
  quality = 0.82
): Promise<Blob> {
  const img = await createImageBitmap(file);
  try {
    const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas není k dispozici");
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", quality)
    );
    if (!blob) throw new Error("Komprese obrázku selhala");
    return blob;
  } finally {
    img.close();
  }
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error ?? new Error("Čtení souboru selhalo"));
    r.readAsDataURL(blob);
  });
}
