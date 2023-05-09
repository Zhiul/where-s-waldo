import { useEffect } from "react";

import { ViewerAction } from "./ImageView";

import { ReactComponent as TargetIcon } from "../../../assets/target-icon.svg";
import { ReactComponent as PanIcon } from "../../../assets/pan-icon.svg";
import { ReactComponent as ZoomOutIcon } from "../../../assets/zoom-out-icon.svg";
import { ReactComponent as ZoomInIcon } from "../../../assets/zoom-in-icon.svg";

import { ImageViewPanelButton } from "./ImageViewPanelButton";

interface ImageViewPanelProps {
  viewerAction: ViewerAction;
  setViewerAction: React.Dispatch<React.SetStateAction<ViewerAction>>;
}

export function ImageViewPanel({
  viewerAction,
  setViewerAction,
}: ImageViewPanelProps) {
  useEffect(() => {
    function changeViewerActionOnKeyPress(e: KeyboardEvent) {
      function getViewerAction(key: string) {
        switch (key) {
          case "t":
            return "target";
            break;

          case "h":
            return "pan";
            break;

          case "z":
            return e.altKey ? "zoom-out" : "zoom-in";
            break;

          default:
            return "target";
            break;
        }
      }

      setViewerAction(getViewerAction(e.key));
    }

    window.addEventListener("keydown", changeViewerActionOnKeyPress);
  }, []);
  return (
    <section className="image-view-buttons-panel">
      <ImageViewPanelButton
        viewerAction={viewerAction}
        setViewerAction={setViewerAction}
        Icon={TargetIcon}
        viewerActionValue="target"
        shortcut="t"
      />

      <ImageViewPanelButton
        viewerAction={viewerAction}
        setViewerAction={setViewerAction}
        Icon={PanIcon}
        viewerActionValue="pan"
        shortcut="h"
      />

      <ImageViewPanelButton
        viewerAction={viewerAction}
        setViewerAction={setViewerAction}
        Icon={ZoomOutIcon}
        viewerActionValue="zoom-out"
        shortcut="alt + z"
      />

      <ImageViewPanelButton
        viewerAction={viewerAction}
        setViewerAction={setViewerAction}
        Icon={ZoomInIcon}
        viewerActionValue="zoom-in"
        shortcut="z"
      />
    </section>
  );
}
