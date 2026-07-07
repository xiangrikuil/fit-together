"use client";

import { useState } from "react";
import { Activity, Clock3, X } from "lucide-react";

import { Participant, getRecentCheckinActivity } from "@/domain/checkins";
import type { MemberProfile } from "@/domain/members";
import type {
  CheckinMediaView,
  CheckinView,
} from "@/features/checkins/checkin-repository";
import { cn } from "@/lib/utils";
import {
  CHECKIN_STATUS_LABELS,
  WORKOUT_TYPE_LABELS,
} from "@/components/checkins/labels";
import { MemberAvatar } from "@/components/checkins/member-avatar";
import {
  formatCheckinActivityTimestamp,
  getCheckinEditedClockTime,
} from "@/components/checkins/checkin-time-labels";
import {
  checkinPanelClassName,
  statusPillClassName,
} from "@/components/checkins/status-styles";

type CheckinActivityFeedProps = {
  today: string;
  records: CheckinView[];
  profiles: Record<Participant, MemberProfile>;
};

export const CheckinActivityFeed = ({
  today,
  records,
  profiles,
}: CheckinActivityFeedProps) => {
  const activityRecords = getRecentCheckinActivity(records);
  const [previewMedia, setPreviewMedia] = useState<CheckinMediaView | null>(
    null,
  );

  return (
    <section className="mx-auto w-full min-w-0 max-w-xl space-y-3">
      <div className={checkinPanelClassName}>
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Activity className="size-4 text-primary" />
          打卡动态
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          最近的训练照片和备注
        </p>
      </div>

      {activityRecords.length > 0 ? (
        activityRecords.map((record) => (
          <ActivityCard
            key={`${record.participant}-${record.dateCn}`}
            today={today}
            record={record}
            profile={profiles[record.participant]}
            onPreviewMedia={setPreviewMedia}
          />
        ))
      ) : (
        <div className={cn(checkinPanelClassName, "py-10 text-center")}>
          <p className="text-sm text-muted-foreground">暂无动态</p>
        </div>
      )}

      {previewMedia ? (
        <ImagePreview media={previewMedia} onClose={() => setPreviewMedia(null)} />
      ) : null}
    </section>
  );
};

const ActivityCard = ({
  today,
  record,
  profile,
  onPreviewMedia,
}: {
  today: string;
  record: CheckinView;
  profile: MemberProfile;
  onPreviewMedia: (media: CheckinMediaView) => void;
}) => {
  const editedClockTime = getCheckinEditedClockTime(record);

  return (
    <article className={checkinPanelClassName}>
      <div className="flex items-start gap-3">
        <MemberAvatar profile={profile} className="size-11 rounded-md" />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold">
                {profile.displayName}
              </h3>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs text-muted-foreground">
                <Clock3 className="size-3 shrink-0" />
                <span>
                  {formatCheckinActivityTimestamp({
                    dateCn: record.dateCn,
                    createdAt: record.createdAt,
                    today,
                  })}{" "}
                  打卡
                </span>
                {editedClockTime ? (
                  <span>· {editedClockTime} 编辑</span>
                ) : null}
              </p>
            </div>
            <span
              className={cn(
                "rounded-md px-2 py-1 text-xs font-medium",
                statusPillClassName[record.status],
              )}
            >
              {CHECKIN_STATUS_LABELS[record.status]}
            </span>
          </div>

          <p className="mt-2 text-sm font-medium text-foreground">
            {getActivitySummary(record)}
          </p>
          {record.note ? (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/85">
              {record.note}
            </p>
          ) : null}
          {record.media.length > 0 ? (
            <MediaGrid media={record.media} onPreviewMedia={onPreviewMedia} />
          ) : null}
        </div>
      </div>
    </article>
  );
};

const MediaGrid = ({
  media,
  onPreviewMedia,
}: {
  media: CheckinMediaView[];
  onPreviewMedia: (media: CheckinMediaView) => void;
}) => (
  <div
    className={cn(
      "mt-3 grid gap-1.5",
      media.length === 1 ? "max-w-64 grid-cols-1" : "grid-cols-3",
    )}
  >
    {media.map((item, index) => (
      <button
        key={`${item.pathname}-${index}`}
        type="button"
        className="aspect-square overflow-hidden rounded-md bg-muted text-left"
        onClick={() => onPreviewMedia(item)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.url}
          alt={`打卡图片 ${index + 1}`}
          className="size-full object-cover transition-transform duration-200 hover:scale-[1.03]"
        />
      </button>
    ))}
  </div>
);

const ImagePreview = ({
  media,
  onClose,
}: {
  media: CheckinMediaView;
  onClose: () => void;
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
    role="dialog"
    aria-modal="true"
  >
    <button
      type="button"
      className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur"
      aria-label="关闭图片预览"
      onClick={onClose}
    >
      <X className="size-5" />
    </button>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={media.url}
      alt="打卡图片预览"
      className="max-h-[86vh] max-w-full rounded-md object-contain shadow-2xl"
    />
  </div>
);

const getActivitySummary = (record: CheckinView) => {
  if (record.status === "rest") {
    return "主动休息";
  }

  const details = [
    record.workoutType ? WORKOUT_TYPE_LABELS[record.workoutType] : null,
    record.durationMinutes !== null ? `${record.durationMinutes} 分钟` : null,
  ].filter(Boolean);

  return details.length > 0 ? details.join(" · ") : "已训练";
};
