import crypto from "crypto";

const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER = "abcdefghjkmnpqrstuvwxyz";
const DIGITS = "23456789";
const SPECIAL = "!@#$%&*";
const ALL = UPPER + LOWER + DIGITS + SPECIAL;

export function generateTemporaryPassword(): string {
  const bytes = crypto.randomBytes(16);
  const password = [
    UPPER[bytes[0] % UPPER.length],
    LOWER[bytes[1] % LOWER.length],
    DIGITS[bytes[2] % DIGITS.length],
    SPECIAL[bytes[3] % SPECIAL.length],
  ];

  for (let i = 4; i < 12; i++) {
    password.push(ALL[bytes[i] % ALL.length]);
  }

  for (let i = password.length - 1; i > 0; i--) {
    const j = bytes[(i + 4) % 16] % (i + 1);
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join("");
}
