import React, { useEffect } from "react";
import useAnnouncementStore from "@/stores/AnnouncementStore";
import AnnouncementList from "@/pages/Announcement/components/AnnouncementList";
import AnnouncementForm from "@/pages/Announcement/components/AnnouncementForm";
import DeleteModal from "@/pages/Announcement/components/DeleteModal";

export default function ManagerAnnouncementPage() {
  const { fetch } = useAnnouncementStore();

  useEffect(() => {
    fetch();
  }, []);

  return (
    <div className="mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Announcements</h1>
      <AnnouncementList />
      <AnnouncementForm />
      <DeleteModal />
    </div>
  );
}