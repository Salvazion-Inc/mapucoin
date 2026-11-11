/** Shrinks a photo in the browser so three or four fit in one request. */

export async function preparePartnerPhoto(file: File, maxBytes: number) {
  if (
    file.size > 0 &&
    file.size <= maxBytes &&
    /image\/(jpeg|png|webp)/.test(file.type)
  ) {
    return file;
  }
  if (typeof document === "undefined") return file;

  const bitmap = await loadBitmap(file);
  if (!bitmap) return file;

  let edge = 1600;
  let quality = 0.82;
  let latest: File | null = null;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return latest || file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((next) => resolve(next), "image/jpeg", quality);
    });
    if (!blob) return latest || file;
    latest = new File([blob], "foto.jpg", { type: "image/jpeg" });
    if (latest.size <= maxBytes) return latest;
    edge = Math.round(edge * 0.75);
    quality = Math.max(0.5, quality - 0.12);
  }
  return latest || file;
}

async function loadBitmap(file: File) {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      /* fall through */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("image"));
      el.src = url;
    });
    return image;
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}
