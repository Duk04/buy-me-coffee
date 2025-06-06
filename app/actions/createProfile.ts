"use server";

import { z } from "zod";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

const schemaUserProfile = z.object({
  name: z.string().min(1),
  about: z.string().min(1),
  socialMediaURL: z.string().url(),
  avatarImage: z.string().optional(),
});

export const createProfile = async (formData: FormData) => {
  const user = await currentUser();
  if (!user) return { message: "Unauthorized" };

  const rawData = {
    name: formData.get("name"),
    about: formData.get("about"),
    socialMediaURL: formData.get("socialMediaURL"),
    avatarImage: formData.get("avatarImage"),
  };

  const validated = schemaUserProfile.safeParse(rawData);
  if (!validated.success) {
    return {
      ZodError: validated.error.flatten().fieldErrors,
    };
  }

  const avatarImageUrl = (formData.get("avatarImage") as string) ?? "";

  await prisma.profile.create({
    data: {
      name: validated.data.name,
      about: validated.data.about,
      avatarImage: avatarImageUrl,
      socialMediaURL: validated.data.socialMediaURL,
      successMessage: "Profile created successfully",
      user: user.id,
    },
  });

  return { message: "Profile created successfully" };
};
