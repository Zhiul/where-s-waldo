import { Duration } from "luxon";

// time is represented in seconds

export function getFormattedDuration(
  time: number,
  format: "long" | "compact" = "long"
) {
  const timeDuration = Duration.fromMillis(time * 1000);

  let longFormattedDuration = timeDuration.toFormat("hh:mm:ss.SSS");
  longFormattedDuration = longFormattedDuration.slice(
    0,
    longFormattedDuration.length - 1
  );

  let compactFormattedDuration = timeDuration.toFormat("mm:ss.SSS");
  compactFormattedDuration = compactFormattedDuration.slice(
    0,
    compactFormattedDuration.length - 1
  );

  if (format === "long") {
    return longFormattedDuration;
  } else {
    const hoursNumber = time / 3600;
    return hoursNumber >= 1 ? longFormattedDuration : compactFormattedDuration;
  }
}
