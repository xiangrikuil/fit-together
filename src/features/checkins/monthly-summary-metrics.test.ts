import { describe, expect, test } from "vitest";

import { getCompletionRate } from "./monthly-summary-metrics";

describe("monthly summary metrics", () => {
  test("rounds the done-day completion rate", () => {
    expect(getCompletionRate({ doneDays: 1, elapsedDays: 6 })).toBe(17);
  });

  test("returns 0 when no days have elapsed", () => {
    expect(getCompletionRate({ doneDays: 3, elapsedDays: 0 })).toBe(0);
  });

  test("never returns more than 100 percent", () => {
    expect(getCompletionRate({ doneDays: 8, elapsedDays: 6 })).toBe(100);
  });
});
