import { ReactComponent as ClockIcon } from "../../../assets/clock.svg";
import { StopwatchI } from "../../../utils/useStopwatch";

import { getFormattedDuration } from "../../../utils/getFormattedDuration";

export function Stopwatch({ stopwatch }: { stopwatch: StopwatchI }) {
  const formattedDuration = getFormattedDuration(stopwatch.seconds);

  return (
    <div className="stopwatch">
      <div className="stopwatch-icon">
        <ClockIcon aria-hidden="true" />
      </div>
      <div className="sr-only">Elapsed time: </div>
      <div className="stopwatch-text">{formattedDuration}</div>
    </div>
  );
}
