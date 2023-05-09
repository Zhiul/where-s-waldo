import { useState, useRef } from "react";

import { useHandleModalVisibility } from "../../utils/UI/useHandleModalVisibility";
import { useModalAnimation } from "../../utils/UI/useModalAnimation";

import { ReactComponent as TrophyIcon } from "../../assets/trophy-icon.svg";
import { ReactComponent as StarIcon } from "../../assets/star-icon.svg";
import { ReactComponent as ClockIcon } from "../../assets/clock.svg";

import { getFormattedDuration } from "../../utils/getFormattedDuration";

import { v4 } from "uuid";

import { submitLeaderboardEntry } from "../../firebase/firebase";

interface WinModalProps {
  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  userEntry: LeaderboardEntry | null;
  setUserEntry: React.Dispatch<React.SetStateAction<LeaderboardEntry | null>>;
  setLeaderboardModalIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  time: number;
  imageID: string;
}

export function WinModal({
  isActive,
  setIsActive,
  userEntry,
  setUserEntry,
  setLeaderboardModalIsActive,
  time,
  imageID,
}: WinModalProps) {
  // Modal logic
  const winModalRef = useRef<null | HTMLDialogElement>(null);
  useHandleModalVisibility(isActive, setIsActive, winModalRef, false);
  useModalAnimation(winModalRef, isActive);

  // User name input logic
  const [userName, setUserName] = useState("");
  function handleUserNameInput(e: React.FormEvent<HTMLInputElement>) {
    const userNameInputMaxLength = 50;
    const userNameInputNewValue = e.currentTarget.value;
    const userNameInputNewValueLength = userNameInputNewValue.length;

    if (userNameInputNewValueLength > userNameInputMaxLength) return;
    setUserName(userNameInputNewValue);
  }

  const formattedDuration = getFormattedDuration(time);

  function getNumberOfStars() {
    if (time <= 30) return 3;
    if (time <= 60) return 2;
    if (time <= 120) return 1;
    return 0;
  }
  const numberOfStars = getNumberOfStars();
  const starsText = `${numberOfStars} stars out of 3`;

  async function uploadUserEntry(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    setIsActive(false);
    const userEntry = await submitLeaderboardEntry(
      imageID,
      userName,
      time,
      v4()
    );
    setUserEntry(userEntry);
  }

  // Logic to enable the leaderboard modal after the user entry has been uploaded

  const userEntryRef = useRef<null | LeaderboardEntry>(null);
  userEntryRef.current = userEntry;

  const [previousIsActive, setPreviousIsActive] = useState(isActive);
  if (isActive !== previousIsActive) {
    setPreviousIsActive(isActive);

    function waitForUserEntry(tries: number = 0) {
      return new Promise((resolve, reject) => {
        if (tries >= 40) {
          reject();
          return;
        }

        if (userEntryRef.current) {
          resolve(true);
          return;
        }

        setTimeout(() => {
          resolve(waitForUserEntry(tries++));
        }, 50);
      });
    }

    if (isActive === false) {
      waitForUserEntry().then(() => {
        setLeaderboardModalIsActive(true);
      });
    }
  }

  return (
    <dialog className="win-modal" ref={winModalRef} data-active={isActive}>
      <form>
        <div className="win-modal-trophy-icon">
          <TrophyIcon aria-hidden="true" />
        </div>

        <h2>You won!</h2>

        <div className="win-modal-time">
          <div className="win-modal-time-icon">
            <ClockIcon aria-hidden="true" />
          </div>

          <div className="win-modal-time-duration">
            <span className="sr-only">Time duration: </span>
            {formattedDuration}
          </div>
        </div>

        <div className="win-modal-stars" aria-label={starsText}>
          <div className="win-modal-star" data-active={numberOfStars >= 1}>
            <StarIcon aria-hidden="true" />
          </div>

          <div className="win-modal-star" data-active={numberOfStars >= 2}>
            <StarIcon aria-hidden="true" />
          </div>

          <div className="win-modal-star" data-active={numberOfStars === 3}>
            <StarIcon aria-hidden="true" />
          </div>
        </div>

        <input
          type="text"
          className="user-name-input"
          onInput={handleUserNameInput}
          value={userName}
          maxLength={120}
          placeholder="Insert your name"
        />

        <button className="win-modal-submit-cta" onClick={uploadUserEntry}>
          Submit
        </button>
      </form>
    </dialog>
  );
}
