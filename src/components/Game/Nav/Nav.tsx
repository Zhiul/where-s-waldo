import { useContext } from "react";
import { Link } from "react-router-dom";
import { CharactersContext } from "../../../routes/game";

import { CharacterIcon } from "../CharacterIcon";

import { ReactComponent as GoBackIcon } from "../../../assets/arrow.svg";
import { ReactComponent as TrophyIcon } from "../../../assets/trophy-icon.svg";

import { Stopwatch } from "./Stopwatch";
import { StopwatchI } from "../../../utils/useStopwatch";

export function Nav({ stopwatch }: { stopwatch: StopwatchI }) {
  const { characters } = useContext(CharactersContext);

  return (
    <nav>
      <ul className="characters-list" aria-label="Characters list">
        {characters.map((character) => {
          return (
            <li key={character.name}>
              <CharacterIcon
                character={character}
                width="42px"
                iconColor={character.iconColor}
                showStatus={true}
              />
            </li>
          );
        })}
      </ul>

      <Stopwatch stopwatch={stopwatch} />

      <div className="nav-buttons">
        <Link
          to="./leaderboard/1"
          className="nav-button nav-leaderboard-button"
          aria-label="Open leaderboard"
        >
          <div className="nav-leaderboard-button-icon" aria-hidden="true">
            <TrophyIcon />
          </div>
        </Link>

        <a className="nav-button nav-go-back-button" href="/home">
          <div className="nav-go-back-button-text">Go back to home</div>
          <div className="nav-go-back-button-icon" aria-hidden="true">
            <GoBackIcon />
          </div>
        </a>
      </div>
    </nav>
  );
}
