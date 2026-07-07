import type { CalendarStatus } from "@/domain/checkins";

export const checkinPanelClassName =
  "min-w-0 rounded-lg border border-foreground/10 bg-card/85 p-4 shadow-[0_8px_24px_rgb(15_23_42_/_0.06)] backdrop-blur";

export const checkinInsetClassName =
  "min-w-0 rounded-lg border border-foreground/10 bg-background/65";

export const statusDotClassName: Record<CalendarStatus, string> = {
  done: "bg-emerald-500",
  rest: "bg-amber-500",
  missed: "bg-rose-500",
  future: "bg-muted-foreground/45",
};

export const statusPillClassName: Record<CalendarStatus, string> = {
  done: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-100",
  rest: "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-100",
  missed: "bg-rose-100 text-rose-900 dark:bg-rose-500/15 dark:text-rose-100",
  future: "bg-muted text-muted-foreground",
};
