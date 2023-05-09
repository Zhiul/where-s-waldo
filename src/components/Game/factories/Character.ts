export class Character {
  name: string;
  iconColor: string;
  image: string;
  found: boolean;

  constructor(name: string, iconColor: string, image: string) {
    this.name = name;
    this.iconColor = iconColor;
    this.image = image;
    this.found = false;
  }
}
