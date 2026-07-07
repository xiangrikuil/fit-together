import { z } from "zod";

import {
  CHECKIN_STATUSES,
  PARTICIPANTS,
  WORKOUT_TYPES,
} from "../../domain/checkins";
import {
  CHECKIN_MEDIA_CONTENT_TYPES,
  MAX_CHECKIN_MEDIA_BYTES,
  MAX_CHECKIN_MEDIA_ITEMS,
} from "./checkin-media-policy";
import { DEFAULT_DURATION_MINUTES } from "./duration-stepper";

export {
  CHECKIN_MEDIA_CONTENT_TYPES,
  MAX_CHECKIN_MEDIA_BYTES,
  MAX_CHECKIN_MEDIA_ITEMS,
} from "./checkin-media-policy";

export const roomIdSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-zA-Z0-9_-]+$/);

export const monthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/)
  .refine((month) => {
    const monthNumber = Number(month.slice(5, 7));
    return monthNumber >= 1 && monthNumber <= 12;
  });

export const checkinMediaUploadRequestSchema = z.object({
  participant: z.enum(PARTICIPANTS),
});

export const savedCheckinMediaSchema = z.object({
  url: z.string().url(),
  pathname: z.string().min(1).max(512),
  contentType: z.enum(CHECKIN_MEDIA_CONTENT_TYPES),
  byteSize: z.number().int().min(1).max(MAX_CHECKIN_MEDIA_BYTES),
});

export const upsertCheckinSchema = z
  .object({
    participant: z.enum(PARTICIPANTS),
    status: z.enum(CHECKIN_STATUSES),
    workoutType: z.enum(WORKOUT_TYPES).nullable().optional(),
    durationMinutes: z.number().int().min(0).max(1440).nullable().optional(),
    note: z.string().max(280).optional().default(""),
    media: z
      .array(savedCheckinMediaSchema)
      .max(MAX_CHECKIN_MEDIA_ITEMS)
      .optional()
      .default([]),
  })
  .transform((input) => {
    if (input.status === "rest") {
      return {
        ...input,
        workoutType: null,
        durationMinutes: null,
        note: input.note.trim(),
      };
    }

    return {
      ...input,
      workoutType: input.workoutType ?? "strength",
      durationMinutes: input.durationMinutes ?? DEFAULT_DURATION_MINUTES,
      note: input.note.trim(),
    };
  });
