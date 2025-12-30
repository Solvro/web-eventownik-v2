/**
 * Converts an image data URL to a File object
 * that can be appended to FormData for upload.
 *
 * @param dataUrl - The data URL of the image (e.g., "data:image/png;base64,...")
 * @returns File object ready for FormData
 * @throws Error if the URL is not an image data URL or if the conversion fails
 */
export async function generateFileFromDataUrl(dataUrl: string): Promise<File> {
  // Validate that the URL is an image data URL
  if (!dataUrl.startsWith("data:image")) {
    throw new Error("Invalid URL: Only image data URLs are accepted");
  }

  const response = await fetch(dataUrl);
  if (!response.ok) {
    throw new Error(
      `Photo fetch failed with status: ${response.status.toString()}`,
    );
  }

  const blob = await response.blob();
  const extension = blob.type.split("/")[1] || "jpg";
  const filename = `event-${Date.now().toString()}.${extension}`;

  return new File([blob], filename, { type: blob.type });
}
