import { Activity } from "lucide-react";

import {
  getRecentDashboardDates,
  type CalendarStatus,
  type MonthlyDashboard,
  type Participant,
} from "@/domain/checkins";
import type { MemberProfile } from "@/domain/members";
import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "./labels";
import { ParticipantAvatar } from "./member-avatar";
import {
  checkinPanelClassName,
  statusDotClassName,
} from "./status-styles";

type RecentOverviewProps = {
  dashboard: MonthlyDashboard;
  profiles: Record<Participant, MemberProfile>;
};

export const RecentOverview = ({
  dashboard,
  profiles,
}: RecentOverviewProps) => {
  const dates = getRecentDashboardDates(dashboard);

  return (
    <section className={checkinPanelClassName}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Activity className="size-4 text-primary" />
            近 7 天
          </h2>
          <p className="text-sm text-muted-foreground">A/B 每日状态</p>
        </div>
      </div>

      {dates.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-foreground/5 bg-background/35">
          {dates.map((date, index) => (
            <RecentDay
              key={date}
              date={date}
              isLast={index === dates.length - 1}
              profiles={profiles}
              statuses={dashboard.days[date]}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-md bg-muted/70 px-3 py-6 text-center text-sm text-muted-foreground">
          暂无记录
        </div>
      )}
    </section>
  );
};

const RecentDay = ({
  date,
  isLast,
  profiles,
  statuses,
}: {
  date: string;
  isLast: boolean;
  profiles: Record<Participant, MemberProfile>;
  statuses: Record<Participant, CalendarStatus>;
}) => (
  <div
    className={cn(
      "grid grid-cols-[2.5rem_1fr] items-center gap-2 px-2 py-2",
      !isLast && "border-b border-foreground/5",
    )}
  >
    <div className="text-center">
      <div className="text-sm font-bold leading-none tabular-nums">
        {Number(date.slice(8, 10))}
      </div>
      <div className="mt-0.5 text-[10px] text-muted-foreground">日</div>
    </div>
    <div className="grid min-w-0 grid-cols-2 gap-2">
      {(["A", "B"] as const).map((participant) => (
        <RecentParticipantStatus
          key={participant}
          participant={participant}
          profiles={profiles}
          status={statuses[participant]}
        />
      ))}
    </div>
  </div>
);

const RecentParticipantStatus = ({
  participant,
  profiles,
  status,
}: {
  participant: Participant;
  profiles: Record<Participant, MemberProfile>;
  status: CalendarStatus;
}) => (
  <div
    className="flex h-7 min-w-0 items-center gap-1.5 rounded-md bg-card/55 px-1.5 text-xs text-muted-foreground"
    title={`${profiles[participant].displayName}: ${STATUS_LABELS[status]}`}
  >
    <ParticipantAvatar
      participant={participant}
      profiles={profiles}
      className="size-5 rounded-sm border-0 text-[9px] shadow-none"
    />
    <span className={cn("size-1.5 rounded-full", statusDotClassName[status])} />
    <span className="min-w-0 truncate">{STATUS_LABELS[status]}</span>
  </div>
);
