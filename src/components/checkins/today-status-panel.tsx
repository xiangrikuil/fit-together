import { CheckCircle2, Clock3 } from "lucide-react";

import type {
  CalendarStatus,
  MonthlyDashboard,
  Participant,
} from "@/domain/checkins";
import type { MemberProfile } from "@/domain/members";
import type { CheckinView } from "@/features/checkins/checkin-repository";
import { cn } from "@/lib/utils";
import { MemberAvatar } from "./member-avatar";
import {
  checkinInsetClassName,
  checkinPanelClassName,
  statusDotClassName,
  statusPillClassName,
} from "./status-styles";
import { getTodayStatusDetail } from "./today-status-detail";

type TodayStatusPanelProps = {
  dashboard: MonthlyDashboard;
  today: string;
  profiles: Record<Participant, MemberProfile>;
  selectedParticipant: Participant | null;
  todayRecords: Partial<Record<Participant, CheckinView>>;
};

const todayStatusLabels: Record<CalendarStatus, string> = {
  done: "已训练",
  rest: "已休息",
  missed: "未打卡",
  future: "未到",
};

export const TodayStatusPanel = ({
  dashboard,
  today,
  profiles,
  selectedParticipant,
  todayRecords,
}: TodayStatusPanelProps) => {
  const todayStatuses = dashboard.days[today] ?? {
    A: "future",
    B: "future",
  };
  const recordedCount = (["A", "B"] as const).filter(
    (participant) =>
      todayStatuses[participant] === "done" ||
      todayStatuses[participant] === "rest",
  ).length;

  return (
    <section className={checkinPanelClassName}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <CheckCircle2 className="size-4 text-primary" />
            今日状态
          </h2>
          <p className="text-sm text-muted-foreground">
            中国时间 {today}，已记录 {recordedCount}/2
          </p>
        </div>
        <div className="rounded-md bg-accent/80 px-2 py-1 text-xs font-medium text-accent-foreground">
          00:00-24:00
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {(["A", "B"] as const).map((participant) => (
          <MemberTodayStatus
            key={participant}
            participant={participant}
            profile={profiles[participant]}
            status={todayStatuses[participant]}
            record={todayRecords[participant] ?? null}
            isSelected={selectedParticipant === participant}
          />
        ))}
      </div>
    </section>
  );
};

const MemberTodayStatus = ({
  participant,
  profile,
  status,
  record,
  isSelected,
}: {
  participant: Participant;
  profile: MemberProfile;
  status: CalendarStatus;
  record: CheckinView | null;
  isSelected: boolean;
}) => {
  const detail = getTodayStatusDetail({ status, record });

  return (
    <div
      className={cn(
        checkinInsetClassName,
        "min-w-0 p-3 transition-colors",
        isSelected && "border-primary ring-2 ring-primary/15",
      )}
    >
      <div className="mb-3 flex min-w-0 items-center gap-2">
        <MemberAvatar profile={profile} className="size-9 rounded-md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{profile.displayName}</p>
          <p className="text-xs text-muted-foreground">身份 {participant}</p>
        </div>
      </div>
      <div
        className={cn(
          "flex items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium",
          statusPillClassName[status],
        )}
      >
        <span className="flex items-center gap-1.5">
          <span
            className={cn("size-2 rounded-full", statusDotClassName[status])}
          />
          {todayStatusLabels[status]}
        </span>
        <Clock3 className="size-3" />
      </div>
      <p className="mt-2 truncate text-xs text-muted-foreground">{detail}</p>
    </div>
  );
};
