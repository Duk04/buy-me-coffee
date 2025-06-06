"use client";
import { z } from "zod";

export const schema = z.object({
  name: z.string().min(1, "Name is required"),
  about: z
    .string()
    .min(1, "About is required")
    .max(300, "About section should not exceed 300 characters"),
  socialMediaURL: z
    .string()
    .min(1, "Social Media is required")
    .optional()
    .refine(
      (val) => !val || /^https?:\/\/.+/.test(val),
      "Enter a valid URL (must start with http:// or https://)"
    ),
  avatarImage: z.string().min(1, "Photo is required"),
});
export type FormData = z.infer<typeof schema>;

export const schemaBank = z.object({
  country: z.string().min(1, "Country is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  cardNumber: z
    .string()
    .min(16, "Card number must be 16 digits")
    .max(16, "Card number must be 16 digits")
    .regex(/^\d{16}$/, "Card number must be 16 digits"),
  expiringMonth: z
    .string()
    .min(1, "Expiring month is required")
    .regex(/^(0[1-9]|1[0-2])$/, "Expiring month must be in MM format"),
  expiringYear: z
    .string()
    .min(1, "Expiring year is required")
    .regex(/^\d{4}$/, "Expiring year must be in YYYY format"),
  cvv: z
    .string()
    .min(3, "CVV is required")
    .max(4, "CVV must be 3 or 4 digits")
    .regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
});
export type BankFormData = z.infer<typeof schemaBank>;
