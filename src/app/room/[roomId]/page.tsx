import { notFound } from "next/navigation";

import {
  addMonths,
  formatChinaDate,
  Participant,
} from "@/domain/checkins";
import { getDefaultMemberProfiles, MemberProfile } from "@/domain/members";
import { isDatabaseConfigured } from "@/db/client";
import {
  CheckinView,
  getRoomMonthCheckins,
} from "@/features/checkins/checkin-repository";
import { getRoomMemberProfiles } from "@/features/members/member-repository";
import {
  monthSchema,
  roomIdSchema,
} from "@/features/checkins/checkin-validation";
import { RoomDashboard } from "./room-dashboard";

export const dynamic = "force-dynamic";

type RoomPageProps = {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ month?: string }>;
};

export default async function RoomPage({
  params,
  searchParams,
}: RoomPageProps) {
  const { roomId } = await params;
  const safeRoomId = roomIdSchema.safeParse(roomId);

  if (!safeRoomId.success) {
    notFound();
  }

  const today = formatChinaDate();
  const currentMonth = today.slice(0, 7);
  const query = await searchParams;
  const month = monthSchema.safeParse(query.month).success
    ? query.month!
    : currentMonth;
  const databaseConfigured = isDatabaseConfigured();
  let databaseError: string | null = null;
  let records: CheckinView[] = [];
  let profiles: Record<Participant, MemberProfile> = getDefaultMemberProfiles();

  if (databaseConfigured) {
    try {
      const recordMonths = Array.from(new Set([month, currentMonth]));
      const [roomRecordsByMonth, roomProfiles] = await Promise.all([
        Promise.all(
          recordMonths.map((recordMonth) =>
            getRoomMonthCheckins(safeRoomId.data, recordMonth),
          ),
        ),
        getRoomMemberProfiles(safeRoomId.data),
      ]);
      records = roomRecordsByMonth.flat();
      profiles = roomProfiles;
    } catch {
      databaseError = "数据库连接失败，请检查 Neon DATABASE_URL 和迁移状态。";
    }
  }

  return (
    <RoomDashboard
      roomId={safeRoomId.data}
      month={month}
      today={today}
      prevMonth={addMonths(month, -1)}
      nextMonth={addMonths(month, 1)}
      initialRecords={records}
      initialProfiles={profiles}
      databaseConfigured={databaseConfigured}
      databaseError={databaseError}
    />
  );
}
