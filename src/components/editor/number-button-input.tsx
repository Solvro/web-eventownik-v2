import { Minus, Plus } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface NumberButtonInputProps extends Omit<
  React.ComponentProps<typeof Input>,
  "onChange"
> {
  onChange: (value: string) => void;
}

// Values in ms
const INITIAL_DELAY = 500;
const REPEAT_INTERVAL = 100;
const ACCELERATION_THRESHOLD = 2000;
const FAST_INTERVAL = 30;

function NumberButtonInput({ onChange, name, value }: NumberButtonInputProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdStartRef = useRef<number>(0);
  const fastIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep a ref in sync with the latest value so interval callbacks never go stale
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
    }
    if (fastIntervalRef.current !== null) {
      clearInterval(fastIntervalRef.current);
    }
    timeoutRef.current = null;
    intervalRef.current = null;
    fastIntervalRef.current = null;
  }, []);

  const startHold = useCallback(
    (direction: 1 | -1) => {
      holdStartRef.current = Date.now();

      const step = () => {
        const current = valueRef.current;
        const next =
          current === "auto" ? "0" : String(Number(current) + direction);
        onChange(next);
      };

      // Fire once immediately
      step();

      // After initial delay, start repeating
      timeoutRef.current = setTimeout(() => {
        intervalRef.current = setInterval(() => {
          step();

          // After acceleration threshold, switch to fast interval
          if (Date.now() - holdStartRef.current > ACCELERATION_THRESHOLD) {
            if (intervalRef.current !== null) {
              clearInterval(intervalRef.current);
            }
            intervalRef.current = null;
            fastIntervalRef.current = setInterval(step, FAST_INTERVAL);
          }
        }, REPEAT_INTERVAL);
      }, INITIAL_DELAY);
    },
    [onChange],
  );

  const handlePointerDown = useCallback(
    (direction: 1 | -1) => (event: React.PointerEvent) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      startHold(direction);
    },
    [startHold],
  );

  const handlePointerUp = useCallback(() => {
    clearTimers();
  }, [clearTimers]);

  return (
    <div className="relative">
      <Button
        className="absolute top-1/2 bottom-1/2 left-3 grid size-6 -translate-y-1/2 place-items-center rounded-full bg-(--event-primary-color)/10 select-none hover:bg-(--event-primary-color)/50"
        size="icon"
        onPointerDown={handlePointerDown(-1)}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={(event) => {
          event.preventDefault();
        }}
      >
        <Minus className="size-2" />
      </Button>
      <Input
        type="number"
        value={value}
        name={name}
        onChange={(event) => {
          onChange(event.currentTarget.value);
        }}
        className="[appearance:textfield] text-center"
      />
      <Button
        className="absolute top-1/2 right-3 bottom-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full bg-(--event-primary-color)/10 select-none hover:bg-(--event-primary-color)/50"
        size="icon"
        onPointerDown={handlePointerDown(1)}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={(event) => {
          event.preventDefault();
        }}
      >
        <Plus className="size-2" />
      </Button>
      {value === "auto" ? (
        <span className="text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs tracking-widest uppercase">
          Auto
        </span>
      ) : null}
    </div>
  );
}

export { NumberButtonInput };
