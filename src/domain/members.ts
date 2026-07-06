import { Participant, PARTICIPANTS } from "./checkins";

export const AVATAR_COLORS = ["blue", "green", "rose", "amber"] as const;

export type AvatarColor = (typeof AVATAR_COLORS)[number];

export type MemberProfile = {
  participant: Participant;
  displayName: string;
  avatarUrl: string | null;
  avatarColor: AvatarColor;
};

export const getDefaultMemberProfiles = (): Record<Participant, MemberProfile> => ({
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

export const mergeMemberProfiles = (
  profiles: Partial<MemberProfile>[],
): Record<Participant, MemberProfile> => {
  const mergedProfiles = getDefaultMemberProfiles();

  for (const profile of profiles) {
    if (!profile.participant) {
      continue;
    }

    mergedProfiles[profile.participant] = {
      ...mergedProfiles[profile.participant],
      ...profile,
      participant: profile.participant,
    };
  }

  return mergedProfiles;
};

export const getAvatarFallback = (
  displayName: string,
  participant: Participant,
) => {
  const normalizedName = displayName.trim();

  if (normalizedName.length === 0) {
    return participant;
  }

  return Array.from(normalizedName)[0];
};

export const isAvatarColor = (value: string): value is AvatarColor =>
  AVATAR_COLORS.includes(value as AvatarColor);

export const PARTICIPANT_LIST = PARTICIPANTS;
