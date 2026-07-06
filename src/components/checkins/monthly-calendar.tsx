import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { CalendarStatus, MonthlyDashboard, Participant } from "@/domain/checkins";
import { MemberProfile } from "@/domain/members";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/components/checkins/labels";
import { ParticipantAvatar } from "./member-avatar";
import {
  checkinPanelClassName,
  statusDotClassName,
} from "./status-styles";

type MonthlyCalendarProps = {
  dashboard: MonthlyDashboard;
  roomId: string;
  today: string;
  prevMonth: string;
  nextMonth: string;
  profiles: Record<Participant, MemberProfile>;
};

const weekdays = ["一", "二", "三", "四", "五", "六", "日"];

export const MonthlyCalendar = ({
  dashboard,
  roomId,
  today,
  prevMonth,
  nextMonth,
  profiles,
}: MonthlyCalendarProps) => {
  const leadingEmptyCells = getMondayStartOffset(dashboard.dates[0]);

  return (
    <section className={checkinPanelClassName}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <CalendarDays className="size-4 text-primary" />
            {dashboard.month} 月历
          </h2>
          <p className="text-sm text-muted-foreground">A/B 每日状态对照</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/room/${roomId}?month=${prevMonth}`}
            className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
            title="上个月"
          >
            <ChevronLeft className="size-4" />
          </Link>
          <Link
            href={`/room/${roomId}?month=${nextMonth}`}
            className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
            title="下个月"
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        {(["done", "rest", "missed", "future"] as const).map((status) => (
          <div key={status} className="flex items-center gap-1.5">
            <span className={cn("size-2 rounded-full", statusDotClassName[status])} />
            {STATUS_LABELS[status]}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
        {weekdays.map((weekday) => (
          <div key={weekday} className="py-1">
            {weekday}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: leadingEmptyCells }, (_, index) => (
          <div key={`empty-${index}`} />
        ))}
        {dashboard.dates.map((date) => (
          <DayCell
            key={date}
            date={date}
            today={today}
            profiles={profiles}
            statuses={dashboard.days[date]}
          />
        ))}
      </div>
    </section>
  );
};

const DayCell = ({
  date,
  today,
  statuses,
  profiles,
}: {
  date: string;
  today: string;
  statuses: Record<Participant, CalendarStatus>;
  profiles: Record<Participant, MemberProfile>;
}) => (
  <div
    className={cn(
      "min-h-[4.25rem] rounded-md border border-foreground/5 bg-background/35 p-1 text-left transition-colors sm:min-h-24 sm:p-1.5",
      date === today && "border-primary/50 bg-primary/5 ring-2 ring-primary/15",
    )}
    aria-label={`${date}，A ${STATUS_LABELS[statuses.A]}，B ${STATUS_LABELS[statuses.B]}`}
  >
    <div className="mb-1.5 text-xs font-semibold tabular-nums">
      {Number(date.slice(8, 10))}
    </div>
    <div className="space-y-0.5">
      {(["A", "B"] as const).map((participant) => (
        <CompactStatus
          key={participant}
          participant={participant}
          profiles={profiles}
          status={statuses[participant]}
        />
      ))}
    </div>
  </div>
);

const CompactStatus = ({
  participant,
  profiles,
  status,
}: {
  participant: Participant;
  profiles: Record<Participant, MemberProfile>;
  status: CalendarStatus;
}) => (
  <div
    className={cn(
      "flex h-5 items-center gap-1 rounded-sm px-0.5 text-[10px] text-muted-foreground sm:h-6 sm:bg-card/55 sm:px-1 sm:text-[11px]",
      status === "future" && "opacity-60",
    )}
    title={`${profiles[participant].displayName}: ${STATUS_LABELS[status]}`}
  >
    <ParticipantAvatar
      participant={participant}
      profiles={profiles}
      className="size-4 rounded-sm border-0 text-[9px] shadow-none"
    />
    <span className={cn("size-1.5 rounded-full", statusDotClassName[status])} />
    <span className="hidden sm:inline">{STATUS_LABELS[status]}</span>
  </div>
);

const getMondayStartOffset = (date: string) => {
  const day = new Date(`${date}T00:00:00.000Z`).getUTCDay();
  return (day + 6) % 7;
};
