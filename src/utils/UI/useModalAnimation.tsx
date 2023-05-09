import { useEffect, useRef } from "react";
import { playAnimation } from "./playAnimation";

export const useModalAnimation = (
  element: React.RefObject<HTMLElement>,
  isActive: boolean,
  isPortal = false
) => {
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isPortal && isMounted.current === false) {
      isMounted.current = true;
      return;
    }
    const animation = isActive ? "opening" : "closing";
    playAnimation(element, animation);
  }, [isActive, element, isPortal]);
};
