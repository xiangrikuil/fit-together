import { CalendarStatus, CheckinStatus, WorkoutType } from "@/domain/checkins";

export const PARTICIPANT_LABELS = {
  A: "A",
  B: "B",
} as const;

export const STATUS_LABELS: Record<CalendarStatus, string> = {
  done: "已训练",
  rest: "休息",
  missed: "缺卡",
  future: "未到",
};

export const CHECKIN_STATUS_LABELS: Record<CheckinStatus, string> = {
  done: "训练",
  rest: "休息",
};

export const WORKOUT_TYPE_LABELS: Record<WorkoutType, string> = {
  strength: "力量",
  cardio: "有氧",
  mobility: "拉伸",
  sport: "运动",
  other: "其他",
};
