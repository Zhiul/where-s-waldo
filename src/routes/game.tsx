import { useState, useEffect, useRef, createContext } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { useParams, useLocation, useNavigate } from "react-router-dom";

// Utils

import { Viewer } from "openseadragon";
import { useStopwatch } from "../utils/useStopwatch";
import { getImage } from "../firebase/firebase";

// Assets

import WaldoImage from "../assets/waldo.png";
import WizardImage from "../assets/wizard.png";
import OdlawImage from "../assets/odlaw.png";
import WendaImage from "../assets/wenda.png";
import WoofImage from "../assets/woof.png";

import CharacterPositionIcon from "../assets/cursor-selected-coordinates.png";

// UI

import { Nav } from "../components/Game/Nav/Nav";
import { ImageView } from "../components/Game/ImageView/ImageView";
import { addElementOntoViewer } from "../components/Game/ImageView/utils/addElementOntoViewer";

import { CharacterIcon } from "../components/Game/CharacterIcon";

import { CreateModal } from "../utils/UI/createModal";
import { WinModal } from "../components/Game/WinModal";
import { LeaderboardModal } from "../components/Game/LeaderboardModal/LeaderboardModal";

import { ErrorBoundary } from "../utils/UI/ErrorBoundary";
import { PageNotFound } from "../components/PageNotFound";

// Factories

import { Character } from "../components/Game/factories/Character";
import { CoordinatesSelection } from "../components/Game/factories/CoordinatesSelection";
import { RectCoordinates } from "../components/Game/factories/RectCoordinates";
import { isEqual } from "lodash";

interface CharactersContext {
  characters: Character[];
  markCharacterAsFound: (
    character: Character,
    coordinates: RectCoordinates
  ) => void;
  markCoordinatesSelectionAsCharactersLocation: (character: Character) => void;
}

export const CharactersContext = createContext({} as CharactersContext);

function getCharacters() {
  return [
    new Character("Waldo", "#01B57F", WaldoImage),
    new Character("Wizard", "#7BB501", WizardImage),
    new Character("Odlaw", "#0BB8A3", OdlawImage),
    new Character("Wenda", "#0B6FB8", WendaImage),
    new Character("Woof", "#008698", WoofImage),
  ];
}

function rectanglesAreasOverlap(rect: RectCoordinates, rect2: RectCoordinates) {
  // If one rectangle is on left side of other
  if (rect.x1 > rect2.x2 || rect2.x1 > rect.x2) {
    return false;
  }

  // If one rectangle is above other
  if (rect.y1 > rect2.y2 || rect2.y1 > rect.y2) {
    return false;
  }

  return true;
}

