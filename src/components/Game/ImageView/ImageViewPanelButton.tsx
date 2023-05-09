import { ViewerAction } from "./ImageView";

interface ImageViewPanelButtonProps {
  viewerAction: ViewerAction;
  setViewerAction: React.Dispatch<React.SetStateAction<ViewerAction>>;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  viewerActionValue: ViewerAction;
  shortcut: string;
}

export function ImageViewPanelButton({
  viewerAction,
  setViewerAction,
  Icon,
  viewerActionValue,
  shortcut,
}: ImageViewPanelButtonProps) {
  function setButtonViewerActionValue() {
    setViewerAction(viewerActionValue);
  }

  const isSelected = viewerAction === viewerActionValue;

  return (
    <div className="image-view-button-wrapper">
      <button
        className="image-view-button"
        onClick={setButtonViewerActionValue}
        aria-current={isSelected}
        aria-label={"Enable " + viewerActionValue}
      >
        <Icon aria-hidden="true" />
      </button>

      <div className="image-view-button-tooltip" role="tooltip">
        <div className="image-view-button-tooltip-heading">
          {viewerActionValue}
        </div>
        <span className="image-view-button-tooltip-shortcut">{shortcut}</span>
      </div>
    </div>
  );
}
