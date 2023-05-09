import { useSyncExternalStore } from "react";
import { debounce } from "lodash";

class WindowDimensions {
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
}

let windowResolution = new WindowDimensions(
  window.innerWidth,
  window.innerHeight
);

const setWindowResolution = debounce(() => {
  const debouncedResize = new CustomEvent("debouncedresize");

  windowResolution = new WindowDimensions(
    window.innerWidth,
    window.innerHeight
  );

  window.dispatchEvent(debouncedResize);
}, 1000);

window.addEventListener("resize", setWindowResolution);

function subscribe(callback: () => void) {
  window.addEventListener("debouncedresize", callback);
  return () => {
    window.removeEventListener("debouncedresize", callback);
  };
}

function getSnapshot() {
  return windowResolution;
}

export const useWindowResolution = () => {
  const WindowDimensions = useSyncExternalStore(subscribe, getSnapshot);
  return WindowDimensions;
};
