export const PARTICIPANTS = ["A", "B"] as const;
export const CHECKIN_STATUSES = ["done", "rest"] as const;
export const WORKOUT_TYPES = [
  "strength",
  "cardio",
  "mobility",
  "sport",
  "other",
] as const;

export type Participant = (typeof PARTICIPANTS)[number];
export type CheckinStatus = (typeof CHECKIN_STATUSES)[number];
export type WorkoutType = (typeof WORKOUT_TYPES)[number];
export type CalendarStatus = CheckinStatus | "missed" | "future";

export type CheckinRecord = {
  participant: Participant;
  dateCn: string;
  status: CheckinStatus;
};

export type ParticipantSummary = {
  doneDays: number;
  restDays: number;
  missedDays: number;
  currentStreak: number;
};

export type MonthlyDashboard = {
  month: string;
  dates: string[];
  elapsedDates: string[];
  commonDoneDays: number;
  days: Record<string, Record<Participant, CalendarStatus>>;
  participants: Record<Participant, ParticipantSummary>;
};

type BuildMonthlyDashboardInput = {
  month: string;
  today: string;
  records: CheckinRecord[];
};

const chinaDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export const formatChinaDate = (date = new Date()) => chinaDateFormatter.format(date);

export const getChinaMonth = (date = new Date()) => formatChinaDate(date).slice(0, 7);

export const getMonthDates = (month: string) => {
  const [year, monthNumber] = parseMonth(month);
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();

  return Array.from({ length: daysInMonth }, (_, index) =>
    toDateCn(year, monthNumber, index + 1),
  );
};

export const addMonths = (month: string, offset: number) => {
  const [year, monthNumber] = parseMonth(month);
  const date = new Date(Date.UTC(year, monthNumber - 1 + offset, 1));
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}`;
};

export const getRecentDashboardDates = (
  dashboard: Pick<MonthlyDashboard, "elapsedDates">,
  limit = 7,
) => dashboard.elapsedDates.slice(-limit);

export const buildMonthlyDashboard = ({
  month,
  today,
  records,
}: BuildMonthlyDashboardInput): MonthlyDashboard => {
  const dates = getMonthDates(month);
  const elapsedDates = getElapsedDates(dates, month, today);
  const recordsByKey = new Map(
    records.map((record) => [
      `${record.participant}:${record.dateCn}`,
      record.status,
    ]),
  );

  const days = Object.fromEntries(
    dates.map((date) => [
      date,
      {
        A: getCalendarStatus("A", date, elapsedDates, recordsByKey),
        B: getCalendarStatus("B", date, elapsedDates, recordsByKey),
      },
    ]),
  ) as MonthlyDashboard["days"];

  return {
    month,
    dates,
    elapsedDates,
    commonDoneDays: elapsedDates.filter(
      (date) => days[date].A === "done" && days[date].B === "done",
    ).length,
    days,
    participants: {
      A: summarizeParticipant("A", elapsedDates, days),
      B: summarizeParticipant("B", elapsedDates, days),
    },
  };
};

const summarizeParticipant = (
  participant: Participant,
  elapsedDates: string[],
  days: MonthlyDashboard["days"],
): ParticipantSummary => ({
  doneDays: elapsedDates.filter((date) => days[date][participant] === "done")
    .length,
  restDays: elapsedDates.filter((date) => days[date][participant] === "rest")
    .length,
  missedDays: elapsedDates.filter((date) => days[date][participant] === "missed")
    .length,
  currentStreak: countCurrentStreak(participant, elapsedDates, days),
});

const countCurrentStreak = (
  participant: Participant,
  elapsedDates: string[],
  days: MonthlyDashboard["days"],
) => {
  let streak = 0;

  for (let index = elapsedDates.length - 1; index >= 0; index -= 1) {
    if (days[elapsedDates[index]][participant] !== "done") {
      return streak;
    }

    streak += 1;
  }

  return streak;
};

const getCalendarStatus = (
  participant: Participant,
  date: string,
  elapsedDates: string[],
  recordsByKey: Map<string, CheckinStatus>,
): CalendarStatus => {
  if (!elapsedDates.includes(date)) {
    return "future";
  }

  return recordsByKey.get(`${participant}:${date}`) ?? "missed";
};

const getElapsedDates = (dates: string[], month: string, today: string) => {
  const todayMonth = today.slice(0, 7);

  if (month > todayMonth) {
    return [];
  }

  if (month < todayMonth) {
    return dates;
  }

  return dates.filter((date) => date <= today);
};

const parseMonth = (month: string): [number, number] => {
  const [yearText, monthText] = month.split("-");
  const year = Number(yearText);
  const monthNumber = Number(monthText);

  if (!Number.isInteger(year) || !Number.isInteger(monthNumber)) {
    throw new Error(`Invalid month: ${month}`);
  }

  if (monthNumber < 1 || monthNumber > 12) {
    throw new Error(`Invalid month: ${month}`);
  }

  return [year, monthNumber];
};

const toDateCn = (year: number, month: number, day: number) =>
  `${year}-${pad2(month)}-${pad2(day)}`;

const pad2 = (value: number) => value.toString().padStart(2, "0");
