const MAX_SIDE = 1600;
const QUALITY = 0.8;

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // fall through to <img> decoding
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Downscales a photo to at most 1600 px on its longest side and re-encodes it
 * as JPEG (quality 0.8). Returns the original file when it cannot be decoded.
 */
export async function downscaleImage(file: File): Promise<Blob> {
  try {
    const source = await decode(file);
    const width = source.width;
    const height = source.height;
    if (width === 0 || height === 0) {
      return file;
    }
    const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const context = canvas.getContext("2d");
    if (context === null) {
      return file;
    }
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
    if ("close" in source) {
      source.close();
    }
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", QUALITY);
    });
    return blob ?? file;
  } catch {
    return file;
  }
}
