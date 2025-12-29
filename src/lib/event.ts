/**
 * Processes a photo URL and converts it to a File object
 * that can be appended to FormData for upload.
 *
 * @param photoUrl - The URL of the photo
 * @returns File object ready for FormData
 * @throws Error if the photo fetch fails
 */
export async function generateFileFromPhotoUrl(
  photoUrl: string,
): Promise<File> {
  const response = await fetch(photoUrl);
  if (!response.ok) {
    throw new Error(
      `Photo fetch failed with status: ${response.status.toString()}`,
    );
  }

  const blob = await response.blob();
  const filename =
    photoUrl.split("/").pop() ??
    `event-${Date.now().toString()}.${blob.type.split("/")[1] || "jpg"}`;

  return new File([blob], filename, { type: blob.type });
}
