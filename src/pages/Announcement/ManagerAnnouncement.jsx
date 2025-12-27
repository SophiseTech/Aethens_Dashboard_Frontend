import React, { useEffect } from "react";
import useAnnouncementStore from "@/stores/AnnouncementStore";
import AnnouncementList from "@/pages/Announcement/components/AnnouncementList";
import AnnouncementForm from "@/pages/Announcement/components/AnnouncementForm";
import DeleteModal from "@/pages/Announcement/components/DeleteModal";
import { Row } from "antd";
import AdminCenterSelector from "@components/AdminCenterSelector";
import { useStore } from "zustand";
import centersStore from "@stores/CentersStore";

export default function ManagerAnnouncementPage() {
  const { fetch } = useAnnouncementStore();
  const { selectedCenter } = useStore(centersStore);

  useEffect(() => {
    fetch();
  }, [selectedCenter]);

  return (
    <div className="mx-auto p-4">
      <Row justify="space-between">
        <h1 className="text-2xl font-bold mb-4">Announcements</h1>
        <AdminCenterSelector />
      </Row>
      <AnnouncementList />
      <AnnouncementForm />
      <DeleteModal />
    </div>
  );
}