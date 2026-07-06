import { z } from "zod";

import {
  CHECKIN_STATUSES,
  PARTICIPANTS,
  WORKOUT_TYPES,
} from "../../domain/checkins";
import { DEFAULT_DURATION_MINUTES } from "./duration-stepper";

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

export const upsertCheckinSchema = z
  .object({
    participant: z.enum(PARTICIPANTS),
    status: z.enum(CHECKIN_STATUSES),
    workoutType: z.enum(WORKOUT_TYPES).nullable().optional(),
    durationMinutes: z.number().int().min(0).max(1440).nullable().optional(),
    note: z.string().max(280).optional().default(""),
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
