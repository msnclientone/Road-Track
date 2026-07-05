const ALLOWED_IMAGE_HOSTS = new Set([
  "images.unsplash.com",
  "upload.wikimedia.org",
  "i.ytimg.com",
  "wallpaperaccess.com",
  "imgs.search.brave.com",
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
  return url && isValidImageUrl(url) ? url : PLACEHOLDER_IMAGES[type];
}
