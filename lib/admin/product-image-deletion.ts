export type ImageDeletionCandidate = { id: string; storage_path?: string | null; image_url?: string | null };

export function thumbnailAfterRemoval(imageKeys: string[], removedKey: string, thumbnailKey: string) {
  const remainingKeys = imageKeys.filter((key) => key !== removedKey);
  return thumbnailKey === removedKey ? (remainingKeys[0] ?? "") : thumbnailKey;
}

export function productImageStoragePath(
  image: Pick<ImageDeletionCandidate, "storage_path" | "image_url">,
  bucket = "product-images",
) {
  const storedPath = image.storage_path?.trim().replace(/^\/+/, "");
  if (storedPath && !/^https?:\/\//i.test(storedPath)) return storedPath;
  if (!image.image_url) return null;
  try {
    const url = new URL(image.image_url);
    const marker = `/storage/v1/object/public/${bucket}/`;
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex < 0) return null;
    const path = url.pathname.slice(markerIndex + marker.length).replace(/^\/+/, "");
    return path ? path.split("/").map((segment) => decodeURIComponent(segment)).join("/") : null;
  } catch { return null; }
}

export function pendingStoragePaths(images: ImageDeletionCandidate[]) {
  return [...new Set(images.map((image) => productImageStoragePath(image)).filter((path): path is string => Boolean(path)))];
}

export type PendingDeletionDriver = {
  deleteMetadata(ids: string[]): Promise<{ error: unknown | null }>;
  removeStorage(paths: string[]): Promise<{ error: unknown | null }>;
};

export class ProductImageDeletionError extends Error {
  readonly stage: "database" | "storage";
  readonly causeValue: unknown;

  constructor(stage: "database" | "storage", causeValue: unknown) {
    super(stage === "database" ? "Metadata gambar gagal dihapus." : "File gambar gagal dihapus dari Storage.");
    this.name = "ProductImageDeletionError";
    this.stage = stage;
    this.causeValue = causeValue;
  }
}

export async function commitPendingImageDeletion(driver: PendingDeletionDriver, images: ImageDeletionCandidate[]) {
  if (!images.length) return { metadataCommitted: false, storagePaths: [] as string[] };
  const metadata = await driver.deleteMetadata(images.map((image) => image.id));
  if (metadata.error) throw new ProductImageDeletionError("database", metadata.error);
  const storagePaths = pendingStoragePaths(images);
  if (storagePaths.length) {
    const storage = await driver.removeStorage(storagePaths);
    if (storage.error) throw new ProductImageDeletionError("storage", storage.error);
  }
  return { metadataCommitted: true, storagePaths };
}
