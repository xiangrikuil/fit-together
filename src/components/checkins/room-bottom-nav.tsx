"use client";

import {
  CalendarCheck,
  ChartColumnBig,
  type LucideIcon,
  UserRound,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type RoomTab = "today" | "overview" | "me";

type RoomBottomNavProps = {
  activeTab: RoomTab;
  onTabChange: (tab: RoomTab) => void;
};

const tabs: Array<{
  value: RoomTab;
  label: string;
  Icon: LucideIcon;
}> = [
  { value: "today", label: "今日", Icon: CalendarCheck },
  { value: "overview", label: "总览", Icon: ChartColumnBig },
  { value: "me", label: "我的", Icon: UserRound },
];

export const RoomBottomNav = ({
  activeTab,
  onTabChange,
}: RoomBottomNavProps) => (
  <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 px-3 pt-2 pb-[max(env(safe-area-inset-bottom),0.75rem)] backdrop-blur">
    <div className="mx-auto grid h-16 max-w-md grid-cols-3 gap-1 rounded-lg border bg-card p-1 shadow-lg">
      {tabs.map(({ value, label, Icon }) => {
        const isActive = activeTab === value;

        return (
          <button
            key={value}
            type="button"
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex min-w-0 flex-col items-center justify-center gap-1 rounded-md px-2 text-xs font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            onClick={() => onTabChange(value)}
          >
            <Icon className="size-5 shrink-0" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  </nav>
);
