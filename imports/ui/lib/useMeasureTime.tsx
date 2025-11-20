import { useState } from "react";

export function useMeasureTime() {
  const [startTime, setStartTime] = useState<number | undefined>(undefined);
  const [time, setTime] = useState(0);

  return {
    start: () => {
      setStartTime(Date.now());
    },
    /** persists current total time in seconds */
    pause: () => {
      setStartTime(undefined);
      setTime(time + Math.round((Date.now() - (startTime || Date.now())) / 1000));
    },
    reset: () => {
      setStartTime(undefined);
      setTime(0);
    },
    /** current total time in seconds */
    time: () => time + Math.round((Date.now() - (startTime || Date.now())) / 1000),
  };
}
