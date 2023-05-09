import { useEffect, useState, useRef } from "react";
import OpenSeaDragon, { Viewer } from "openseadragon";

import { ImageViewPanel } from "./ImageViewPanel";
import { ImageViewCharactersSelect } from "./ImageViewCharactersSelect";

import { CoordinatesSelection } from "../factories/CoordinatesSelection";
import { RectCoordinates } from "../factories/RectCoordinates";

import { debounce } from "lodash";
import { isMobile } from "../../../utils/isMobile";

export type ViewerAction = "target" | "pan" | "zoom-out" | "zoom-in";

const desktopMediaQuery = window.matchMedia("(min-width: 1024px)");

function checkIfIsDesktop() {
  return desktopMediaQuery.matches && !isMobile;
}

interface ImageViewProps {
  imageData: Image;
  coordinatesSelection: CoordinatesSelection | null;
  setCoordinatesSelection: React.Dispatch<
    React.SetStateAction<CoordinatesSelection | null>
  >;
  gameHasEnded: boolean;
  viewerRef: React.MutableRefObject<Viewer | null>;
  viewerWasInitialized: boolean;
  setViewerWasInitialized: React.Dispatch<React.SetStateAction<boolean>>;
}

export function ImageView({
  imageData,
  coordinatesSelection,
  setCoordinatesSelection,
  gameHasEnded,
  viewerRef,
  viewerWasInitialized,
  setViewerWasInitialized,
}: ImageViewProps) {
  const [viewer, setViewer] = useState<null | Viewer>(null);
  const [viewerAction, setViewerAction] = useState<ViewerAction>("target");
  const [isDesktop, setIsDesktop] = useState(checkIfIsDesktop());

  useEffect(() => {
    if (imageData.high_res_url) InitializeViewer();

    return () => {
      viewer && viewer.destroy();
    };
  }, [imageData]);

  function InitializeViewer() {
    viewer && viewer.destroy();
    setViewer(
      OpenSeaDragon({
        id: "image-view",
        animationTime: 0.5,
        blendTime: 0.1,
        constrainDuringPan: true,
        maxZoomPixelRatio: 2,
        minZoomLevel: 1,
        visibilityRatio: 1,
        zoomPerScroll: 2,
        tileSources: {
          type: "image",
          url: imageData.high_res_url,
        },
        homeFillsViewer: true,
        showNavigationControl: false,
      })
    );
  }

  const viewerElementRef = useRef<HTMLDivElement>(null);

  const canvasWasPannedRecently = useRef<boolean>(false);
  let panInterval: any;

  const canvasWasPinchedRecently = useRef<boolean>(false);
  let pinchInterval: any;

  // Canvas actions logic

  function handleCanvasZoomAction(e: OpenSeadragon.CanvasClickEvent) {
    e.preventDefaultAction = true;

    if (
      viewer === null ||
      (viewerAction !== "zoom-out" && viewerAction !== "zoom-in") ||
      gameHasEnded
    )
      return;

    const refPoint = viewer.viewport.viewerElementToViewportCoordinates(
      e.position
    );

    const actualZoomValue = viewer.viewport.getZoom();
    const zoomOut = () => {
      viewer.viewport.zoomBy(0.5, refPoint);
      viewer.viewport.applyConstraints(false);
    };
    const zoomIn = () => viewer.viewport.zoomBy(2, refPoint);

    if (viewerAction === "zoom-out" && actualZoomValue > 1) zoomOut();
    if (viewerAction === "zoom-in" && actualZoomValue < 8) zoomIn();
  }

  function handleCanvasTargetAction(e: OpenSeadragon.CanvasClickEvent) {
    if (
      viewer === null ||
      (isDesktop && viewerAction !== "target") ||
      coordinatesSelection ||
      gameHasEnded ||
      canvasWasPannedRecently.current ||
      canvasWasPinchedRecently.current
    )
      return;

    function getCoordinatesSelection(viewer: OpenSeaDragon.Viewer) {
      const IMAGE_VIEWPORT_WIDTH = viewer.viewport.getContainerSize().x;
      const IMAGE_DIMENSIONS = viewer.world.getItemAt(0).getContentSize();
      const SIZE_MULTIPLIER = IMAGE_DIMENSIONS.x / IMAGE_VIEWPORT_WIDTH;

      const COORDINATES_SELECTION_LENGTH = 200;
      const COORDINATES_SELECTION_CLIENT_LENGTH =
        COORDINATES_SELECTION_LENGTH / SIZE_MULTIPLIER;

      const viewerRect = (
        viewerElementRef.current as HTMLDivElement
      ).getBoundingClientRect();

      const coordinatesSelectionClientRefPoint = {
        x: (e.originalEvent as MouseEvent).x,
        y: (e.originalEvent as MouseEvent).y,
      };

      const viewportCoordinates =
        viewer.viewport.viewerElementToViewportCoordinates(e.position);

      const x1 =
        viewportCoordinates.x * IMAGE_DIMENSIONS.x -
        COORDINATES_SELECTION_LENGTH / 2;
      const x2 = x1 + COORDINATES_SELECTION_LENGTH;

      const y1 =
        viewportCoordinates.y * IMAGE_DIMENSIONS.x -
        COORDINATES_SELECTION_LENGTH / 2;
      const y2 = y1 + COORDINATES_SELECTION_LENGTH;

      const selectionRectCoordinates = new RectCoordinates(x1, x2, y1, y2);

      // These offsets values represent how much of the coordinates selection is outside the visible viewport

      const viewportPXToImagePX = (viewportLength: number) =>
        viewportLength * SIZE_MULTIPLIER;

      const topOffset = viewportPXToImagePX(
        viewerRect.top -
          (coordinatesSelectionClientRefPoint.y -
            COORDINATES_SELECTION_CLIENT_LENGTH / 2)
      );
      const rightOffset = viewportPXToImagePX(
        coordinatesSelectionClientRefPoint.x +
          COORDINATES_SELECTION_CLIENT_LENGTH / 2 -
          viewerRect.right
      );
      const bottomOffset = viewportPXToImagePX(
        coordinatesSelectionClientRefPoint.y +
          COORDINATES_SELECTION_CLIENT_LENGTH / 2 -
          viewerRect.bottom
      );
      const leftOffset = viewportPXToImagePX(
        viewerRect.left -
          (coordinatesSelectionClientRefPoint.x -
            COORDINATES_SELECTION_CLIENT_LENGTH / 2)
      );

      const changeSelectionRectCoordinates = (x1: number, y1: number) => {
        selectionRectCoordinates.x1 = x1;
        selectionRectCoordinates.x2 = x1 + COORDINATES_SELECTION_CLIENT_LENGTH;
        selectionRectCoordinates.y1 = y1;
        selectionRectCoordinates.y2 = y1 + COORDINATES_SELECTION_CLIENT_LENGTH;
      };

      // Adjust selectionRectCoordinates if it is outside visible area

      if (topOffset > 0)
        changeSelectionRectCoordinates(
          selectionRectCoordinates.x1,
          selectionRectCoordinates.y1 + topOffset
        );
      if (rightOffset > 0)
        changeSelectionRectCoordinates(
          selectionRectCoordinates.x1 - rightOffset,
          selectionRectCoordinates.y1
        );
      if (bottomOffset > 0)
        changeSelectionRectCoordinates(
          selectionRectCoordinates.x1,
          selectionRectCoordinates.y1 - bottomOffset
        );
      if (leftOffset > 0)
        changeSelectionRectCoordinates(
          selectionRectCoordinates.x1 + leftOffset,
          selectionRectCoordinates.y1
        );

      return new CoordinatesSelection(
        selectionRectCoordinates,
        COORDINATES_SELECTION_LENGTH
      );
    }

    setCoordinatesSelection(getCoordinatesSelection(viewer));
  }

  function handleCanvasScrollZoomAction(e: OpenSeaDragon.CanvasScrollEvent) {
    if (!isDesktop) {
      e.preventDefaultAction = false;
      return;
    }

    const validScrollValue =
      (viewerAction === "zoom-in" && e.scroll > 0) ||
      (viewerAction === "zoom-out" && e.scroll < 0);

    if (
      (viewerAction !== "zoom-in" && viewerAction !== "zoom-out") ||
      validScrollValue === false ||
      gameHasEnded
    )
      e.preventDefaultAction = true;
  }

  function handleCanvasPinchZoomAction(e: OpenSeaDragon.CanvasPinchEvent) {
    if (gameHasEnded) {
      e.preventDefaultZoomAction = true;
      return;
    }

    canvasWasPinchedRecently.current = true;
    clearInterval(pinchInterval);
    pinchInterval = setInterval(() => {
      if (canvasWasPinchedRecently.current)
        canvasWasPinchedRecently.current = false;
    }, 200);
  }

  function handleCanvasPanAction(e: OpenSeaDragon.CanvasDragEvent) {
    if (gameHasEnded) {
      e.preventDefaultAction = true;
      return;
    }

    if (isDesktop) {
      e.preventDefaultAction = viewerAction !== "pan";
    } else {
      if (coordinatesSelection) {
        e.preventDefaultAction = true;
        return;
      }
      canvasWasPannedRecently.current = true;
      clearInterval(panInterval);
      panInterval = setInterval(() => {
        if (canvasWasPannedRecently.current)
          canvasWasPannedRecently.current = false;
      }, 200);
    }
  }

  useEffect(() => {
    // Updates viewer handlers
    if (!viewer) return;

    viewer.removeAllHandlers("canvas-click");
    viewer.removeAllHandlers("canvas-scroll");
    viewer.removeAllHandlers("canvas-pinch");
    viewer.removeAllHandlers("canvas-drag");

    viewer.addHandler("canvas-click", handleCanvasZoomAction);
    viewer.addHandler("canvas-pinch", handleCanvasPinchZoomAction);
    viewer.addHandler("canvas-drag", handleCanvasPanAction);
    viewer.addHandler("canvas-click", handleCanvasTargetAction);
    viewer.addHandler("canvas-scroll", handleCanvasScrollZoomAction);
  }, [viewer, isDesktop, viewerAction, coordinatesSelection, gameHasEnded]);

  useEffect(() => {
    // Disables keyboard controls and set the viewer as initialized

    if (viewer) {
      viewerRef.current = viewer;

      viewer.addHandler("canvas-key", function (e) {
        e.preventDefaultAction = true; // // disable default keyboard controls
        e.preventVerticalPan = true; // disable vertical panning with arrows and W or S keys
        e.preventHorizontalPan = true; // disable horizontal panning with arrows and A or D keys
      });

      const setViewerWasInitializedAsTrue = () => setViewerWasInitialized(true);

      viewer.addHandler("open", function () {
        const tiledImage = viewer.world.getItemAt(0);
        if (tiledImage.getFullyLoaded()) {
          setViewerWasInitializedAsTrue();
        } else {
          tiledImage.addOnceHandler(
            "fully-loaded-change",
            setViewerWasInitializedAsTrue
          );
        }
      });
    }
  }, [viewer]);

  // Changes isDesktop variable on resize

  useEffect(() => {
    window.addEventListener(
      "resize",
      debounce(() => {
        setIsDesktop(checkIfIsDesktop());
      }, 200)
    );
  }, []);

  const imageIsLoading = !viewerWasInitialized;

  return (
    <>
      <div className="image-view-wrapper">
        <ImageViewPanel
          viewerAction={viewerAction}
          setViewerAction={setViewerAction}
        />

        {imageData && (
          <div
            id="image-view"
            data-viewer-action={viewerAction}
            data-loading={imageIsLoading}
            ref={viewerElementRef}
          >
            <div
              className="image-view-bg"
              style={{
                backgroundImage: `url(${imageData.high_res_url})`,
                backgroundSize: "cover",
              }}
            ></div>

            <ImageViewCharactersSelect
              coordinatesSelection={coordinatesSelection}
              setCoordinatesSelection={setCoordinatesSelection}
              viewer={viewer as Viewer}
            />
          </div>
        )}
      </div>
    </>
  );
}
