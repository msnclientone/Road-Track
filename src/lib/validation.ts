import { z } from "zod";

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
    .regex(/^\+?[0-9\s-]{8,18}$/, "Enter a valid phone number with country code."),
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
