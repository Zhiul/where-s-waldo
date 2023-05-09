import { useEffect, useState, useContext, useCallback } from "react";
import { Viewer } from "openseadragon";

import { CharactersContext } from "../../../routes/game";
import { ImageViewCharacterSelectOption } from "./ImageViewCharacterSelectOption";
import { addImageOntoViewer } from "./utils/addImageOntoViewer";

import CoordinatesSelectionCircleIcon from "../../../assets/cursor-selected-coordinates.png";

import { CoordinatesSelection } from "../factories/CoordinatesSelection";

import { debounce } from "lodash";

interface ImageViewCharactersSelectProps {
  coordinatesSelection: CoordinatesSelection | null;
  setCoordinatesSelection: React.Dispatch<
    React.SetStateAction<CoordinatesSelection | null>
  >;
  viewer: Viewer;
}

interface CSSPosition {
  top: string;
  left: string;
}

export function ImageViewCharactersSelect({
  coordinatesSelection,
  setCoordinatesSelection,
  viewer,
}: ImageViewCharactersSelectProps) {
  const { characters } = useContext(CharactersContext);
  const [charactersSelectPosition, setCharactersSelectPosition] =
    useState<null | CSSPosition>(null);

  function removeCoordinatesSelection() {
    viewer.removeOverlay("coordinates-selection-circle");
  }

  function disableCoordinatesSelection() {
    setCoordinatesSelection(null);
    removeCoordinatesSelection();
  }

  async function getCharactersSelectPositionParameters() {
    const CHARACTERS_SELECT_WIDTH = 189;
    const CHARACTERS_SELECT_HEIGHT = 290;

    const coordinatesSelectionElement = document.querySelector(
      "#coordinates-selection-circle"
    ) as HTMLDivElement;
    const coordinatesSelectionElementBoundingRect =
      coordinatesSelectionElement.getBoundingClientRect();

    const coordinatesSelectionElementMiddleXPoint =
      coordinatesSelectionElementBoundingRect.left +
      (coordinatesSelectionElementBoundingRect.right -
        coordinatesSelectionElementBoundingRect.left) /
        2;
    const coordinatesSelectionElementMiddleYPoint =
      coordinatesSelectionElementBoundingRect.top +
      (coordinatesSelectionElementBoundingRect.bottom -
        coordinatesSelectionElementBoundingRect.top) /
        2;

    const boundingClientRectFitsInViewport = (rect: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    }) => {
      return (
        rect.top >= 0 &&
        rect.right <= window.innerWidth &&
        rect.bottom <= window.innerHeight &&
        rect.left >= 0
      );
    };

    const calculatePositionBoundingClientRect = (position: {
      top: number;
      left: number;
    }) => {
      const top = position.top;
      const left = position.left;
      const right = left + CHARACTERS_SELECT_WIDTH;
      const bottom = top + CHARACTERS_SELECT_HEIGHT;

      return { top, right, bottom, left };
    };

    const CHARACTER_SELECT_TOP_POSITION = {
      top: coordinatesSelectionElementMiddleYPoint - CHARACTERS_SELECT_HEIGHT,
      left:
        coordinatesSelectionElementMiddleXPoint - CHARACTERS_SELECT_WIDTH / 2,
    };

    const CHARACTER_SELECT_RIGHT_POSITION = {
      top:
        coordinatesSelectionElementMiddleYPoint - CHARACTERS_SELECT_HEIGHT / 2,
      left: coordinatesSelectionElementMiddleXPoint + CHARACTERS_SELECT_WIDTH,
    };

    const CHARACTER_SELECT_BOTTOM_POSITION = {
      top: coordinatesSelectionElementMiddleYPoint,
      left:
        coordinatesSelectionElementMiddleXPoint - CHARACTERS_SELECT_WIDTH / 2,
    };

    const CHARACTER_SELECT_LEFT_POSITION = {
      top:
        coordinatesSelectionElementMiddleYPoint - CHARACTERS_SELECT_HEIGHT / 2,
      left: coordinatesSelectionElementMiddleXPoint - CHARACTERS_SELECT_WIDTH,
    };

    const CHARACTER_SELECT_POSITIONS = [
      CHARACTER_SELECT_BOTTOM_POSITION,
      CHARACTER_SELECT_TOP_POSITION,
      CHARACTER_SELECT_RIGHT_POSITION,
      CHARACTER_SELECT_LEFT_POSITION,
    ];

    for (let i = 0; i < CHARACTER_SELECT_POSITIONS.length; i++) {
      const CHARACTER_SELECT_POSITION = CHARACTER_SELECT_POSITIONS[i];
      const CHARACTER_SELECT_POSITION_BOUNDING_CLIENT_RECT =
        calculatePositionBoundingClientRect(CHARACTER_SELECT_POSITION);
      if (
        boundingClientRectFitsInViewport(
          CHARACTER_SELECT_POSITION_BOUNDING_CLIENT_RECT
        )
      )
        return {
          top: CHARACTER_SELECT_POSITION.top + "px",
          left: CHARACTER_SELECT_POSITION.left + "px",
        };
    }

    // Calculates top and left depending on what sides of the viewport the dropdown overflos

    let top;
    let left;

    const dropdownOverflowsOnTheBottomOfTheScreen =
      coordinatesSelectionElementMiddleYPoint + CHARACTERS_SELECT_HEIGHT >
      window.innerHeight;

    if (dropdownOverflowsOnTheBottomOfTheScreen) {
      top = window.innerHeight - CHARACTERS_SELECT_HEIGHT + "px";
    } else {
      top = 0 + "px";
    }

    const dropdownOverflowsOnTheRightSideOfTheScreen =
      coordinatesSelectionElementMiddleXPoint + CHARACTERS_SELECT_WIDTH >
      window.innerWidth;

    if (dropdownOverflowsOnTheRightSideOfTheScreen) {
      left = window.innerWidth - CHARACTERS_SELECT_WIDTH + "px";
    } else {
      left = 0 + "px";
    }

    return {
      top,
      left,
    };
  }

  const setNewCharactersSelectPosition = useCallback(() => {
    getCharactersSelectPositionParameters().then((position) => {
      setTimeout(() => {
        setCharactersSelectPosition(position);
      }, 100);
    });
  }, []);

  const debouncedSetNewCharactersSelectPosition = useCallback(
    debounce(setNewCharactersSelectPosition, 100),
    []
  );

  useEffect(() => {
    if (!viewer) return;

    // Logic for rendering coordinates selection and characters select

    async function waitForCoordinatesSelectionElement() {
      const coordinatesSelectionElement = document.querySelector(
        "#coordinates-selection-circle"
      );

      return new Promise((resolve) => {
        if (!coordinatesSelectionElement) {
          setTimeout(() => {
            resolve(waitForCoordinatesSelectionElement());
          }, 4);
        } else {
          resolve(true);
        }
      });
    }

    function renderCoordinatesSelection() {
      if (coordinatesSelection === null) return;

      addImageOntoViewer(
        viewer,
        CoordinatesSelectionCircleIcon,
        "coordinates-selection-circle",
        "",
        coordinatesSelection.ImageRectCoordinates.x1,
        coordinatesSelection.ImageRectCoordinates.y1,
        200,
        200
      );
    }

    if (coordinatesSelection) {
      renderCoordinatesSelection();
      waitForCoordinatesSelectionElement().then(() => {
        setNewCharactersSelectPosition();
        window.addEventListener(
          "resize",
          debouncedSetNewCharactersSelectPosition
        );
      });
    } else {
      setCharactersSelectPosition(null);
      window.removeEventListener(
        "resize",
        debouncedSetNewCharactersSelectPosition
      );
    }
  }, [coordinatesSelection, viewer]);

  return (
    <>
      {charactersSelectPosition && (
        <>
          <div
            className="characters-select-overlay"
            onClick={disableCoordinatesSelection}
          ></div>

          <div
            className="characters-select"
            style={{
              transform: `translate(${charactersSelectPosition.left}, ${charactersSelectPosition.top})`,
            }}
            role="listbox"
          >
            <ul>
              {characters.map((character, index) => {
                return (
                  <li key={index}>
                    <ImageViewCharacterSelectOption
                      character={character}
                      disableCoordinatesSelection={disableCoordinatesSelection}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </>
  );
}
