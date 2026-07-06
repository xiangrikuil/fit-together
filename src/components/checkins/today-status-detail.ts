import type { CalendarStatus } from "@/domain/checkins";
import type { CheckinView } from "@/features/checkins/checkin-repository";
import { WORKOUT_TYPE_LABELS } from "./labels";

type TodayStatusDetailInput = {
  status: CalendarStatus;
  record: CheckinView | null;
};

export const getTodayStatusDetail = ({
  status,
  record,
}: TodayStatusDetailInput) => {
  if (status === "rest") {
    return "主动休息";
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

  return details.length > 0 ? details.join(" · ") : "已训练";
};
