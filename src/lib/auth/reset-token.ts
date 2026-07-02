import { createHash, randomBytes } from "node:crypto";

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 3;

export function generateResetToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function getResetTokenExpiry(): Date {
  return new Date(Date.now() + RESET_TOKEN_TTL_MS);
}

export function isResetTokenExpired(expiresAt: Date): boolean {
  return expiresAt.getTime() <= Date.now();
}

export function hasExceededResetAttempts(attempts: number): boolean {
  return attempts >= MAX_VERIFY_ATTEMPTS;
}
