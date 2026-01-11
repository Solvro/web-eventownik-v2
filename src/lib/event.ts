/**
 * Converts an image data URL to a File object
 * that can be appended to FormData for upload.
 *
 * @param dataUrl - The data URL of the image (e.g., "data:image/png;base64,...")
 * @returns File object ready for FormData
 * @throws Error if the URL is not an image data URL or if the conversion fails
 */
export function generateFileFromDataUrl(dataUrl: string): File {
  // Strictly validate that the URL is an image data URL
  if (!dataUrl.startsWith("data:image/")) {
    throw new Error("Invalid URL: Only image data URLs are accepted");
  }

  const base64Index = dataUrl.indexOf(";base64,");
  if (base64Index === -1) {
    throw new Error("Invalid URL: Image data URL must be base64-encoded");
  }

  // Extract and validate MIME type (strip leading "data:")
  const header = dataUrl.slice(5, base64Index);
  const [mimeType] = header.split(";");
  if (mimeType === "" || !mimeType.startsWith("image/")) {
    throw new Error("Invalid URL: Only image data URLs are accepted");
  }

  // Extract and validate base64 payload
  const base64Data = dataUrl.slice(base64Index + ";base64,".length);
  if (!base64Data) {
    throw new Error("Invalid URL: Image data payload is empty");
  }

  // Decode base64 into a byte array using Node's Buffer (server-side only)
  const bytes = Buffer.from(base64Data, "base64");

  const blob = new Blob([bytes], { type: mimeType });
  const extension = mimeType.split("/")[1] || "jpg";
  const filename = `event-${Date.now().toString()}.${extension}`;

  return new File([blob], filename, { type: mimeType });
}
