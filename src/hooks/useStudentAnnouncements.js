import { useEffect, useMemo } from "react";
import useAnnouncementStore from "@/stores/AnnouncementStore";

function useStudentAnnouncements() {
  const { activeAnnouncements, activeLoading, fetchActive } = useAnnouncementStore();

  useEffect(() => {
    fetchActive();
  }, []);

  const announcements = useMemo(
    () =>
      (activeAnnouncements || [])
        .slice()
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [activeAnnouncements]
  );

  return {
    announcements,
    loading: activeLoading,
  };
}

export default useStudentAnnouncements;
