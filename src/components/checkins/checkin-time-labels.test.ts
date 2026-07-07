import { describe, expect, test } from "vitest";

import {
  formatCheckinActivityTimestamp,
  formatCheckinClockTime,
  getCheckinEditedClockTime,
} from "./checkin-time-labels";

describe("check-in time labels", () => {
  test("formats activity timestamp as today with minute precision", () => {
    expect(
      formatCheckinActivityTimestamp({
        dateCn: "2026-07-07",
        createdAt: "2026-07-07T13:36:42.000Z",
        today: "2026-07-07",
      }),
    ).toBe("今天 21:36");
  });

  test("formats activity timestamp without year for the current year", () => {
    expect(
      formatCheckinActivityTimestamp({
        dateCn: "2026-06-30",
        createdAt: "2026-06-30T23:05:11.000Z",
        today: "2026-07-07",
      }),
    ).toBe("6 月 30 日 07:05");
  });

  test("formats activity timestamp with year across years", () => {
    expect(
      formatCheckinActivityTimestamp({
        dateCn: "2025-12-31",
        createdAt: "2025-12-31T15:59:59.000Z",
        today: "2026-07-07",
      }),
    ).toBe("2025 年 12 月 31 日 23:59");
  });

  test("formats today status clock with minute precision", () => {
    expect(formatCheckinClockTime("2026-07-07T13:36:42.000Z")).toBe("21:36");
  });

  test("shows edited clock only after a meaningful later update", () => {
    expect(
      getCheckinEditedClockTime({
        createdAt: "2026-07-07T13:36:42.000Z",
        updatedAt: "2026-07-07T14:10:01.000Z",
      }),
    ).toBe("22:10");

    expect(
      getCheckinEditedClockTime({
        createdAt: "2026-07-07T13:36:42.000Z",
        updatedAt: "2026-07-07T13:37:20.000Z",
      }),
    ).toBeNull();
  });
});
