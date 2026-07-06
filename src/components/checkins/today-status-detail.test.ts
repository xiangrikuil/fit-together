import { describe, expect, test } from "vitest";

import type { CheckinView } from "@/features/checkins/checkin-repository";
import { getTodayStatusDetail } from "./today-status-detail";

describe("today status detail", () => {
  test("shows workout type and duration for a saved training record", () => {
    const record: CheckinView = {
      participant: "A",
      dateCn: "2026-07-06",
      status: "done",
      workoutType: "cardio",
      durationMinutes: 60,
      note: "",
    };

    expect(getTodayStatusDetail({ status: "done", record })).toBe(
      "有氧 · 60 分钟",
    );
  });

  test("shows active rest copy for a saved rest record", () => {
    const record: CheckinView = {
      participant: "B",
      dateCn: "2026-07-06",
      status: "rest",
      workoutType: null,
      durationMinutes: null,
      note: "",
    };

    expect(getTodayStatusDetail({ status: "rest", record })).toBe("主动休息");
  });

  test("shows waiting copy before a member checks in", () => {
    expect(getTodayStatusDetail({ status: "missed", record: null })).toBe(
      "等待打卡",
    );
  });
});