export function Game() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const viewerRef = useRef<null | Viewer>(null);
  const [viewerWasInitialized, setViewerWasInitialized] = useState(false);
  const stopwatch = useStopwatch();

  const [userEntry, setUserEntry] = useState<null | LeaderboardEntry>(null);

  // Image data logic

  const [imageData, setImageData] = useState<Image>({} as Image);
  useEffect(() => {
    getImage(params.imageid as string).then((image) => {
      setImageData(image);
    });
  }, []);

  // Leaderboard logic

  const [leaderboardModalIsActive, setLeaderboardModalIsActive] =
    useState(false);
  const leaderboardModal = CreateModal(
    LeaderboardModal,
    { userEntry: userEntry },
    leaderboardModalIsActive,
    setLeaderboardModalIsActive,
    "overlay overlay-dark",
    200
  );

  const leaderboardModalFirstRenderRef = useRef(true);
  const leaderboardModalIsActiveRef = useRef(false);

  const [previousLocation, setPreviousLocation] = useState(location);

  function changeLeaderboardModalVisibilityOnLocationChange() {
    const isFirstRender = leaderboardModalFirstRenderRef.current;

    function locationIsAtLeaderboardPath() {
      const URLSegments = location.pathname.split("/");
      const leaderboardPositionIndex = URLSegments.length - 2;
      const lastURLSegments = URLSegments.slice(leaderboardPositionIndex);
      return lastURLSegments[0] === "leaderboard";
    }

    if (
      (isEqual(location, previousLocation) && !isFirstRender) ||
      locationIsAtLeaderboardPath() === false
    )
      return;

    if (!isFirstRender) setPreviousLocation(location);
    if (leaderboardModalIsActive === false) setLeaderboardModalIsActive(true);
    if (leaderboardModalFirstRenderRef.current)
      leaderboardModalIsActiveRef.current = true;
  }

  const [
    previousLeaderboardModalIsActive,
    setPreviousLeaderboardModalIsActive,
  ] = useState(leaderboardModalIsActive);

  function changeLocationOnLeaderboardModalVisibilityChange() {
    if (leaderboardModalIsActive === previousLeaderboardModalIsActive) return;
    setPreviousLeaderboardModalIsActive(leaderboardModalIsActive);

    let isActive;

    if (leaderboardModalFirstRenderRef.current) {
      leaderboardModalFirstRenderRef.current = false;
      isActive = leaderboardModalIsActiveRef.current;
    } else {
      isActive = leaderboardModalIsActive;
    }

    if (isActive === false) {
      const levelPath = `/game/${params.imageid}/`;

      const leaderboardModalAnimationDuration = 200;
      setTimeout(() => {
        navigate(levelPath);
      }, leaderboardModalAnimationDuration);
    }
  }

  changeLeaderboardModalVisibilityOnLocationChange();
  changeLocationOnLeaderboardModalVisibilityChange();

  const [gameHasEnded, setGameHasEnded] = useState(false);

  const [coordinatesSelection, setCoordinatesSelection] =
    useState<CoordinatesSelection | null>(null);

  // Characters logic

  const [characters, setCharacters] = useState(getCharacters());

  function markCharacterAsFound(character: Character) {
    const newCharacters = [...characters];
    const characterIndex = newCharacters.findIndex(
      (char) => char.name === character.name
    );
    newCharacters[characterIndex].found = true;
    setCharacters(newCharacters);
  }

  function markCoordinatesSelectionAsCharactersLocation(character: Character) {
    function addCharacterPositionElementOntoViewer() {
      if (!coordinatesSelection || !viewerRef.current) return;

      const COORDINATES_SELECTION_LENGTH = 200;
      const characterName = character.name.toLowerCase() as ValidCharacter;

      const characterLocation = imageData.charactersLocation[characterName];
      const characterLocationWidth =
        characterLocation.x2 - characterLocation.x1;
      const characterLocationHeight =
        characterLocation.y2 - characterLocation.y1;

      const top =
        characterLocation.y1 -
        COORDINATES_SELECTION_LENGTH / 2 +
        characterLocationHeight / 2;

      const left =
        characterLocation.x1 -
        COORDINATES_SELECTION_LENGTH / 2 +
        characterLocationWidth / 2;

      const CharacterPositionMark = (
        <div
          className="character-position-mark"
          style={{
            background: `url(${CharacterPositionIcon})`,
            backgroundSize: "cover",
          }}
        >
          <CharacterIcon
            character={character}
            width="40%"
            iconColor={character.iconColor}
            showStatus={false}
          />
        </div>
      );

      const div = document.createElement("div");
      const root = createRoot(div);
      flushSync(() => {
        root.render(CharacterPositionMark);
      });

      const CharacterPositionMarkElement = div.firstElementChild as HTMLElement;

      addElementOntoViewer(
        viewerRef.current,
        CharacterPositionMarkElement,
        character.name,
        "character-position-mark",
        left,
        top,
        200,
        200
      );
    }

    if (!coordinatesSelection || !imageData) return;

    const characterName = character.name.toLowerCase();
    const characterLocation =
      imageData.charactersLocation[characterName as ValidCharacter];

    const coordinatesSelectionContainsCharacter = rectanglesAreasOverlap(
      coordinatesSelection.ImageRectCoordinates,
      characterLocation
    );

    if (coordinatesSelectionContainsCharacter) {
      markCharacterAsFound(character);
      addCharacterPositionElementOntoViewer();
    }
  }

  // Win modal logic

  const [winModalIsActive, setWinModalIsActive] = useState(false);
  const winModal = CreateModal(
    WinModal,
    {
      userEntry,
      setUserEntry,
      setLeaderboardModalIsActive,
      time: stopwatch.seconds,
      imageID: imageData.id,
    },
    winModalIsActive,
    setWinModalIsActive,
    "overlay overlay-dark",
    200
  );

  // Game start logic

  useEffect(() => {
    if (viewerWasInitialized) stopwatch.toggleIsRunning();
  }, [viewerWasInitialized]);

  // Game end logic
  useEffect(() => {
    const allCharactersHaveBeenFound = characters.every(
      (character) => character.found
    );

    if (allCharactersHaveBeenFound && viewerRef.current) {
      stopwatch.toggleIsRunning();
      setGameHasEnded(true);

      // Adds a black overlay to the viewer and zooms it out

      const viewerOverlay = document.createElement("div");
      const viewportDimensions = viewerRef.current.world
        .getItemAt(0)
        .getContentSize();

      addElementOntoViewer(
        viewerRef.current,
        viewerOverlay,
        "viewer-overlay",
        "viewer-overlay",
        0,
        0,
        viewportDimensions.x,
        viewportDimensions.y
      );

      const centerRefPoint = viewerRef.current.viewport.getCenter();
      viewerRef.current.viewport.zoomTo(1, centerRefPoint);
      viewerRef.current.viewport.applyConstraints(false);

      // Enables win modal shortly after the game end

      setTimeout(() => {
        setWinModalIsActive(true);
      }, 500);
    }
  }, [characters]);

  return (
    <ErrorBoundary fallback={<PageNotFound description="Level not found" />}>
      {winModal}
      {leaderboardModal}

      <CharactersContext.Provider
        value={{
          characters,
          markCharacterAsFound,
          markCoordinatesSelectionAsCharactersLocation,
        }}
      >
        <Nav stopwatch={stopwatch} />
        <ImageView
          imageData={imageData}
          coordinatesSelection={coordinatesSelection}
          setCoordinatesSelection={setCoordinatesSelection}
          gameHasEnded={gameHasEnded}
          viewerRef={viewerRef}
          viewerWasInitialized={viewerWasInitialized}
          setViewerWasInitialized={setViewerWasInitialized}
        />
      </CharactersContext.Provider>
    </ErrorBoundary>
  );
}
