import { Participant } from "@/domain/checkins";
import {
  AvatarColor,
  MemberProfile,
  getAvatarFallback,
} from "@/domain/members";
import { cn } from "@/lib/utils";

type MemberAvatarProps = {
  profile: MemberProfile;
  className?: string;
};

export const MemberAvatar = ({ profile, className }: MemberAvatarProps) => (
  <div
    className={cn(
      "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border text-sm font-semibold shadow-sm",
      avatarColorClassName[profile.avatarColor],
      className,
    )}
  >
    {profile.avatarUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profile.avatarUrl}
        alt={`${profile.displayName} 头像`}
        className="size-full object-cover"
      />
    ) : (
      getAvatarFallback(profile.displayName, profile.participant)
    )}
  </div>
);

export const ParticipantAvatar = ({
  participant,
  profiles,
  className,
}: {
  participant: Participant;
  profiles: Record<Participant, MemberProfile>;
  className?: string;
}) => <MemberAvatar profile={profiles[participant]} className={className} />;

export const avatarColorClassName: Record<AvatarColor, string> = {
  blue: "border-blue-300 bg-blue-100 text-blue-950 dark:border-blue-400/30 dark:bg-blue-400/15 dark:text-blue-100",
  green:
    "border-emerald-300 bg-emerald-100 text-emerald-950 dark:border-emerald-400/30 dark:bg-emerald-400/15 dark:text-emerald-100",
  rose: "border-rose-300 bg-rose-100 text-rose-950 dark:border-rose-400/30 dark:bg-rose-400/15 dark:text-rose-100",
  amber:
    "border-amber-300 bg-amber-100 text-amber-950 dark:border-amber-400/30 dark:bg-amber-400/15 dark:text-amber-100",
};
