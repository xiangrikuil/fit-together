import { describe, expect, test } from "vitest";

import {
  buildMonthlyDashboard,
  formatChinaDate,
  getRecentCheckinActivity,
  getMonthDates,
} from "./checkins";
import * as checkins from "./checkins";

describe("China calendar dates", () => {
  test("rolls the check-in day at Asia/Shanghai midnight", () => {
    expect(formatChinaDate(new Date("2026-07-05T15:59:59.000Z"))).toBe(
      "2026-07-05",
    );
    expect(formatChinaDate(new Date("2026-07-05T16:00:00.000Z"))).toBe(
      "2026-07-06",
    );
  });

  test("builds calendar dates without depending on the server locale", () => {
    expect(getMonthDates("2026-02")).toHaveLength(28);
    expect(getMonthDates("2028-02")).toHaveLength(29);
    expect(getMonthDates("2026-07").at(0)).toBe("2026-07-01");
    expect(getMonthDates("2026-07").at(-1)).toBe("2026-07-31");
  });
});

describe("monthly dashboard", () => {
  test("summarizes done, rest, missed, streak, and common workout days", () => {
    const dashboard = buildMonthlyDashboard({
      month: "2026-07",
      today: "2026-07-06",
      records: [
        { participant: "A", dateCn: "2026-07-01", status: "done" },
        { participant: "A", dateCn: "2026-07-02", status: "rest" },
        { participant: "A", dateCn: "2026-07-04", status: "done" },
        { participant: "A", dateCn: "2026-07-05", status: "done" },
        { participant: "A", dateCn: "2026-07-06", status: "done" },
        { participant: "B", dateCn: "2026-07-01", status: "done" },
        { participant: "B", dateCn: "2026-07-03", status: "done" },
        { participant: "B", dateCn: "2026-07-04", status: "done" },
        { participant: "B", dateCn: "2026-07-05", status: "rest" },
        { participant: "B", dateCn: "2026-07-06", status: "done" },
      ],
    });

    expect(dashboard.dates).toHaveLength(31);
    expect(dashboard.elapsedDates).toEqual([
      "2026-07-01",
      "2026-07-02",
      "2026-07-03",
      "2026-07-04",
      "2026-07-05",
      "2026-07-06",
    ]);
    expect(dashboard.commonDoneDays).toBe(3);
    expect(dashboard.participants.A).toMatchObject({
      doneDays: 4,
      restDays: 1,
      missedDays: 1,
      currentStreak: 3,
    });
    expect(dashboard.participants.B).toMatchObject({
      doneDays: 4,
      restDays: 1,
      missedDays: 1,
      currentStreak: 1,
    });
    expect(dashboard.days["2026-07-03"].A).toBe("missed");
    expect(dashboard.days["2026-07-05"].B).toBe("rest");
  });
});

describe("dashboard display helpers", () => {
  test("returns the most recent elapsed dates for compact overviews", () => {
    const dashboard = buildMonthlyDashboard({
      month: "2026-07",
      today: "2026-07-10",
      records: [],
    });
    const getRecentDashboardDates = (
      checkins as typeof checkins & {
        getRecentDashboardDates?: (
          dashboard: ReturnType<typeof buildMonthlyDashboard>,
          limit?: number,
        ) => string[];
      }
    ).getRecentDashboardDates;

    expect(getRecentDashboardDates).toBeDefined();

    if (!getRecentDashboardDates) {
      return;
    }

    expect(getRecentDashboardDates(dashboard)).toEqual([
      "2026-07-04",
      "2026-07-05",
      "2026-07-06",
      "2026-07-07",
      "2026-07-08",
      "2026-07-09",
      "2026-07-10",
    ]);
    expect(getRecentDashboardDates(dashboard, 3)).toEqual([
      "2026-07-08",
      "2026-07-09",
      "2026-07-10",
    ]);
  });

  test("returns recent check-in activity in feed order", () => {
    const records = [
      { participant: "B" as const, dateCn: "2026-07-05", status: "done" as const },
      { participant: "A" as const, dateCn: "2026-07-06", status: "rest" as const },
      { participant: "B" as const, dateCn: "2026-07-06", status: "done" as const },
      { participant: "A" as const, dateCn: "2026-07-04", status: "done" as const },
    ];

    expect(getRecentCheckinActivity(records, 3)).toEqual([
      { participant: "A", dateCn: "2026-07-06", status: "rest" },
      { participant: "B", dateCn: "2026-07-06", status: "done" },
      { participant: "B", dateCn: "2026-07-05", status: "done" },
    ]);
  });

  test("orders same-day activity by actual check-in time when available", () => {
    const records = [
      {
        participant: "A" as const,
        dateCn: "2026-07-06",
        status: "done" as const,
        createdAt: "2026-07-06T10:00:00.000Z",
      },
      {
        participant: "B" as const,
        dateCn: "2026-07-06",
        status: "rest" as const,
        createdAt: "2026-07-06T13:00:00.000Z",
      },
    ];

    expect(getRecentCheckinActivity(records, 2)).toEqual([
      {
        participant: "B",
        dateCn: "2026-07-06",
        status: "rest",
        createdAt: "2026-07-06T13:00:00.000Z",
      },
      {
        participant: "A",
        dateCn: "2026-07-06",
        status: "done",
        createdAt: "2026-07-06T10:00:00.000Z",
      },
    ]);
  });
});
