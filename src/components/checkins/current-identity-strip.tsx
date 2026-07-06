"use client";

import { Check, UserRound } from "lucide-react";

import type { Participant } from "@/domain/checkins";
import type { MemberProfile } from "@/domain/members";
import { cn } from "@/lib/utils";
import { MemberAvatar } from "./member-avatar";
import { checkinPanelClassName } from "./status-styles";

type CurrentIdentityStripProps = {
  selected: Participant | null;
  profiles: Record<Participant, MemberProfile>;
  onSelect: (participant: Participant) => void;
};

export const CurrentIdentityStrip = ({
  selected,
  profiles,
  onSelect,
}: CurrentIdentityStripProps) => (
  <section
    className={cn(
      checkinPanelClassName,
      "flex items-center justify-between gap-2 px-3 py-2.5",
    )}
  >
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <UserRound className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-tight">当前身份</p>
        <p className="truncate text-xs text-muted-foreground">
          {selected ? profiles[selected].displayName : "选择身份后记录今日打卡"}
        </p>
      </div>
    </div>

    <div className="grid shrink-0 grid-cols-2 gap-1 rounded-lg bg-muted/60 p-1">
      {(["A", "B"] as const).map((participant) => {
        const isSelected = selected === participant;

        return (
          <button
            key={participant}
            type="button"
            aria-pressed={isSelected}
            className={cn(
              "flex h-8 min-w-0 items-center gap-1 rounded-md px-1.5 text-xs font-medium transition-colors",
              isSelected
                ? "bg-background text-primary shadow-sm ring-1 ring-primary/15"
                : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
            )}
            onClick={() => onSelect(participant)}
          >
            <MemberAvatar
              profile={profiles[participant]}
              className="size-6 rounded-md border-0 text-[10px] shadow-none"
            />
            <span className="max-w-12 truncate sm:max-w-16">
              {profiles[participant].displayName}
            </span>
            {isSelected ? <Check className="size-3.5 shrink-0" /> : null}
          </button>
        );
      })}
    </div>
  </section>
);
