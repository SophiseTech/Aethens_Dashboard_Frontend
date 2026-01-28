import React, { useEffect } from "react";
import useAnnouncementStore from "@/stores/AnnouncementStore";
import AnnouncementList from "@/pages/Announcement/components/AnnouncementList";
import AnnouncementForm from "@/pages/Announcement/components/AnnouncementForm";
import DeleteModal from "@/pages/Announcement/components/DeleteModal";
import { useStore } from "zustand";
import centersStore from "@stores/CentersStore";
import Title from "@components/layouts/Title";

export default function ManagerAnnouncementPage() {
  const { fetch } = useAnnouncementStore();
  const { selectedCenter } = useStore(centersStore);

  useEffect(() => {
    fetch();
  }, [selectedCenter]);

  return (
    <div className="mx-auto p-4">
      <Title title="Announcements" />
      <AnnouncementList />
      <AnnouncementForm />
      <DeleteModal />
    </div>
  );
}