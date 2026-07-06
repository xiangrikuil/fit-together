export const getCompletionRate = ({
  doneDays,
  elapsedDays,
}: {
  doneDays: number;
  elapsedDays: number;
}) => {
  if (elapsedDays <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((doneDays / elapsedDays) * 100));
};
