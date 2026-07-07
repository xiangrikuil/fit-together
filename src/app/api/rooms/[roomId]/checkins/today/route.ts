import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { formatChinaDate } from "@/domain/checkins";
import { isDatabaseConfigured } from "@/db/client";
import { isAuthorizedRoomRequest } from "@/features/auth/room-request-auth";
import { upsertTodayCheckin } from "@/features/checkins/checkin-repository";
import {
  roomIdSchema,
  upsertCheckinSchema,
} from "@/features/checkins/checkin-validation";

export async function POST(
  request: Request,
  context: { params: Promise<{ roomId: string }> },
) {
  if (!isAuthorizedRoomRequest(request, process.env)) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "DATABASE_URL is not configured." },
      { status: 503 },
    );
  }

  try {
    const { roomId } = await context.params;
    const safeRoomId = roomIdSchema.parse(roomId);
    const payload = upsertCheckinSchema.parse(await request.json());
    const record = await upsertTodayCheckin({
      roomId: safeRoomId,
      participant: payload.participant,
      dateCn: formatChinaDate(),
      status: payload.status,
      workoutType: payload.workoutType,
      durationMinutes: payload.durationMinutes,
      note: payload.note,
      media: payload.media,
    });

    return NextResponse.json({ record });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid check-in payload.", issues: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Unable to save check-in." },
      { status: 500 },
    );
  }
}
