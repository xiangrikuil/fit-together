"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { buildMonthlyDashboard, Participant } from "@/domain/checkins";
import { MemberProfile, getDefaultMemberProfiles } from "@/domain/members";
import type { CheckinView } from "@/features/checkins/checkin-repository";
import { RoomBottomNav, type RoomTab } from "@/components/checkins/room-bottom-nav";
import {
  MeRoomPanel,
  OverviewRoomPanel,
  TodayRoomPanel,
} from "@/components/checkins/room-tab-panels";
import {
  saveRoomParticipant,
  useRoomParticipant,
} from "@/components/checkins/use-room-participant";

type RoomDashboardProps = {
  roomId: string;
  month: string;
  today: string;
  prevMonth: string;
  nextMonth: string;
  initialRecords: CheckinView[];
  initialProfiles?: Record<Participant, MemberProfile>;
  databaseConfigured: boolean;
  databaseError: string | null;
};

export const RoomDashboard = ({
  roomId,
  month,
  today,
  prevMonth,
  nextMonth,
  initialRecords,
  initialProfiles,
  databaseConfigured,
  databaseError,
}: RoomDashboardProps) => {
  const router = useRouter();
  const currentMonth = today.slice(0, 7);
  const selectedParticipant = useRoomParticipant(roomId);
  const [activeTab, setActiveTab] = useState<RoomTab>(
    month === currentMonth ? "today" : "overview",
  );
  const [optimisticRecords, setOptimisticRecords] = useState<CheckinView[]>([]);
  const [optimisticProfiles, setOptimisticProfiles] = useState<
    Partial<Record<Participant, MemberProfile>>
  >({});
  const records = useMemo(
    () => mergeRecords(initialRecords, optimisticRecords),
    [initialRecords, optimisticRecords],
  );
  const profiles = useMemo(
    () => ({
      ...getDefaultMemberProfiles(),
      ...initialProfiles,
      ...optimisticProfiles,
    }),
    [initialProfiles, optimisticProfiles],
  );

  const overviewDashboard = useMemo(
    () =>
      buildMonthlyDashboard({
        month,
        today,
        records,
      }),
    [month, records, today],
  );
  const todayDashboard = useMemo(
    () =>
      buildMonthlyDashboard({
        month: currentMonth,
        today,
        records,
      }),
    [currentMonth, records, today],
  );

  const todayRecord = selectedParticipant
    ? records.find(
        (record) =>
          record.participant === selectedParticipant && record.dateCn === today,
      ) ?? null
    : null;

  const handleSelectParticipant = (participant: Participant) => {
    saveRoomParticipant(roomId, participant);
  };

  const handleSaved = (record: CheckinView) => {
    setOptimisticRecords((currentRecords) => [
      ...currentRecords.filter(
        (currentRecord) =>
          currentRecord.participant !== record.participant ||
          currentRecord.dateCn !== record.dateCn,
      ),
      record,
    ]);
    router.refresh();
  };

  const handleProfileSaved = (profile: MemberProfile) => {
    setOptimisticProfiles((currentProfiles) => ({
      ...currentProfiles,
      [profile.participant]: profile,
    }));
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--primary),transparent_84%),transparent_30rem),linear-gradient(180deg,var(--background),color-mix(in_oklch,var(--muted),var(--background)_72%))] px-3 pt-4 pb-28 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <header className="flex items-center justify-between gap-3 px-1">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Fit Together
            </p>
            <h1 className="mt-1 truncate text-xl font-semibold tracking-tight sm:text-2xl">
              房间 {roomId}
            </h1>
          </div>
          <div className="shrink-0 rounded-md border bg-card/80 px-3 py-2 text-right text-xs shadow-sm">
            <p className="text-muted-foreground">中国时间</p>
            <p className="font-semibold text-primary">{today}</p>
          </div>
        </header>

        {!databaseConfigured || databaseError ? (
          <section className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
            {databaseError ??
              "还没有配置 DATABASE_URL。页面可以预览，但保存打卡需要 Neon Postgres 连接串。"}
          </section>
        ) : null}

        {activeTab === "today" ? (
          <TodayRoomPanel
            roomId={roomId}
            today={today}
            dashboard={todayDashboard}
            profiles={profiles}
            disabled={!databaseConfigured || Boolean(databaseError)}
            selectedParticipant={selectedParticipant}
            todayRecord={todayRecord}
            onSelectParticipant={handleSelectParticipant}
            onProfileSaved={handleProfileSaved}
            onSaved={handleSaved}
          />
        ) : null}

        {activeTab === "overview" ? (
          <OverviewRoomPanel
            dashboard={overviewDashboard}
            roomId={roomId}
            today={today}
            prevMonth={prevMonth}
            nextMonth={nextMonth}
            profiles={profiles}
          />
        ) : null}

        {activeTab === "me" ? (
          <MeRoomPanel
            roomId={roomId}
            profiles={profiles}
            disabled={!databaseConfigured || Boolean(databaseError)}
            selectedParticipant={selectedParticipant}
            onSelectParticipant={handleSelectParticipant}
            onProfileSaved={handleProfileSaved}
          />
        ) : null}
      </div>
      <RoomBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </main>
  );
};

const mergeRecords = (
  initialRecords: CheckinView[],
  optimisticRecords: CheckinView[],
) => {
  const recordsByKey = new Map<string, CheckinView>();

  for (const record of initialRecords) {
    recordsByKey.set(getRecordKey(record), record);
  }

  for (const record of optimisticRecords) {
    recordsByKey.set(getRecordKey(record), record);
  }

  return Array.from(recordsByKey.values());
};

const getRecordKey = (record: Pick<CheckinView, "participant" | "dateCn">) =>
  `${record.participant}:${record.dateCn}`;
