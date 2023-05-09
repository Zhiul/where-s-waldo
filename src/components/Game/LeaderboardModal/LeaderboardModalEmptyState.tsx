import { ReactComponent as LeaderboardModalEmptyStateIcon } from "../../../assets/leaderboard-empty-state.svg";

export function LeaderboardModalEmptyState() {
  return (
    <div className="leaderboard-empty-state">
      <div className="leaderboard-empty-state-image">
        <LeaderboardModalEmptyStateIcon />
      </div>
      <div className="leaderboard-empty-state-text">No entries</div>
    </div>
  );
}
