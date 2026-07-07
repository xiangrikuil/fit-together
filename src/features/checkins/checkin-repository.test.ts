import { beforeEach, describe, expect, test, vi } from "vitest";

import type { CheckinView } from "./checkin-repository";

vi.mock("@/db/client", () => ({
  getDb: vi.fn(),
}));

import { getDb } from "@/db/client";
import { upsertTodayCheckin } from "./checkin-repository";

const getMockedDb = vi.mocked(getDb);

describe("check-in repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("replaces check-in media inside the same transaction as the check-in upsert", async () => {
    const row = createCheckinRow();
    const returning = vi.fn(async () => [row]);
    const onConflictDoUpdate = vi.fn(() => ({ returning }));
    const checkinValues = vi.fn(() => ({ onConflictDoUpdate }));
    const deleteWhere = vi.fn(async () => undefined);
    const mediaValues = vi.fn(async () => undefined);
    let transactionInsertCount = 0;
    const tx = {
      insert: vi.fn(() => {
        transactionInsertCount += 1;

        if (transactionInsertCount === 1) {
          return { values: checkinValues };
        }

        return { values: mediaValues };
      }),
      delete: vi.fn(() => ({ where: deleteWhere })),
    };
    const db = {
      transaction: vi.fn(async (callback) => callback(tx)),
      insert: vi.fn(() => {
        throw new Error("insert should run inside a transaction");
      }),
      delete: vi.fn(() => {
        throw new Error("delete should run inside a transaction");
      }),
    };
    getMockedDb.mockReturnValue(db as never);

    const result = await upsertTodayCheckin({
      roomId: "fit-together",
      participant: "A",
      dateCn: "2026-07-07",
      status: "done",
      workoutType: "strength",
      durationMinutes: 60,
      note: "5x5",
      media: [
        {
          url: "https://example.com/checkin.jpg",
          pathname: "rooms/fit-together/A/checkins/checkin.jpg",
          contentType: "image/jpeg",
          byteSize: 1024,
        },
      ],
    });

    expect(db.transaction).toHaveBeenCalledTimes(1);
    expect(db.insert).not.toHaveBeenCalled();
    expect(db.delete).not.toHaveBeenCalled();
    expect(tx.delete).toHaveBeenCalledTimes(1);
    expect(mediaValues).toHaveBeenCalledWith([
      expect.objectContaining({
        checkinId: row.id,
        pathname: "rooms/fit-together/A/checkins/checkin.jpg",
        sortOrder: 0,
      }),
    ]);
    expect(result).toMatchObject<Partial<CheckinView>>({
      participant: "A",
      dateCn: "2026-07-07",
      media: [
        expect.objectContaining({
          pathname: "rooms/fit-together/A/checkins/checkin.jpg",
          sortOrder: 0,
        }),
      ],
    });
  });
});

const createCheckinRow = () => ({
  id: "11111111-1111-4111-8111-111111111111",
  roomId: "fit-together",
  participant: "A" as const,
  dateCn: "2026-07-07",
  status: "done" as const,
  workoutType: "strength" as const,
  durationMinutes: 60,
  note: "5x5",
  createdAt: new Date("2026-07-07T12:00:00.000Z"),
  updatedAt: new Date("2026-07-07T12:00:00.000Z"),
});
