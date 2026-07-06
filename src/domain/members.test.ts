import { describe, expect, test } from "vitest";

import {
  getAvatarFallback,
  getDefaultMemberProfiles,
  mergeMemberProfiles,
} from "./members";

describe("member profiles", () => {
  test("provides stable defaults for both participants", () => {
    expect(getDefaultMemberProfiles()).toEqual({
      A: {
        participant: "A",
        displayName: "身份 A",
        avatarUrl: null,
        avatarColor: "blue",
      },
      B: {
        participant: "B",
        displayName: "身份 B",
        avatarUrl: null,
        avatarColor: "green",
      },
    });
  });

  test("merges saved profiles without losing missing participant defaults", () => {
    const profiles = mergeMemberProfiles([
      {
        participant: "A",
        displayName: "LJ",
        avatarUrl: "https://blob.example/avatar.webp",
        avatarColor: "rose",
      },
    ]);

    expect(profiles.A).toMatchObject({
      displayName: "LJ",
      avatarUrl: "https://blob.example/avatar.webp",
      avatarColor: "rose",
    });
    expect(profiles.B.displayName).toBe("身份 B");
  });

  test("uses the first visible character as avatar fallback", () => {
    expect(getAvatarFallback("  小李  ", "A")).toBe("小");
    expect(getAvatarFallback("", "B")).toBe("B");
  });
});
