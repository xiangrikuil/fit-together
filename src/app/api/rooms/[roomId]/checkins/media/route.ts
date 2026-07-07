import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { formatChinaDate } from "@/domain/checkins";
import { isAuthorizedRoomRequest } from "@/features/auth/room-request-auth";
import {
  CHECKIN_MEDIA_CONTENT_TYPES,
  MAX_CHECKIN_MEDIA_BYTES,
  checkinMediaUploadRequestSchema,
  roomIdSchema,
} from "@/features/checkins/checkin-validation";
import { canUploadWithVercelBlob } from "@/features/members/blob-upload-config";

const allowedCheckinMediaTypes: string[] = [...CHECKIN_MEDIA_CONTENT_TYPES];

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

  if (!canUploadWithVercelBlob(process.env)) {
    return NextResponse.json(
      { error: "Vercel Blob upload credentials are not configured." },
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
        { error: "Check-in photo is required." },
        { status: 400 },
      );
    }

    const payload = checkinMediaUploadRequestSchema.parse({ participant });

    if (!allowedCheckinMediaTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "仅支持 JPG、PNG、WebP 图片。HEIC 图片请先转成 JPG。" },
        { status: 400 },
      );
    }

    if (file.size > MAX_CHECKIN_MEDIA_BYTES) {
      return NextResponse.json(
        { error: "单张图片不能超过 4MB。" },
        { status: 400 },
      );
    }

    const blob = await put(
      `rooms/${safeRoomId}/${payload.participant}/checkins/${formatChinaDate()}-${Date.now()}${getExtension(file)}`,
      file,
      {
        access: "public",
        addRandomSuffix: true,
        maximumSizeInBytes: MAX_CHECKIN_MEDIA_BYTES,
      },
    );

    return NextResponse.json({
      media: {
        url: blob.url,
        pathname: blob.pathname,
        contentType: blob.contentType,
        byteSize: file.size,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid check-in photo upload.", issues: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Unable to upload check-in photo." },
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
