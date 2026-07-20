import { z } from "zod";

import { INDIAN_PHONE_REGEX } from "@/lib/phone";
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
  email: z.string().trim().min(1, "Enter your email or login ID."),
  password: z.string().min(1, "Enter your password."),
  portal: loginPortalSchema,
});

export const sendOtpSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  portal: loginPortalSchema.optional(),
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
  portal: loginPortalSchema.optional(),
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
      .regex(INDIAN_PHONE_REGEX, "Enter a valid 10-digit Indian phone number."),
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

export const vehicleCreateSchema = z.object({
  vehicleType: z.string().min(1, "Vehicle type is required."),
  seatingCapacity: z.coerce.number().int().min(1),
  driverName: z.string().trim().min(1, "Driver name is required.").max(120),
  driverPhone: z.string().trim().regex(INDIAN_PHONE_REGEX, "Enter a valid 10-digit phone number."),
  registrationNo: z.string().trim().min(1, "Registration number is required.").max(40),
  destinationId: z.string().min(1, "Destination is required."),
  heroImageUrl: z.string().url().optional().or(z.literal("")),
});

export const vehicleUpdateSchema = vehicleCreateSchema.partial();

export const addVehicleOwnerSchema = z.object({
  ownerName: z.string().trim().min(1, "Owner name is required.").max(120).optional(),
  ownerPhone: z.string().trim().regex(INDIAN_PHONE_REGEX, "Enter a valid 10-digit phone number.").optional(),
  existingOwnerId: z.string().optional(),
  vehicleType: z.string().min(1, "Vehicle type is required."),
  seatingCapacity: z.coerce.number().int().min(1),
  registrationNo: z.string().trim().min(1, "Registration number is required.").max(40),
  destinationId: z.string().min(1, "Destination is required."),
  pricePerKm: z.coerce.number().int().min(0).optional(),
  pricePerDay: z.coerce.number().int().min(0).optional(),
  heroImageUrl: z.string().url().optional().or(z.literal("")),
});

export const addResortOwnerSchema = z.object({
  ownerName: z.string().trim().min(1, "Owner name is required.").max(120).optional(),
  ownerPhone: z.string().trim().regex(INDIAN_PHONE_REGEX, "Enter a valid 10-digit phone number.").optional(),
  existingOwnerId: z.string().optional(),
  name: z.string().trim().min(1, "Resort name is required.").max(120),
  description: z.string().trim().min(1, "Description is required.").max(2000),
  address: z.string().trim().optional(),
  acRooms: z.coerce.number().int().min(0).optional(),
  nonAcRooms: z.coerce.number().int().min(0).optional(),
  amenities: z.string().trim().optional(),
  destinationId: z.string().min(1, "Destination is required."),
  imageUrl: z.string().url().optional().or(z.literal("")),
  additionalImageUrls: z.array(z.string().url()).max(5).optional(),
  googleMapsLink: z.string().url().optional().or(z.literal("")),
  nonAcPrice: z.coerce.number().int().min(0).optional(),
  acPrice: z.coerce.number().int().min(0).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type LoginPortalInput = LoginPortal;
