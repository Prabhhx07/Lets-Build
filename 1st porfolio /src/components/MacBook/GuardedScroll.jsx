import { useRef, useCallback } from "react";
import { useWheelGuard } from "./useWheelGuard.js";

/** A scrollable div that only keeps the mouse wheel when it really has something to scroll. */
export default function GuardedScroll({
  innerRef,
  className = "",
  children,
  ...rest
}) {
  const ref = useRef(null);
  useWheelGuard(ref);

  const setRef = useCallback(
    (el) => {
      ref.current = el;
      if (typeof innerRef === "function") innerRef(el);
      else if (innerRef) innerRef.current = el;
    },
    [innerRef],
  );

  return (
    <div ref={setRef} className={`overflow-y-auto ${className}`} {...rest}>
      {children}
    </div>
  );
}
