import { z } from "zod";

import { PARTICIPANTS } from "@/domain/checkins";
import { AVATAR_COLORS } from "@/domain/members";

export const upsertMemberProfileSchema = z.object({
  participant: z.enum(PARTICIPANTS),
  displayName: z
    .string()
    .trim()
    .min(1, "Display name is required.")
    .max(24, "Display name is too long."),
  avatarUrl: z.url().nullable().optional(),
  avatarColor: z.enum(AVATAR_COLORS).optional().default("blue"),
});

export const avatarUploadRequestSchema = z.object({
  participant: z.enum(PARTICIPANTS),
});
