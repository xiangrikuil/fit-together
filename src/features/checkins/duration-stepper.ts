export const DEFAULT_DURATION_MINUTES = 60;
export const DURATION_STEP_MINUTES = 15;
export const MIN_DURATION_MINUTES = 0;
export const MAX_DURATION_MINUTES = 1440;

export const normalizeDurationMinutes = (duration: number | null | undefined) =>
  Math.min(
    MAX_DURATION_MINUTES,
    Math.max(MIN_DURATION_MINUTES, duration ?? DEFAULT_DURATION_MINUTES),
  );

export const adjustDurationMinutes = (duration: number, steps: number) =>
  normalizeDurationMinutes(duration + steps * DURATION_STEP_MINUTES);
