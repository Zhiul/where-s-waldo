import OpenSeadragon from "openseadragon";
import { Viewer } from "openseadragon";

export function addElementOntoViewer(
  viewer: Viewer,
  element: HTMLElement,
  elementID: string,
  elementClassName: string,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const imageDimensions = viewer.world.getItemAt(0).getContentSize();

  x = x / imageDimensions.x;
  y = y / imageDimensions.x;
  width = width / imageDimensions.x;
  height = width;

  element.id = elementID;
  element.className = elementClassName;
  viewer.addOverlay({
    element: element,
    location: new OpenSeadragon.Rect(x, y, width, height),
  });
}
