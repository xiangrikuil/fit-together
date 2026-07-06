import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { isDatabaseConfigured } from "@/db/client";
import { upsertRoomMemberProfile } from "@/features/members/member-repository";
import { upsertMemberProfileSchema } from "@/features/members/member-validation";
import { roomIdSchema } from "@/features/checkins/checkin-validation";

export async function POST(
  request: Request,
  context: { params: Promise<{ roomId: string }> },
) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "DATABASE_URL is not configured." },
      { status: 503 },
    );
  }

  try {
    const { roomId } = await context.params;
    const safeRoomId = roomIdSchema.parse(roomId);
    const payload = upsertMemberProfileSchema.parse(await request.json());
    const profile = await upsertRoomMemberProfile({
      roomId: safeRoomId,
      participant: payload.participant,
      displayName: payload.displayName,
      avatarUrl: payload.avatarUrl ?? null,
      avatarColor: payload.avatarColor,
    });

    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid member profile.", issues: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Unable to save member profile." },
      { status: 500 },
    );
  }
}
