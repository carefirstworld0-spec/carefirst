import { z } from "zod";

export const enquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your name (at least 2 characters).")
    .max(100, "Name is too long."),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9][0-9\s()-]{6,24}$/, "Enter a valid phone number."),
  clinic: z
    .string()
    .trim()
    .min(2, "Enter your clinic or hospital name.")
    .max(150, "Practice name is too long."),
  email: z.string().trim().email("Enter a valid work email.").max(255, "Email is too long."),
  website: z.string().max(200).default(""),
});

export type EnquiryInput = z.input<typeof enquirySchema>;
