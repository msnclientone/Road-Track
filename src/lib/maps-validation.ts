const GOOGLE_MAPS_PATTERN =
  /^https?:\/\/(maps\.google\.com|www\.google\.com\/maps|google\.com\/maps|goo\.gl\/maps|maps\.app\.goo\.gl|g\.page)\/.+/i;

export function isValidGoogleMapsUrl(url: string): boolean {
  return GOOGLE_MAPS_PATTERN.test(url.trim());
}
