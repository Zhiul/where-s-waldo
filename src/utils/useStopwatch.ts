import { useState, useEffect, useRef } from "react";

export interface StopwatchI {
  seconds: number;
  toggleIsRunning: () => void;
  reset: () => void;
}

export const useStopwatch = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const stopwatchStartDate = useRef<null | number>(null);

  useEffect(() => {
    let intervalId: any;
    if (isRunning)
      intervalId = setInterval(() => {
        const newDate = Date.now();
        const dateDifferenceInSeconds =
          (newDate - (stopwatchStartDate.current as number)) / 1000;

        setTime(dateDifferenceInSeconds);
      }, 10);
    return () => clearInterval(intervalId);
  }, [isRunning, time]);

  // Method to start and stop timer
  const toggleIsRunning = () => {
    const newIsRunningValue = !isRunning;
    setIsRunning(newIsRunningValue);
    if (newIsRunningValue && time === 0)
      stopwatchStartDate.current = Date.now();
  };

  // Method to reset timer back to 0
  const reset = () => {
    setTime(0);
  };

  return { seconds: time, toggleIsRunning, reset };
};
