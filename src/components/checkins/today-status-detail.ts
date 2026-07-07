import type { CalendarStatus } from "@/domain/checkins";
import type { CheckinView } from "@/features/checkins/checkin-repository";
import { formatCheckinClockTime } from "./checkin-time-labels";
import { WORKOUT_TYPE_LABELS } from "./labels";

type TodayStatusDetailInput = {
  status: CalendarStatus;
  record: CheckinView | null;
};

export const getTodayStatusDetail = ({
  status,
  record,
}: TodayStatusDetailInput) => {
  const clockTime = record ? formatCheckinClockTime(record.createdAt) : null;

  if (status === "rest") {
    return clockTime ? `${clockTime} 主动休息` : "主动休息";
  }

  if (status !== "done") {
    return "等待打卡";
  }

  const details = [
    record?.workoutType ? WORKOUT_TYPE_LABELS[record.workoutType] : null,
    record?.durationMinutes !== null && record?.durationMinutes !== undefined
      ? `${record.durationMinutes} 分钟`
      : null,
  ].filter(Boolean);

  if (details.length > 0) {
    return [clockTime, ...details].filter(Boolean).join(" · ");
  }

  return clockTime ? `${clockTime} 已训练` : "已训练";
};
