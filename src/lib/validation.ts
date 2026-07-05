import { z } from "zod";

import { INDIAN_PHONE_REGEX } from "@/lib/phone";

const optionalText = (max = 160) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || undefined);

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Name must contain at least two characters.").max(120),
  phone: z
    .string()
    .trim()
    .regex(INDIAN_PHONE_REGEX, "Enter a valid 10-digit Indian phone number."),
  email: optionalText().pipe(z.string().email().optional()),
  destination: z.string().trim().min(2).max(120),
  destinationSlug: optionalText(80),
  date: optionalText(40),
  people: z.coerce.number().int().min(1).max(100),
  vehicleRequired: z.boolean().default(false),
  resortRequired: z.boolean().default(false),
  vehicle: optionalText(80),
  hotel: optionalText(80),
  message: optionalText(500),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
