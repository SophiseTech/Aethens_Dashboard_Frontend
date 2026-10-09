import { useCallback, useEffect, useMemo, useState } from "react";

// Menu keys (from the student menu config in Sidebar.jsx) that get a bottom tab.
// Every other student menu item is listed in the "More" sheet.
export const STUDENT_TAB_KEYS = ["dashboard", "slots", "attendance", "bills"];

// Scopes the student UI styles in index.css. It sits on <html> rather than a wrapper
// so it also reaches Ant Design modals and drawers, which render in a body portal.
const STUDENT_UI_CLASS = "student-ui";
// Lets the student UI draw under the notch / home indicator; the tab bar and header
// pad themselves with env(safe-area-inset-*), which is 0 without viewport-fit=cover.
const STUDENT_VIEWPORT = "width=device-width, initial-scale=1.0, viewport-fit=cover";

const useStudentMobileNav = ({ menuItems, selectedKey, onNavigate, onProfile }) => {
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    const previousViewport = viewport?.getAttribute("content");
    document.documentElement.classList.add(STUDENT_UI_CLASS);
    viewport?.setAttribute("content", STUDENT_VIEWPORT);
    return () => {
      document.documentElement.classList.remove(STUDENT_UI_CLASS);
      if (previousViewport) viewport?.setAttribute("content", previousViewport);
    };
  }, []);

  const tabItems = useMemo(
    () => STUDENT_TAB_KEYS.map((key) => menuItems.find((item) => item.key === key)).filter(Boolean),
    [menuItems],
  );
  const moreItems = useMemo(
    () => menuItems.filter((item) => item.path && !STUDENT_TAB_KEYS.includes(item.key)),
    [menuItems],
  );
  const moreActive = Boolean(selectedKey) && !STUDENT_TAB_KEYS.includes(selectedKey);

  const openMore = useCallback(() => setMoreOpen(true), []);
  const closeMore = useCallback(() => setMoreOpen(false), []);

  const navigateTo = useCallback(
    (key) => {
      setMoreOpen(false);
      onNavigate({ key });
    },
    [onNavigate],
  );

  const openProfile = useCallback(() => {
    setMoreOpen(false);
    onProfile();
  }, [onProfile]);

  return { tabItems, moreItems, moreActive, moreOpen, openMore, closeMore, navigateTo, openProfile };
};

export default useStudentMobileNav;
