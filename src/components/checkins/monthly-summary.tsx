import { Bed, Flame, Users, XCircle, Dumbbell } from "lucide-react";

import { MonthlyDashboard, Participant } from "@/domain/checkins";
import { MemberProfile } from "@/domain/members";
import { ParticipantAvatar } from "./member-avatar";

type MonthlySummaryProps = {
  dashboard: MonthlyDashboard;
  profiles: Record<Participant, MemberProfile>;
};

const metricIcons = {
  doneDays: Dumbbell,
  restDays: Bed,
  missedDays: XCircle,
  currentStreak: Flame,
} as const;

const metricLabels = {
  doneDays: "打卡",
  restDays: "休息",
  missedDays: "缺卡",
  currentStreak: "连续",
} as const;

export const MonthlySummary = ({ dashboard, profiles }: MonthlySummaryProps) => (
  <section className="rounded-lg border bg-card/90 p-4 shadow-sm">
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold">月度总结</h2>
        <p className="text-sm text-muted-foreground">
          已统计 {dashboard.elapsedDates.length} 天
        </p>
      </div>
      <div className="flex items-center gap-2 rounded-md bg-accent px-2 py-1 text-sm font-medium">
        <Users className="size-4 text-primary" />
        共同 {dashboard.commonDoneDays} 天
      </div>
    </div>

    <div className="grid gap-3 sm:grid-cols-2">
      {(["A", "B"] as const).map((participant) => (
        <ParticipantSummary
          key={participant}
          participant={participant}
          profiles={profiles}
          summary={dashboard.participants[participant]}
        />
      ))}
    </div>
  </section>
);

const ParticipantSummary = ({
  participant,
  profiles,
  summary,
}: {
  participant: Participant;
  profiles: Record<Participant, MemberProfile>;
  summary: MonthlyDashboard["participants"][Participant];
}) => (
  <div className="rounded-lg border bg-background/70 p-3">
    <div className="mb-3 flex items-center justify-between">
      <span className="flex min-w-0 items-center gap-2 text-sm font-semibold">
        <ParticipantAvatar
          participant={participant}
          profiles={profiles}
          className="size-7 rounded-md"
        />
        <span className="truncate">{profiles[participant].displayName}</span>
      </span>
      <span className="text-xs text-muted-foreground">本月</span>
    </div>
    <div className="grid grid-cols-2 gap-2">
      {Object.entries(metricLabels).map(([key, label]) => {
        const metricKey = key as keyof typeof metricLabels;
        const Icon = metricIcons[metricKey];

        return (
          <div key={key} className="rounded-md bg-muted/60 p-2">
            <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Icon className="size-3" />
              {label}
            </div>
            <div className="text-xl font-semibold leading-none">
              {summary[metricKey]}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
