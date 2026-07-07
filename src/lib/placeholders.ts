const ALLOWED_IMAGE_HOSTS = new Set([
  "images.unsplash.com",
  "upload.wikimedia.org",
  "i.ytimg.com",
  "wallpaperaccess.com",
  "imgs.search.brave.com",
  "drive.google.com",
]);

export const PLACEHOLDER_IMAGES = {
  resort:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop",
  vehicle:
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&h=800&fit=crop",
  default:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop",
} as const;

export type PlaceholderType = keyof typeof PLACEHOLDER_IMAGES;

export function getPlaceholderImageUrl(type: string): string {
  if (type in PLACEHOLDER_IMAGES) {
    return PLACEHOLDER_IMAGES[type as PlaceholderType];
  }

  return PLACEHOLDER_IMAGES.default;
}

const GOOGLE_DRIVE_PATTERN =
  /^https?:\/\/(drive\.google\.com\/file\/d\/([^\/?#&]+)|drive\.google\.com\/(open|uc)\?.*[&\?]id=([^&#]+))/i;

export function extractGoogleDriveFileId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname !== "drive.google.com") return null;

    const fileMatch = u.pathname.match(/\/file\/d\/([^\/?#&]+)/);
    if (fileMatch) return fileMatch[1];

    const idParam = u.searchParams.get("id");
    if (idParam) return idParam;

    return null;
  } catch {
    return null;
  }
}

export function isGoogleDriveUrl(url: string): boolean {
  return GOOGLE_DRIVE_PATTERN.test(url.trim());
}

export function convertGoogleDriveUrl(url: string): string | null {
  const fileId = extractGoogleDriveFileId(url);
  if (!fileId) return null;
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

export function convertToDirectImageUrl(url: string): string {
  const converted = convertGoogleDriveUrl(url);
  return converted ?? url;
}

export function verifyImageAccessible(url: string): Promise<boolean> {
  // Google Drive URLs cannot be verified via the Image() constructor because
  // Drive may serve an HTML interstitial (virus scan warning, confirmation page)
  // instead of the raw image, causing false negatives for valid public files.
  // The URL format is already validated by isGoogleDriveUrl() and extractGoogleDriveFileId().
  if (url.includes("drive.google.com")) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

export function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname.includes(".") &&
      ALLOWED_IMAGE_HOSTS.has(parsed.hostname)
    );
  } catch {
    return false;
  }
}

export function getListingImageUrl(
  media: { url: string }[] | undefined | null,
  type: "resort" | "vehicle",
): string {
  const url = media?.[0]?.url;
  if (!url) return PLACEHOLDER_IMAGES[type];
  const directUrl = convertToDirectImageUrl(url);
  return isValidImageUrl(directUrl) ? directUrl : PLACEHOLDER_IMAGES[type];
}
