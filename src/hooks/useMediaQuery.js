import { useCallback, useSyncExternalStore } from "react";

// Matches Tailwind's `lg` breakpoint — where the sidebar layout takes over.
export const DESKTOP_QUERY = "(min-width: 1024px)";

// Reads the result synchronously on first render, so the right layout mounts
// immediately instead of rendering the wrong one and swapping after an effect.
function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export default useMediaQuery;
