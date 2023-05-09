import { useContext } from "react";

import { CharactersContext } from "../../../routes/game";
import { CharacterIcon } from "../CharacterIcon";

interface ImageViewCharacterSelectOptionProps {
  character: Character;
  disableCoordinatesSelection: () => void;
}

export function ImageViewCharacterSelectOption({
  character,
  disableCoordinatesSelection,
}: ImageViewCharacterSelectOptionProps) {
  const characters = useContext(CharactersContext);

  return (
    <div
      className="character-option"
      role="option"
      onClick={() => {
        characters.markCoordinatesSelectionAsCharactersLocation(character);
        disableCoordinatesSelection();
      }}
    >
      <CharacterIcon
        character={character}
        width="42px"
        iconColor={character.iconColor}
        showStatus={false}
      />
      <div className="character-option-name">{character.name}</div>
    </div>
  );
}
