import { Bed, Flame, Users, XCircle, Dumbbell } from "lucide-react";

import { MonthlyDashboard, Participant } from "@/domain/checkins";
import { MemberProfile } from "@/domain/members";
import { getCompletionRate } from "@/features/checkins/monthly-summary-metrics";
import { cn } from "@/lib/utils";
import { ParticipantAvatar } from "./member-avatar";
import { checkinInsetClassName, checkinPanelClassName } from "./status-styles";

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
  <section className={checkinPanelClassName}>
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold">月度总结</h2>
        <p className="text-sm text-muted-foreground">
          已统计 {dashboard.elapsedDates.length} 天
        </p>
      </div>
      <div className="flex items-center gap-2 rounded-md bg-accent/80 px-2 py-1 text-sm font-medium text-accent-foreground">
        <Users className="size-4 text-primary" />
        共同训练 {dashboard.commonDoneDays} 天
      </div>
    </div>

    <div className="mb-3 rounded-lg border border-primary/10 bg-primary/5 p-3">
      <div className="text-sm font-semibold">
        你们本月共同训练 {dashboard.commonDoneDays} 天
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {dashboard.commonDoneDays > 0
          ? "继续保持，让共同记录更稳定。"
          : "差一次，就能点亮共同记录。"}
      </p>
    </div>

    <div className="grid gap-3 sm:grid-cols-2">
      {(["A", "B"] as const).map((participant) => (
        <ParticipantSummary
          key={participant}
          participant={participant}
          profiles={profiles}
          elapsedDays={dashboard.elapsedDates.length}
          summary={dashboard.participants[participant]}
        />
      ))}
    </div>
  </section>
);

const ParticipantSummary = ({
  participant,
  profiles,
  elapsedDays,
  summary,
}: {
  participant: Participant;
  profiles: Record<Participant, MemberProfile>;
  elapsedDays: number;
  summary: MonthlyDashboard["participants"][Participant];
}) => {
  const completionRate = getCompletionRate({
    doneDays: summary.doneDays,
    elapsedDays,
  });

  return (
    <div className={cn(checkinInsetClassName, "p-3")}>
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

      <div className="mb-3 rounded-md bg-muted/45 p-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">本月完成率</p>
            <div className="mt-1 text-3xl font-black leading-none text-primary tabular-nums">
              {completionRate}%
            </div>
          </div>
          <p className="pb-0.5 text-right text-xs text-muted-foreground">
            打卡 {summary.doneDays} 天 / 已统计 {elapsedDays} 天
          </p>
        </div>
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-background/80"
          role="progressbar"
          aria-label={`${profiles[participant].displayName} 本月完成率`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={completionRate}
          aria-valuetext={`${completionRate}%`}
        >
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${completionRate}%` }}
          />
        </div>
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
};
