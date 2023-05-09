import { getFormattedDuration } from "../../../utils/getFormattedDuration";

import { ReactComponent as ClockIcon } from "../../../assets/clock.svg";

interface LeaderboardEntryProps {
  leaderboardEntry: LeaderboardEntry;
  rankPosition: number;
  isPlayer: boolean;
}

export function LeaderboardEntry({
  leaderboardEntry,
  rankPosition,
  isPlayer,
}: LeaderboardEntryProps) {
  return (
    <article className="leaderboard-entry">
      <h4 className="sr-only">User stats</h4>

      <span className="leaderboard-entry-user-text leaderboard-entry-user-rank">
        <span className="sr-only">User rank: </span>#{rankPosition}
      </span>

      <span className="leaderboard-entry-user-text leaderboard-entry-user-name">
        <span className="sr-only">User name: </span>
        {leaderboardEntry.name}
      </span>

      <span className="leaderboard-entry-user-text leaderboard-entry-user-time">
        <span className="sr-only">Time: </span>
        {getFormattedDuration(leaderboardEntry?.time || 1, "compact")}
        <div className="leaderboard-entry-user-time-icon">
          <ClockIcon />
        </div>
      </span>
    </article>
  );
}
