import { and, asc, eq, gte, lte } from "drizzle-orm";

import {
  CheckinRecord,
  CheckinStatus,
  Participant,
  WorkoutType,
  getMonthDates,
} from "@/domain/checkins";
import { getDb } from "@/db/client";
import {
  CheckinMediaRow,
  CheckinRow,
  checkinMedia,
  checkins,
} from "@/db/schema";

export type CheckinView = CheckinRecord & {
  workoutType: WorkoutType | null;
  durationMinutes: number | null;
  note: string;
  createdAt: string;
  updatedAt: string;
  media: CheckinMediaView[];
};

export type CheckinMediaView = {
  url: string;
  pathname: string;
  contentType: string;
  byteSize: number;
  sortOrder: number;
};

export type UpsertCheckinInput = {
  roomId: string;
  participant: Participant;
  dateCn: string;
  status: CheckinStatus;
  workoutType: WorkoutType | null;
  durationMinutes: number | null;
  note: string;
  media: Array<Omit<CheckinMediaView, "sortOrder">>;
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

  const mediaRows = await db
    .select()
    .from(checkinMedia)
    .where(
      and(
        eq(checkinMedia.roomId, roomId),
        gte(checkinMedia.dateCn, dates[0]),
        lte(checkinMedia.dateCn, dates[dates.length - 1]),
      ),
    )
    .orderBy(
      asc(checkinMedia.dateCn),
      asc(checkinMedia.participant),
      asc(checkinMedia.sortOrder),
    );

  const mediaByCheckinId = groupMediaByCheckinId(mediaRows);

  return rows.map((row) =>
    toCheckinView(row, mediaByCheckinId.get(row.id) ?? []),
  );
};

export const upsertTodayCheckin = async (input: UpsertCheckinInput) => {
  const db = getDb();
  const now = new Date();

  return db.transaction(async (tx) => {
    const [row] = await tx
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

    await tx.delete(checkinMedia).where(eq(checkinMedia.checkinId, row.id));

    if (input.media.length > 0) {
      await tx.insert(checkinMedia).values(
        input.media.map((media, index) => ({
          checkinId: row.id,
          roomId: input.roomId,
          participant: input.participant,
          dateCn: input.dateCn,
          url: media.url,
          pathname: media.pathname,
          contentType: media.contentType,
          byteSize: media.byteSize,
          sortOrder: index,
        })),
      );
    }

    return toCheckinView(
      row,
      input.media.map((media, index) => ({
        ...media,
        sortOrder: index,
      })),
    );
  });
};

const groupMediaByCheckinId = (rows: CheckinMediaRow[]) => {
  const mediaByCheckinId = new Map<string, CheckinMediaView[]>();

  for (const row of rows) {
    const media = mediaByCheckinId.get(row.checkinId) ?? [];
    media.push(toCheckinMediaView(row));
    mediaByCheckinId.set(row.checkinId, media);
  }

  return mediaByCheckinId;
};

const toCheckinView = (
  row: CheckinRow,
  media: CheckinMediaView[] = [],
): CheckinView => ({
  participant: row.participant,
  dateCn: row.dateCn,
  status: row.status,
  workoutType: row.workoutType,
  durationMinutes: row.durationMinutes,
  note: row.note,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
  media,
});

const toCheckinMediaView = (row: CheckinMediaRow): CheckinMediaView => ({
  url: row.url,
  pathname: row.pathname,
  contentType: row.contentType,
  byteSize: row.byteSize,
  sortOrder: row.sortOrder,
});
