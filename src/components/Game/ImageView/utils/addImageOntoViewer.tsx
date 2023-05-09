import { Viewer } from "openseadragon";
import { addElementOntoViewer } from "./addElementOntoViewer";

export function addImageOntoViewer(
  viewer: Viewer,
  imgSrc: string,
  imageID: string,
  imageClassName: string,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const imageElement = document.createElement("img");
  imageElement.src = imgSrc;
  imageElement.id = imageID;
  imageElement.classList.value = imageClassName;
  addElementOntoViewer(viewer, imageElement, imageID, "", x, y, width, height);
}
