import { useEffect } from "react";

export function useHandleModalVisibility(
  isActive: boolean,
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>,
  modalRef: React.MutableRefObject<HTMLDialogElement | null>,
  allowDisableOnOverlay: boolean = true
) {
  useEffect(() => {
    const modal = modalRef.current as HTMLDialogElement;

    if (allowDisableOnOverlay) {
      modal.addEventListener("click", (e) => {
        const modalDimensions = modal.getBoundingClientRect();
        if (
          e.clientX < modalDimensions.left ||
          e.clientX > modalDimensions.right ||
          e.clientY < modalDimensions.top ||
          e.clientY > modalDimensions.bottom
        ) {
          setIsActive(false);
        }
      });
    }
  }, []);

  useEffect(() => {
    const modal = modalRef.current as HTMLDialogElement;

    if (isActive) {
      if (modal.open === true) return;

      modal.showModal();
      (document.activeElement as HTMLElement).blur();
    } else {
      modal.close();
    }
  }, [isActive]);
}
