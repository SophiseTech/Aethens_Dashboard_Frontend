import { useEffect, useState } from "react";
import { useStore } from "zustand";
import diplomaPreRegStore from "@stores/DiplomaPreRegStore";
import diplomaPreRegService from "@/services/DiplomaPreReg";
import handleSuccess from "@utils/handleSuccess";

function usePreRegistrationManager() {
  const {
    applications,
    appLoading,
    pagination,
    filters,
    fetchApplications,
    setFilters,
    resetFilters,
    approveApplication,
    rejectApplication,
  } = useStore(diplomaPreRegStore);

  const [approveModal, setApproveModal] = useState({ open: false, application: null });
  const [rejectModal, setRejectModal] = useState({ open: false, application: null });
  const [drawer, setDrawer] = useState({ open: false, application: null, loading: false });

  useEffect(() => {
    fetchApplications(1);
  }, []);

  const handleTabChange = (status) => {
    setFilters({ status });
    fetchApplications(1);
  };

  const handleFilterApply = (formattedFilters) => {
    const { createdAt, ...rest } = formattedFilters;
    const dateFilters = createdAt
      ? { dateFrom: createdAt.$gte || null, dateTo: createdAt.$lte || null }
      : {};
    setFilters({ ...rest, ...dateFilters });
    fetchApplications(1);
  };

  const handleFilterReset = () => {
    resetFilters();
    fetchApplications(1);
  };

  const handlePageChange = (page) => {
    fetchApplications(page);
  };

  const openDrawer = async (record) => {
    setDrawer({ open: true, application: null, loading: true });
    const data = await diplomaPreRegService.getApplicationById(record._id);
    setDrawer({ open: true, application: data || null, loading: false });
  };
  const closeDrawer = () => setDrawer({ open: false, application: null, loading: false });

  const openApproveModal = (application) => setApproveModal({ open: true, application });
  const closeApproveModal = () => setApproveModal({ open: false, application: null });

  const openRejectModal = (application) => setRejectModal({ open: true, application });
  const closeRejectModal = () => setRejectModal({ open: false, application: null });

  const handleApprove = async (data) => {
    await approveApplication(approveModal.application._id, data);
    handleSuccess("Application approved successfully");
    closeApproveModal();
  };

  const handleReject = async (data) => {
    await rejectApplication(rejectModal.application._id, data);
    handleSuccess("Application rejected");
    closeRejectModal();
  };

  return {
    applications,
    appLoading,
    pagination,
    filters,
    drawer,
    approveModal,
    rejectModal,
    handleTabChange,
    handleFilterApply,
    handleFilterReset,
    handlePageChange,
    openDrawer,
    closeDrawer,
    openApproveModal,
    closeApproveModal,
    openRejectModal,
    closeRejectModal,
    handleApprove,
    handleReject,
  };
}

export default usePreRegistrationManager;
