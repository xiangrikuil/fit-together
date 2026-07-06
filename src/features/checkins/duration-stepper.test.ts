import { describe, expect, test } from "vitest";

import {
  DEFAULT_DURATION_MINUTES,
  adjustDurationMinutes,
  normalizeDurationMinutes,
} from "./duration-stepper";

describe("duration stepper", () => {
  test("uses 60 minutes as the default duration", () => {
    expect(DEFAULT_DURATION_MINUTES).toBe(60);
    expect(normalizeDurationMinutes(null)).toBe(60);
  });

  test("steps duration in 15 minute increments", () => {
    expect(adjustDurationMinutes(60, 1)).toBe(75);
    expect(adjustDurationMinutes(60, -1)).toBe(45);
  });

  test("keeps duration within the supported range", () => {
    expect(adjustDurationMinutes(0, -1)).toBe(0);
    expect(adjustDurationMinutes(1440, 1)).toBe(1440);
    expect(normalizeDurationMinutes(-30)).toBe(0);
    expect(normalizeDurationMinutes(1500)).toBe(1440);
  });
});
