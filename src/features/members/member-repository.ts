import { asc, eq } from "drizzle-orm";

import {
  AvatarColor,
  MemberProfile,
  isAvatarColor,
  mergeMemberProfiles,
} from "@/domain/members";
import { Participant } from "@/domain/checkins";
import { getDb } from "@/db/client";
import { RoomMemberRow, roomMembers } from "@/db/schema";

export type UpsertMemberProfileInput = {
  roomId: string;
  participant: Participant;
  displayName: string;
  avatarUrl: string | null;
  avatarColor: AvatarColor;
};

export const getRoomMemberProfiles = async (roomId: string) => {
  const db = getDb();
  const rows = await db
    .select()
    .from(roomMembers)
    .where(eq(roomMembers.roomId, roomId))
    .orderBy(asc(roomMembers.participant));

  return mergeMemberProfiles(rows.map(toMemberProfile));
};

export const upsertRoomMemberProfile = async (
  input: UpsertMemberProfileInput,
) => {
  const db = getDb();
  const now = new Date();

  const [row] = await db
    .insert(roomMembers)
    .values({
      roomId: input.roomId,
      participant: input.participant,
      displayName: input.displayName,
      avatarUrl: input.avatarUrl,
      avatarColor: input.avatarColor,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [roomMembers.roomId, roomMembers.participant],
      set: {
        displayName: input.displayName,
        avatarUrl: input.avatarUrl,
        avatarColor: input.avatarColor,
        updatedAt: now,
      },
    })
    .returning();

  return toMemberProfile(row);
};

const toMemberProfile = (row: RoomMemberRow): MemberProfile => ({
  participant: row.participant,
  displayName: row.displayName,
  avatarUrl: row.avatarUrl,
  avatarColor: isAvatarColor(row.avatarColor) ? row.avatarColor : "blue",
});
