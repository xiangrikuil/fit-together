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
import { statusDotClassName } from "./status-styles";

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
    <section className="rounded-lg border bg-card/90 p-4 shadow-sm">
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
        <div className="grid grid-cols-7 gap-1">
          {dates.map((date) => (
            <RecentDay
              key={date}
              date={date}
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
  profiles,
  statuses,
}: {
  date: string;
  profiles: Record<Participant, MemberProfile>;
  statuses: Record<Participant, CalendarStatus>;
}) => (
  <div className="min-w-0 rounded-md border bg-background/70 p-1.5 text-center">
    <div className="mb-2 text-[10px] font-semibold leading-none text-muted-foreground">
      {Number(date.slice(8, 10))}
    </div>
    <div className="space-y-1">
      {(["A", "B"] as const).map((participant) => (
        <div
          key={participant}
          className="flex items-center justify-center gap-1"
          title={`${profiles[participant].displayName}: ${
            STATUS_LABELS[statuses[participant]]
          }`}
        >
          <ParticipantAvatar
            participant={participant}
            profiles={profiles}
            className="size-4 rounded-sm border-0 text-[8px] shadow-none"
          />
          <span
            className={cn(
              "size-1.5 rounded-full",
              statusDotClassName[statuses[participant]],
            )}
          />
        </div>
      ))}
    </div>
  </div>
);
