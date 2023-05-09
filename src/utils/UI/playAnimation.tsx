export function playAnimation(
  elementRef: React.RefObject<HTMLElement>,
  animation: string,
  endDelay: number = 0
) {
  const element = elementRef.current;
  if (element === null) return;

  element.dataset.animation = animation;
  element.addEventListener(
    "animationend",
    () => {
      if (endDelay) {
        setTimeout(() => {
          element.dataset.animation = "";
        }, endDelay);
        return;
      }
      element.dataset.animation = "";
    },
    { once: true }
  );
}
