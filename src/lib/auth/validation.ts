import { z } from "zod";

import type { LoginPortal } from "@/lib/auth/login-config";

export const loginPortalSchema = z.enum([
  "customer",
  "admin",
  "resort-owner",
  "vehicle-owner",
]);

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password is too long.");

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  portal: loginPortalSchema,
});

export const sendOtpSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

export const sendLoginOtpSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  portal: loginPortalSchema,
});

export const verifyOtpSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6 digit OTP from email."),
});

export const verifyLoginOtpSchema = verifyOtpSchema.extend({
  portal: loginPortalSchema,
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name.").max(120),
    phone: z
      .string()
      .trim()
      .regex(
        /^\+?[0-9\s-]{8,18}$/,
        "Enter a valid phone number with country code.",
      ),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password."),
    acceptTerms: z.literal(true, {
      message: "Accept Terms and Privacy Policy to continue.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type LoginPortalInput = LoginPortal;
