const CHINA_TIME_ZONE = "Asia/Shanghai";
const EDITED_MARKER_THRESHOLD_MS = 60_000;

const chinaClockFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: CHINA_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

type ActivityTimestampInput = {
  dateCn: string;
  createdAt: string;
  today: string;
};

type EditedClockInput = {
  createdAt: string;
  updatedAt: string;
};

export const formatCheckinClockTime = (timestamp: string) =>
  chinaClockFormatter.format(new Date(timestamp));

export const formatCheckinActivityTimestamp = ({
  dateCn,
  createdAt,
  today,
}: ActivityTimestampInput) => {
  const clockTime = formatCheckinClockTime(createdAt);

  if (dateCn === today) {
    return `今天 ${clockTime}`;
  }

  const year = Number(dateCn.slice(0, 4));
  const month = Number(dateCn.slice(5, 7));
  const day = Number(dateCn.slice(8, 10));

  if (dateCn.slice(0, 4) === today.slice(0, 4)) {
    return `${month} 月 ${day} 日 ${clockTime}`;
  }

  return `${year} 年 ${month} 月 ${day} 日 ${clockTime}`;
};

export const getCheckinEditedClockTime = ({
  createdAt,
  updatedAt,
}: EditedClockInput) => {
  const editedAfterMs =
    new Date(updatedAt).getTime() - new Date(createdAt).getTime();

  if (editedAfterMs <= EDITED_MARKER_THRESHOLD_MS) {
    return null;
  }

  return formatCheckinClockTime(updatedAt);
};
