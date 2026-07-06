import { describe, expect, test } from "vitest";

import { DEFAULT_DURATION_MINUTES } from "./duration-stepper";
import { upsertCheckinSchema } from "./checkin-validation";

describe("check-in validation", () => {
  test("uses 60 minutes as the default training duration", () => {
    const payload = upsertCheckinSchema.parse({
      participant: "A",
      status: "done",
      note: "  ok  ",
    });

    expect(payload.durationMinutes).toBe(DEFAULT_DURATION_MINUTES);
    expect(payload.note).toBe("ok");
  });

  test("clears workout details for rest records", () => {
    const payload = upsertCheckinSchema.parse({
      participant: "B",
      status: "rest",
      workoutType: "cardio",
      durationMinutes: 60,
    });

    expect(payload.workoutType).toBeNull();
    expect(payload.durationMinutes).toBeNull();
  });
});
