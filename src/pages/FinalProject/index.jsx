import React, { Suspense, useEffect } from "react";
import userStore from "@stores/UserStore";
import { useStore } from "zustand";
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
const StudentView = React.lazy(() =>
  import("@pages/FinalProject/Components/FinalProjectStudentView")
);

const ManagerView = React.lazy(() =>
  import("@pages/FinalProject/Components/FinalProjectManagerView")
);
// Status Configuration
export const statusConfig = {
  'not_started': { color: 'default', icon: <InfoCircleOutlined />, text: 'Not Started' },
  'under_review': { color: 'processing', icon: <ClockCircleOutlined />, text: 'Under Review' },
  'approved': { color: 'success', icon: <CheckCircleOutlined />, text: 'Approved' },
  'rejected': { color: 'error', icon: <CloseCircleOutlined />, text: 'Rejected' },
  'no_phases': { color: 'warning', icon: <InfoCircleOutlined />, text: 'No Phases' },
};

// Status Configuration
export const projectStatusConfig = {
  'not_started': { color: 'default', icon: <InfoCircleOutlined />, text: 'Not Started' },
  'active': { color: 'processing', icon: <ClockCircleOutlined className="text-blue-500" />, text: 'Active' },
  'completed': { color: 'success', icon: <CheckCircleOutlined className="text-green-500" />, text: 'Completed' },
  'archived': { color: 'warning', icon: <ClockCircleOutlined className="text-orange-500" />, text: 'Archived' },
  'no_phases': { color: 'red', icon: <InfoCircleOutlined />, text: 'No Phases' },
};

export default function FinalProjectPage() {
  const { user } = useStore(userStore);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {user.role === "student" ? (
        <StudentView />
      ) : ["manager", "admin", "academic_manager"].includes(user.role) ? (
        <ManagerView />
      ) : (
        <p>Unauthorized</p>
      )}
    </Suspense>
  );
}
