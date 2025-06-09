"use server";

import { clerkClient } from "@clerk/clerk-sdk-node";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { currentUser } from "@clerk/nextjs/server";

export async function createCard(_: any, formData: FormData) {
  const user = await currentUser();
  if (!user?.id) {
    return { success: false, message: "User not authenticated", ZodError: {} };
  }

  // Validate form data (your existing schema here)
  const schema = z.object({
    country: z.string().min(1),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    cardNumber: z
      .string()
      .length(16)
      .regex(/^\d{16}$/),
    expiringMonth: z.string().regex(/^(0[1-9]|1[0-2])$/),
    expiringYear: z.string().regex(/^\d{4}$/),
    cvv: z
      .string()
      .min(3)
      .max(4)
      .regex(/^\d{3,4}$/),
  });

  const values = Object.fromEntries(formData);
  const parsed = schema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
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
  const expiryDate = new Date(+expiringYear, +expiringMonth - 1, 1);

  try {
    const existing = await prisma.bankCard.findUnique({
      where: { userId: user.id },
    });
    if (existing) {
      return { success: false, message: "Card already exists", ZodError: {} };
    }

    await prisma.bankCard.create({
      data: {
        userId: user.id,
        country,
        firstName,
        lastName,
        cardNumber,
        expiryDate,
        cvc: cvv,
      },
    });

    await clerkClient.users.updateUser(user.id, {
      publicMetadata: { isProfileCompleted: true },
    });

    return {
      success: true,
      message: "Card created successfully",
      ZodError: {},
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Database error", ZodError: {} };
  }
}
