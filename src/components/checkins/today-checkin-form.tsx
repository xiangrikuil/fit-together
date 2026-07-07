"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Dumbbell, Loader2, Moon, Save } from "lucide-react";

import {
  CheckinStatus,
  Participant,
  WORKOUT_TYPES,
  WorkoutType,
} from "@/domain/checkins";
import { CheckinView } from "@/features/checkins/checkin-repository";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CHECKIN_STATUS_LABELS,
  WORKOUT_TYPE_LABELS,
} from "@/components/checkins/labels";
import { checkinPanelClassName } from "@/components/checkins/status-styles";
import { DurationStepperControl } from "@/components/checkins/duration-stepper-control";
import { normalizeDurationMinutes } from "@/features/checkins/duration-stepper";
import {
  CheckinMediaDraft,
  CheckinMediaPicker,
} from "@/components/checkins/checkin-media-picker";

type TodayCheckinFormProps = {
  roomId: string;
  today: string;
  selectedParticipant: Participant | null;
  record: CheckinView | null;
  disabled: boolean;
  onSaved: (record: CheckinView) => void;
};

export const TodayCheckinForm = ({
  roomId,
  today,
  selectedParticipant,
  record,
  disabled,
  onSaved,
}: TodayCheckinFormProps) => {
  const [status, setStatus] = useState<CheckinStatus>(record?.status ?? "done");
  const [workoutType, setWorkoutType] = useState<WorkoutType>(
    record?.workoutType ?? "strength",
  );
  const [durationMinutes, setDurationMinutes] = useState(
    normalizeDurationMinutes(record?.durationMinutes),
  );
  const [note, setNote] = useState(record?.note ?? "");
  const [media, setMedia] = useState<CheckinMediaDraft[]>(
    () => record?.media.map(toMediaDraft) ?? [],
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const canSubmit = Boolean(selectedParticipant) && !disabled && !isSaving;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedParticipant) {
      setError("先选择身份 A 或 B。");
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/rooms/${encodeURIComponent(roomId)}/checkins/today`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            participant: selectedParticipant,
            status,
            workoutType: status === "done" ? workoutType : null,
            durationMinutes: status === "done" ? durationMinutes : null,
            note,
            media,
          }),
        },
      );

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "保存失败。");
        return;
      }

      onSaved(payload.record);
      setMessage("今日记录已保存。");
    } catch {
      setError("网络异常，请稍后重试。");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className={checkinPanelClassName}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Dumbbell className="size-4 text-primary" />
            今日打卡
          </h2>
          <p className="text-sm text-muted-foreground">
            中国时间 {today}，00:00-24:00
          </p>
        </div>
        {record ? (
          <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            正在编辑今日记录
          </span>
        ) : null}
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-2">
          {(["done", "rest"] as const).map((value) => (
            <Button
              key={value}
              type="button"
              variant={status === value ? "secondary" : "outline"}
              className="h-10 data-[active=true]:border-primary/20 data-[active=true]:text-primary"
              data-active={status === value}
              onClick={() => setStatus(value)}
              disabled={!selectedParticipant || disabled}
            >
              {value === "done" ? (
                <CheckCircle2 className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
              {CHECKIN_STATUS_LABELS[value]}
            </Button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
          <div className="space-y-2">
            <Label htmlFor="workout-type">训练类型</Label>
            <select
              id="workout-type"
              value={workoutType}
              onChange={(event) =>
                setWorkoutType(event.target.value as WorkoutType)
              }
              disabled={status === "rest" || !selectedParticipant || disabled}
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {WORKOUT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {WORKOUT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
          <DurationStepperControl
            value={durationMinutes}
            disabled={status === "rest" || !selectedParticipant || disabled}
            onChange={setDurationMinutes}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="note">备注</Label>
          <Textarea
            id="note"
            value={note}
            maxLength={280}
            placeholder="例如：深蹲 5x5，跑步 30 分钟，或今天主动休息。"
            onChange={(event) => setNote(event.target.value)}
            disabled={!selectedParticipant || disabled}
            className="min-h-24 resize-none"
          />
        </div>

        <CheckinMediaPicker
          roomId={roomId}
          participant={selectedParticipant}
          value={media}
          disabled={!selectedParticipant || disabled}
          onChange={setMedia}
        />

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {message ? <p className="text-sm text-primary">{message}</p> : null}

        <Button type="submit" size="lg" disabled={!canSubmit} className="w-full">
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save />}
          保存今日记录
        </Button>
      </form>
    </section>
  );
};

const toMediaDraft = ({
  url,
  pathname,
  contentType,
  byteSize,
}: CheckinView["media"][number]): CheckinMediaDraft => ({
  url,
  pathname,
  contentType,
  byteSize,
});
