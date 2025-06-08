"use server";

import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import prisma from "@/lib/prisma";
import { z } from "zod";

const schemaBank = z.object({
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
    .regex(/^(0[1-9]|1[0-2])$/, "Expiring month must be in MM format"),
  expiringYear: z
    .string()
    .regex(/^\d{4}$/, "Expiring year must be in YYYY format"),
  cvv: z
    .string()
    .min(3, "CVV is required")
    .max(4, "CVV must be 3 or 4 digits")
    .regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
});

export async function createCard(_prevState: any, formData: FormData) {
  const user = await currentUser();
  const userId = user?.id;

  if (!userId) {
    return {
      message: "User ID is missing or invalid.",
      ZodError: {},
    };
  }

  const values = {
    country: formData.get("country"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    cardNumber: formData.get("cardNumber"),
    expiringMonth: formData.get("expiringMonth"),
    expiringYear: formData.get("expiringYear"),
    cvv: formData.get("cvv"),
  };

  const parsed = schemaBank.safeParse(values);

  if (!parsed.success) {
    return {
      message: "Validation failed",
      ZodError: parsed.error.flatten().fieldErrors,
    };
  }

  const {
    country,
    firstName,
    lastName,
    cardNumber,
    expiringMonth,
    expiringYear,
    cvv,
  } = parsed.data;

  const expiryDate = new Date(
    Number(expiringYear),
    Number(expiringMonth) - 1,
    1
  );

  try {
    const existing = await prisma.bankCard.findFirst({
      where: { userId },
    });

    if (existing) {
      return {
        message: "A card is already associated with this user.",
        ZodError: {},
      };
    }

    await prisma.bankCard.create({
      data: {
        userId,
        country,
        firstName,
        lastName,
        cardNumber,
        expiryDate,
        cvc: cvv,
      },
    });

    // Update Clerk metadata so middleware allows main page
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { isProfileCompleted: true },
    });

    return {
      message: "Card created successfully",
      ZodError: {},
    };
  } catch (error) {
    return {
      message: "Database error",
      ZodError: {},
    };
  }
}
