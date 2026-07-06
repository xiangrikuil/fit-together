import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { roomIdSchema } from "@/features/checkins/checkin-validation";
import { avatarUploadRequestSchema } from "@/features/members/member-validation";

const allowedAvatarTypes = ["image/jpeg", "image/png", "image/webp"];
const maxAvatarBytes = 2 * 1024 * 1024;

export async function POST(
  request: Request,
  context: { params: Promise<{ roomId: string }> },
) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN is not configured." },
      { status: 503 },
    );
  }

  try {
    const { roomId } = await context.params;
    const safeRoomId = roomIdSchema.parse(roomId);
    const formData = await request.formData();
    const file = formData.get("file");
    const participant = formData.get("participant");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Avatar file is required." },
        { status: 400 },
      );
    }

    const payload = avatarUploadRequestSchema.parse({ participant });

    if (!allowedAvatarTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, and WebP avatars are allowed." },
        { status: 400 },
      );
    }

    if (file.size > maxAvatarBytes) {
      return NextResponse.json(
        { error: "Avatar must be 2MB or smaller." },
        { status: 400 },
      );
    }

    const extension = getExtension(file);
    const blob = await put(
      `rooms/${safeRoomId}/${payload.participant}/avatar-${Date.now()}${extension}`,
      file,
      {
        access: "public",
        addRandomSuffix: true,
        maximumSizeInBytes: maxAvatarBytes,
      },
    );

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid avatar upload.", issues: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Unable to upload avatar." },
      { status: 500 },
    );
  }
}

const getExtension = (file: File) => {
  if (file.type === "image/png") {
    return ".png";
  }

  if (file.type === "image/webp") {
    return ".webp";
  }

  return ".jpg";
};
