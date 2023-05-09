export function CharacterIcon({
  character,
  width,
  iconColor,
  showStatus,
}: {
  character: Character;
  width: string;
  iconColor: string;
  showStatus: boolean;
}) {
  const status = character.found ? "Found" : "Missing";

  return (
    <div
      className="character-icon"
      // @ts-ignore
      style={{ "--width": width, color: iconColor }}
      data-found={showStatus ? character.found : false}
    >
      <span className="sr-only">Name: {character.name}</span>

      {showStatus && <span className="sr-only">Status : {status}</span>}

      <img src={character.image} alt={`${character.name} picture`} />
    </div>
  );
}
