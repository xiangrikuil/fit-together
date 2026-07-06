import type { MonthlyDashboard, Participant } from "@/domain/checkins";
import type { MemberProfile } from "@/domain/members";
import type { CheckinView } from "@/features/checkins/checkin-repository";
import { IdentitySwitcher } from "@/components/checkins/identity-switcher";
import { MonthlyCalendar } from "@/components/checkins/monthly-calendar";
import { MonthlySummary } from "@/components/checkins/monthly-summary";
import { RecentOverview } from "@/components/checkins/recent-overview";
import { TodayCheckinForm } from "@/components/checkins/today-checkin-form";
import { TodayStatusPanel } from "@/components/checkins/today-status-panel";

type RoomPanelSharedProps = {
  roomId: string;
  profiles: Record<Participant, MemberProfile>;
  disabled: boolean;
  selectedParticipant: Participant | null;
  onSelectParticipant: (participant: Participant) => void;
  onProfileSaved: (profile: MemberProfile) => void;
};

type TodayRoomPanelProps = RoomPanelSharedProps & {
  today: string;
  dashboard: MonthlyDashboard;
  todayRecord: CheckinView | null;
  onSaved: (record: CheckinView) => void;
};

type OverviewRoomPanelProps = {
  dashboard: MonthlyDashboard;
  roomId: string;
  today: string;
  prevMonth: string;
  nextMonth: string;
  profiles: Record<Participant, MemberProfile>;
};

export const TodayRoomPanel = ({
  roomId,
  today,
  dashboard,
  profiles,
  disabled,
  selectedParticipant,
  todayRecord,
  onSelectParticipant,
  onProfileSaved,
  onSaved,
}: TodayRoomPanelProps) => (
  <section className="mx-auto w-full max-w-xl space-y-4">
    <TodayStatusPanel
      dashboard={dashboard}
      today={today}
      profiles={profiles}
      selectedParticipant={selectedParticipant}
    />
    <IdentitySwitcher
      roomId={roomId}
      selected={selectedParticipant}
      profiles={profiles}
      disabled={disabled}
      showProfileForm={false}
      onSelect={onSelectParticipant}
      onProfileSaved={onProfileSaved}
    />
    <TodayCheckinForm
      key={`${selectedParticipant ?? "none"}-${today}-${todayRecordKey(
        todayRecord,
      )}`}
      roomId={roomId}
      today={today}
      selectedParticipant={selectedParticipant}
      record={todayRecord}
      disabled={disabled}
      onSaved={onSaved}
    />
    <RecentOverview dashboard={dashboard} profiles={profiles} />
  </section>
);

export const OverviewRoomPanel = ({
  dashboard,
  roomId,
  today,
  prevMonth,
  nextMonth,
  profiles,
}: OverviewRoomPanelProps) => (
  <section className="space-y-4">
    <MonthlySummary dashboard={dashboard} profiles={profiles} />
    <MonthlyCalendar
      dashboard={dashboard}
      roomId={roomId}
      today={today}
      prevMonth={prevMonth}
      nextMonth={nextMonth}
      profiles={profiles}
    />
  </section>
);

export const MeRoomPanel = ({
  roomId,
  profiles,
  disabled,
  selectedParticipant,
  onSelectParticipant,
  onProfileSaved,
}: RoomPanelSharedProps) => (
  <section className="mx-auto w-full max-w-xl space-y-4">
    <IdentitySwitcher
      roomId={roomId}
      selected={selectedParticipant}
      profiles={profiles}
      disabled={disabled}
      onSelect={onSelectParticipant}
      onProfileSaved={onProfileSaved}
    />
  </section>
);

const todayRecordKey = (record: CheckinView | null) => {
  if (!record) {
    return "empty";
  }

  return `${record.status}-${record.workoutType ?? "none"}-${
    record.durationMinutes ?? "none"
  }-${record.note}`;
};
