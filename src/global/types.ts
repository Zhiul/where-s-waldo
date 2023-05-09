export {};

interface Image {
  title: string;
  high_res_url: string;
  low_res_url: string;
  dimensions: {
    width: number;
    height: number;
  };
  id: string;
  leaderboard: LeaderboardEntry[];
  charactersLocation: { [key in ValidCharacter]: RectCoordinates };
}

interface RectCoordinates {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

interface CoordinatesSelection {
  ImageRectCoordinates: RectCoordinates;
  length: number;
}

interface Character {
  name: string;
  image: string;
  found: boolean;
  iconColor: string;
}

enum ValidCharacter {
  Waldo = "waldo",
  Odlaw = "odlaw",
  Wenda = "wenda",
  Wizard = "wizard",
  Woof = "woof",
}

interface LeaderboardEntry {
  name: string;
  time: number;
  id: string;
}
