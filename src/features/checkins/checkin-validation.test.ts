import { describe, expect, test } from "vitest";

import { DEFAULT_DURATION_MINUTES } from "./duration-stepper";
import {
  MAX_CHECKIN_MEDIA_ITEMS,
  checkinMediaUploadRequestSchema,
  upsertCheckinSchema,
} from "./checkin-validation";

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

  test("accepts up to three saved media items", () => {
    const payload = upsertCheckinSchema.parse({
      participant: "A",
      status: "done",
      media: [
        {
          url: "https://example.com/checkin-1.jpg",
          pathname: "rooms/fit/A/checkins/checkin-1.jpg",
          contentType: "image/jpeg",
          byteSize: 1024,
        },
        {
          url: "https://example.com/checkin-2.webp",
          pathname: "rooms/fit/A/checkins/checkin-2.webp",
          contentType: "image/webp",
          byteSize: 2048,
        },
        {
          url: "https://example.com/checkin-3.png",
          pathname: "rooms/fit/A/checkins/checkin-3.png",
          contentType: "image/png",
          byteSize: 4096,
        },
      ],
    });

    expect(payload.media).toHaveLength(MAX_CHECKIN_MEDIA_ITEMS);
    expect(payload.media[0]).toMatchObject({
      contentType: "image/jpeg",
      byteSize: 1024,
    });
  });

  test("rejects more than three saved media items", () => {
    expect(() =>
      upsertCheckinSchema.parse({
        participant: "A",
        status: "done",
        media: Array.from({ length: MAX_CHECKIN_MEDIA_ITEMS + 1 }, (_, index) => ({
          url: `https://example.com/checkin-${index}.jpg`,
          pathname: `rooms/fit/A/checkins/checkin-${index}.jpg`,
          contentType: "image/jpeg",
          byteSize: 1024,
        })),
      }),
    ).toThrow();
  });

  test("validates upload metadata before accepting a file", () => {
    expect(
      checkinMediaUploadRequestSchema.parse({ participant: "B" }),
    ).toEqual({
      participant: "B",
    });

    expect(() =>
      checkinMediaUploadRequestSchema.parse({ participant: "C" }),
    ).toThrow();
  });
});
