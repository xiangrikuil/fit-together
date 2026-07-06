import { and, asc, eq, gte, lte } from "drizzle-orm";

import {
  CheckinRecord,
  CheckinStatus,
  Participant,
  WorkoutType,
  getMonthDates,
} from "@/domain/checkins";
import { getDb } from "@/db/client";
import { CheckinRow, checkins } from "@/db/schema";

export type CheckinView = CheckinRecord & {
  workoutType: WorkoutType | null;
  durationMinutes: number | null;
  note: string;
};

export type UpsertCheckinInput = {
  roomId: string;
  participant: Participant;
  dateCn: string;
  status: CheckinStatus;
  workoutType: WorkoutType | null;
  durationMinutes: number | null;
  note: string;
};

export const getRoomMonthCheckins = async (roomId: string, month: string) => {
  const db = getDb();
  const dates = getMonthDates(month);

  if (dates.length === 0) {
    return [];
  }

  const rows = await db
    .select()
    .from(checkins)
    .where(
      and(
        eq(checkins.roomId, roomId),
        gte(checkins.dateCn, dates[0]),
        lte(checkins.dateCn, dates[dates.length - 1]),
      ),
    )
    .orderBy(asc(checkins.dateCn), asc(checkins.participant));

  return rows.map(toCheckinView);
};

export const upsertTodayCheckin = async (input: UpsertCheckinInput) => {
  const db = getDb();
  const now = new Date();

  const [row] = await db
    .insert(checkins)
    .values({
      roomId: input.roomId,
      participant: input.participant,
      dateCn: input.dateCn,
      status: input.status,
      workoutType: input.workoutType,
      durationMinutes: input.durationMinutes,
      note: input.note,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [checkins.roomId, checkins.participant, checkins.dateCn],
      set: {
        status: input.status,
        workoutType: input.workoutType,
        durationMinutes: input.durationMinutes,
        note: input.note,
        updatedAt: now,
      },
    })
    .returning();

  return toCheckinView(row);
};

const toCheckinView = (row: CheckinRow): CheckinView => ({
  participant: row.participant,
  dateCn: row.dateCn,
  status: row.status,
  workoutType: row.workoutType,
  durationMinutes: row.durationMinutes,
  note: row.note,
});
