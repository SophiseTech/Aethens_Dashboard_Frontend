import React, { Suspense } from "react";
import userStore from "@stores/UserStore";
import { useStore } from "zustand";
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";

// Status Configuration
export const statusConfig = {
  'not_started': { color: 'default', icon: <InfoCircleOutlined />, text: 'Not Started' },
  'under_review': { color: 'processing', icon: <ClockCircleOutlined />, text: 'Under Review' },
  'approved': { color: 'success', icon: <CheckCircleOutlined />, text: 'Approved' },
  'rejected': { color: 'error', icon: <CloseCircleOutlined />, text: 'Rejected' }
};

export default function FinalProjectPage() {
  const { user } = useStore(userStore);

  let LazyComponent = null;
  if (user.role === "student") {
    LazyComponent = React.lazy(() => import("@pages/FinalProject/Components/FinalProjectStudentView"));
  } else if (user.role === "manager") {
    LazyComponent = React.lazy(() => import("@pages/FinalProject/Components/FinalProjectManagerView"));
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {LazyComponent ? <LazyComponent /> : <p>Unauthorized</p>}
    </Suspense>
  );
}
