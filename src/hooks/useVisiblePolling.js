import { useEffect, useRef } from "react";

// Calls `callback` every `intervalMs` while the tab is visible, and once right
// away when the tab becomes visible again. Nothing runs while `enabled` is false.
function useVisiblePolling(callback, intervalMs, enabled = true) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return undefined;

    let timer = null;
    const start = () => {
      if (timer) return;
      timer = setInterval(() => callbackRef.current(), intervalMs);
    };
    const stop = () => {
      clearInterval(timer);
      timer = null;
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        callbackRef.current();
        start();
      } else {
        stop();
      }
    };

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [intervalMs, enabled]);
}

export default useVisiblePolling;
