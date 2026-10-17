import centersStore from "@stores/CentersStore";
import { useFinalProjectStore } from "@stores/FinalProjectV2";
import userStore from "@stores/UserStore";
import { ROLES } from "@utils/constants";
import { debounce } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "zustand";

export const PENDING_FINAL_PROJECT_ENROLLMENT_OPTIONS = [
  { label: "All", value: "" },
  { label: "Completed", value: "completed" },
  { label: "Migrated", value: "migrated" },
];

const DEFAULT_PAGINATION = { page: 1, limit: 10 };

// Active students whose course ended (completed/migrated) without a final project being created.
export const usePendingFinalProjects = () => {
  const {
    pendingFinalProjects,
    pendingFinalProjectsTotal,
    pendingFinalProjectsLoading,
    listPendingFinalProjects
  } = useFinalProjectStore();
  const { selectedCenter } = useStore(centersStore);
  const { user } = useStore(userStore);

  const [filters, setFilters] = useState({ courseId: undefined, enrollmentStatus: "", continuingOnly: false });
  const [studentName, setStudentName] = useState("");
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);

  const canPickCenter = user.role === ROLES.ADMIN || user.role === ROLES.ACADEMIC_MANAGER;

  useEffect(() => {
    listPendingFinalProjects({
      ...filters,
      studentName,
      centerId: canPickCenter && selectedCenter ? selectedCenter : undefined,
    }, pagination).catch(() => { });
  }, [filters, studentName, pagination, selectedCenter, canPickCenter, listPendingFinalProjects]);

  const handleFiltersChange = (changedValues) => {
    setFilters((prev) => ({ ...prev, ...changedValues }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSearch = useMemo(
    () => debounce((value) => {
      setStudentName(value.trim());
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300),
    []
  );

  useEffect(() => () => handleSearch.cancel(), [handleSearch]);

  const handlePaginationChange = (page, limit) => setPagination({ page, limit });

  return {
    students: pendingFinalProjects,
    total: pendingFinalProjectsTotal,
    loading: pendingFinalProjectsLoading,
    filters,
    pagination,
    handleFiltersChange,
    handleSearch,
    handlePaginationChange,
  };
};
