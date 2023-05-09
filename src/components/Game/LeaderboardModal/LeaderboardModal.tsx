import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ReactComponent as ArrowIcon } from "../../../assets/arrow.svg";

import { useHandleModalVisibility } from "../../../utils/UI/useHandleModalVisibility";
import { useModalAnimation } from "../../../utils/UI/useModalAnimation";

import { LeaderboardEntry } from "./LeaderboardEntry";
import { LeaderboardModalEmptyState } from "./LeaderboardModalEmptyState";

import { leaderboardPageEntriesOnSnapshot } from "../../../firebase/firebase";

interface LeaderboardModal {
  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  userEntry: LeaderboardEntry | null;
}

export function LeaderboardModal({
  isActive,
  setIsActive,
  userEntry,
}: LeaderboardModal) {
  const params = useParams();
  const navigate = useNavigate();

  // Modal logic

  const leaderboardModalRef = useRef<null | HTMLDialogElement>(null);
  useModalAnimation(leaderboardModalRef, isActive);
  useHandleModalVisibility(isActive, setIsActive, leaderboardModalRef);

  // Leadeboard state logic

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardDataHasBeenFetched, setLeaderboardDataHasBeenFetched] =
    useState(false);

  const leaderboardRef = useRef<LeaderboardEntry[]>([]);
  leaderboardRef.current = leaderboard;
  const sortedLeaderboard = [...leaderboard].sort((a, b) => a.time - b.time);

  const entriesPerPage = 5;

  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const firstEntryIndex = (currentPageNumber - 1) * entriesPerPage;
  const lastEntryIndex = firstEntryIndex + (entriesPerPage - 1);
  const currentLeaderboardEntries = sortedLeaderboard.slice(
    firstEntryIndex,
    lastEntryIndex + 1
  );

  const lastLeaderboardPageNumber =
    Math.ceil(leaderboard.length / entriesPerPage) || 1;

  const userRankPosition = userEntry
    ? sortedLeaderboard.findIndex((entry) => entry.id === userEntry.id) + 1
    : -1;

  const leaderboardPath = `/game/${params.imageid}/leaderboard/`;

  function handleCurrentPageNumber() {
    if (!leaderboardDataHasBeenFetched || !isActive) return;

    const pageNumberParam = params.pageNumber;
    let pageNumber =
      typeof pageNumberParam === "string" ? parseInt(pageNumberParam) : 1;

    if (pageNumber === currentPageNumber) return;
    if (isNaN(pageNumber) || pageNumber < 1) pageNumber = 1;
    if (pageNumber > lastLeaderboardPageNumber)
      pageNumber = lastLeaderboardPageNumber;

    if (currentPageNumber !== pageNumber) {
      setCurrentPageNumber(pageNumber);
      // Delays adjusting the url to the right value
      setTimeout(() => {
        navigate(leaderboardPath + pageNumber);
      }, 0);
    }
  }
  handleCurrentPageNumber();

  const previousPageNumber = currentPageNumber - 1;
  const previousPagePath = leaderboardPath + previousPageNumber;
  const previousPagePathIsAvailable = previousPageNumber >= 1;

  const nextPageNumber = currentPageNumber + 1;
  const nextPagePath = leaderboardPath + nextPageNumber;
  const nextPagePathIsAvailable = nextPageNumber <= lastLeaderboardPageNumber;

  // Logic to keep data in sync with the database

  function addLeaderboardEntries(leaderboardEntries: LeaderboardEntry[]) {
    setLeaderboardDataHasBeenFetched(true);
    setLeaderboard([...leaderboardRef.current, ...leaderboardEntries]);
  }

  function initializeLeaderboard() {
    leaderboardPageEntriesOnSnapshot(
      params.imageid as string,
      addLeaderboardEntries
    );
  }

  useEffect(() => {
    initializeLeaderboard();
  }, []);

  return (
    <dialog
      className="leaderboard-modal"
      ref={leaderboardModalRef}
      data-active={isActive}
    >
      <header>
        <div className="leaderboard-modal-title-wrapper"></div>

        <h2>Leaderboard</h2>

        {userEntry && (
          <>
            <h3 className="leaderboard-modal-position-title">Your position</h3>

            <LeaderboardEntry
              leaderboardEntry={userEntry}
              rankPosition={userRankPosition}
              isPlayer={true}
            />
          </>
        )}
      </header>

      <section className="leaderboard-list">
        {leaderboardDataHasBeenFetched === false ? (
          <div className="lds-spinner">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        ) : (
          <>
            <h3 className="sr-only">Leaderboard list</h3>

            <ul>
              {currentLeaderboardEntries.length === 0 ? (
                <LeaderboardModalEmptyState />
              ) : (
                currentLeaderboardEntries.map((entry, i) => {
                  const rankPosition = firstEntryIndex + i + 1;
                  return (
                    <li key={i}>
                      <LeaderboardEntry
                        leaderboardEntry={entry}
                        rankPosition={rankPosition}
                        isPlayer={false}
                      />
                    </li>
                  );
                })
              )}
            </ul>
          </>
        )}
      </section>

      <section className="leaderboard-list-page-navigation">
        <Link
          to={previousPagePath}
          className="leaderboard-list-page-navigation-link"
          data-is-available={previousPagePathIsAvailable}
        >
          <ArrowIcon />
        </Link>

        <div className="leaderboard-list-page-navigation-current-page">
          {leaderboardDataHasBeenFetched === false ? (
            <div className="lds-spinner">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          ) : (
            currentPageNumber
          )}
        </div>

        <Link
          to={nextPagePath}
          className="leaderboard-list-page-navigation-link next"
          data-is-available={nextPagePathIsAvailable}
        >
          <ArrowIcon />
        </Link>
      </section>
    </dialog>
  );
}
