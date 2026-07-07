"use client";

import { ChangeEvent, useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, X } from "lucide-react";

import type { Participant } from "@/domain/checkins";
import type { CheckinMediaView } from "@/features/checkins/checkin-repository";
import { MAX_CHECKIN_MEDIA_ITEMS } from "@/features/checkins/checkin-media-policy";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type CheckinMediaDraft = Omit<CheckinMediaView, "sortOrder">;

type CheckinMediaPickerProps = {
  roomId: string;
  participant: Participant | null;
  value: CheckinMediaDraft[];
  disabled: boolean;
  onChange: (media: CheckinMediaDraft[]) => void;
};

type UploadResponse = {
  media?: CheckinMediaDraft;
  error?: string;
};

export const CheckinMediaPicker = ({
  roomId,
  participant,
  value,
  disabled,
  onChange,
}: CheckinMediaPickerProps) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const isFull = value.length >= MAX_CHECKIN_MEDIA_ITEMS;
  const canUpload = Boolean(participant) && !disabled && !isUploading && !isFull;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    if (!participant) {
      setError("先选择身份 A 或 B。");
      return;
    }

    const remainingSlots = MAX_CHECKIN_MEDIA_ITEMS - value.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      setError(`最多上传 ${MAX_CHECKIN_MEDIA_ITEMS} 张图片。`);
    } else {
      setError("");
    }

    if (filesToUpload.length === 0) {
      return;
    }

    setIsUploading(true);

    try {
      const uploadedMedia: CheckinMediaDraft[] = [];

      for (const file of filesToUpload) {
        uploadedMedia.push(await uploadCheckinMedia(roomId, participant, file));
      }

      onChange([...value, ...uploadedMedia]);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "图片上传失败。",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    await handleFiles(event.currentTarget.files);
    event.currentTarget.value = "";
  };

  const handleRemove = (targetIndex: number) => {
    onChange(value.filter((_, index) => index !== targetIndex));
    setError("");
  };

  return (
    <div className="space-y-2">
      <Label>图片</Label>
      <div className="rounded-lg border border-dashed border-foreground/15 bg-background/50 p-3">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canUpload}
            onClick={() => cameraInputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Camera className="size-4" />
            )}
            拍照
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canUpload}
            onClick={() => galleryInputRef.current?.click()}
          >
            <ImagePlus className="size-4" />
            图库
          </Button>
          <span className="flex items-center text-xs text-muted-foreground">
            {value.length}/{MAX_CHECKIN_MEDIA_ITEMS}
          </span>
        </div>

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleInputChange}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleInputChange}
        />

        {value.length > 0 ? (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {value.map((media, index) => (
              <div
                key={`${media.pathname}-${index}`}
                className="relative aspect-square overflow-hidden rounded-md border border-foreground/10 bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={media.url}
                  alt={`打卡图片 ${index + 1}`}
                  className="size-full object-cover"
                />
                <button
                  type="button"
                  className={cn(
                    "absolute right-1 top-1 flex size-7 items-center justify-center",
                    "rounded-full bg-black/65 text-white shadow-sm",
                  )}
                  aria-label={`移除第 ${index + 1} 张图片`}
                  onClick={() => handleRemove(index)}
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
};

const uploadCheckinMedia = async (
  roomId: string,
  participant: Participant,
  file: File,
) => {
  const formData = new FormData();
  formData.append("participant", participant);
  formData.append("file", file);

  const response = await fetch(
    `/api/rooms/${encodeURIComponent(roomId)}/checkins/media`,
    {
      method: "POST",
      body: formData,
    },
  );
  const payload = (await response.json()) as UploadResponse;

  if (!response.ok || !payload.media) {
    throw new Error(payload.error ?? "图片上传失败。");
  }

  return payload.media;
};
