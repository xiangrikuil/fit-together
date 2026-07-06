import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DURATION_STEP_MINUTES,
  MAX_DURATION_MINUTES,
  MIN_DURATION_MINUTES,
  adjustDurationMinutes,
} from "@/features/checkins/duration-stepper";

type DurationStepperControlProps = {
  value: number;
  disabled: boolean;
  onChange: (durationMinutes: number) => void;
};

export const DurationStepperControl = ({
  value,
  disabled,
  onChange,
}: DurationStepperControlProps) => {
  const decreaseDisabled = disabled || value <= MIN_DURATION_MINUTES;
  const increaseDisabled = disabled || value >= MAX_DURATION_MINUTES;

  const handleAdjust = (steps: number) => {
    onChange(adjustDurationMinutes(value, steps));
  };

  return (
    <div className="space-y-2">
      <Label id="duration-stepper-label">时长</Label>
      <div
        role="group"
        aria-labelledby="duration-stepper-label"
        className="grid h-11 grid-cols-[2.75rem_1fr_2.75rem] items-center rounded-lg border border-input bg-background/75 p-1 shadow-inner shadow-foreground/5"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={decreaseDisabled}
          aria-label={`减少 ${DURATION_STEP_MINUTES} 分钟`}
          className="size-9 rounded-md"
          onClick={() => handleAdjust(-1)}
        >
          <Minus className="size-4" />
        </Button>
        <div className="min-w-0 text-center leading-none">
          <div className="text-lg font-black tabular-nums text-foreground">
            {value}
          </div>
          <div className="mt-0.5 text-[11px] font-medium text-muted-foreground">
            分钟
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={increaseDisabled}
          aria-label={`增加 ${DURATION_STEP_MINUTES} 分钟`}
          className="size-9 rounded-md"
          onClick={() => handleAdjust(1)}
        >
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
};
