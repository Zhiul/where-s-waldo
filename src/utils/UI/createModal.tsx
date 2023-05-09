import { ComponentType, useLayoutEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useLockedBody } from "usehooks-ts";

import { useWindowResolution } from "./useWindowResolution";
import { playAnimation } from "./playAnimation";

import { isNumber } from "lodash";

export function CreateModal<T>(
  Component: ComponentType<T>,
  ComponentProps: Omit<
    T,
    "isActive" | "setIsActive" | "processIsRunning" | "setProcessIsRunning"
  >,
  isActive: boolean,
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>,
  overlayClassName: string,
  animationDuration: number = 0,
  isPortal: boolean = false,
  maxWidth: number | "unset" = "unset"
) {
  const overlay = useRef(null);

  const isMounted = useRef(false);
  const [processIsRunning, setProcessIsRunning] = useState(false);
  const [animationIsRunning, setAnimationIsRunning] = useState(false);

  const windowResolution = useWindowResolution();

  const modal = (
    <div
      className="modal-wrapper"
      data-active={isActive}
      aria-hidden={!isActive}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div
        className={overlayClassName}
        data-active={isActive}
        onClick={(e) => {
          e.stopPropagation();
          setIsActive(false);
        }}
        ref={overlay}
      ></div>

      <Component
        isActive={isActive}
        setIsActive={setIsActive}
        processIsRunning={processIsRunning}
        setProcessIsRunning={setProcessIsRunning}
        {...(ComponentProps as T)}
      />
    </div>
  );

  useLayoutEffect(() => {
    if (isMounted.current === false) return;
    playAnimation(overlay, isActive ? "appearing" : "disappearing");
  }, [isActive]);

  useLayoutEffect(() => {
    if (isMounted.current === false) {
      isMounted.current = true;
      return;
    }

    if (isActive === false && animationDuration) {
      setAnimationIsRunning(true);

      setTimeout(() => {
        setAnimationIsRunning(false);
      }, animationDuration + 200);
    }
  }, [isActive, animationDuration]);

  if (isNumber(maxWidth) && isActive && windowResolution.width > maxWidth)
    setIsActive(false);

  useLockedBody(isActive);

  return (
    <>
      {isPortal
        ? (isActive || processIsRunning || animationIsRunning) &&
          createPortal(modal, document.body)
        : modal}
    </>
  );
}
