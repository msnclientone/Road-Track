import { createHash, randomInt } from "node:crypto";

const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;

export function generateOtpCode(): string {
  return randomInt(100000, 999999).toString();
}

export function hashOtpCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export function getOtpExpiryDate(): Date {
  return new Date(Date.now() + OTP_TTL_MS);
}

export function isOtpExpired(expiresAt: Date): boolean {
  return expiresAt.getTime() <= Date.now();
}

export function hasExceededOtpAttempts(attempts: number): boolean {
  return attempts >= MAX_VERIFY_ATTEMPTS;
}
