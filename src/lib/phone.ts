export const COUNTRY_CODE = "+91";
export const PHONE_DIGITS = 10;

export const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;

export function validatePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length !== PHONE_DIGITS) {
    return "Please enter a valid 10-digit mobile number.";
  }
  if (!INDIAN_PHONE_REGEX.test(digits)) {
    return "Please enter a valid 10-digit mobile number.";
  }
  return null;
}

export function sanitizePhone(value: string): string {
  return value.replace(/\D/g, "").slice(0, PHONE_DIGITS);
}

export function formatPhoneWithCountry(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `${COUNTRY_CODE}${digits.slice(0, PHONE_DIGITS)}`;
}
