export class CoordinatesSelection {
  ImageRectCoordinates: RectCoordinates;
  length: number;

  constructor(ImageRectCoordinates: RectCoordinates, length: number) {
    this.ImageRectCoordinates = ImageRectCoordinates;
    this.length = length;
  }
}
