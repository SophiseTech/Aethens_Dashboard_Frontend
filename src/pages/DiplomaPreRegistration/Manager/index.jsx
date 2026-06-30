import { Segmented } from "antd";
import { useEffect, useState } from "react";
import Filters from "@components/Filters";
import diplomaBatchService from "@/services/DiplomaBatch";
import ApplicationsTable from "./components/ApplicationsTable";
import ApproveModal from "./components/ApproveModal";
import RejectModal from "./components/RejectModal";
import usePreRegistrationManager from "./hooks/usePreRegistrationManager";
import Title from "@components/layouts/Title";

const TAB_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "completed" },
  { label: "Rejected", value: "rejected" },
];

function DiplomaPreRegistrationManager() {
  const {
    applications,
    appLoading,
    pagination,
    filters,
    approveModal,
    rejectModal,
    handleTabChange,
    handleFilterApply,
    handleFilterReset,
    handlePageChange,
    openApproveModal,
    closeApproveModal,
    openRejectModal,
    closeRejectModal,
    handleApprove,
    handleReject,
  } = usePreRegistrationManager();

  const [batchOptions, setBatchOptions] = useState([]);

  useEffect(() => {
    diplomaBatchService.getActiveBatches().then((data) => {
      setBatchOptions((data || []).map((b) => ({ value: b._id, label: b.name })));
    });
  }, []);

  const filterConfig = [
    { key: "search", type: "input", placeholder: "Search by name or phone" },
    { key: "batchId", type: "select", placeholder: "Filter by batch", options: batchOptions },
    { key: "createdAt", type: "range", placeholder: ["From", "To"] },
  ];

  return (
    <Title title={"Diploma Pre-Registrations"}>
      <div className="flex flex-col gap-4">
        <Segmented
          options={TAB_OPTIONS}
          value={filters.status}
          onChange={handleTabChange}
          className="self-start"
        />

        <Filters
          filters={filterConfig}
          onApply={handleFilterApply}
          onReset={handleFilterReset}
        />

        <ApplicationsTable
          applications={applications}
          loading={appLoading}
          pagination={pagination}
          activeStatus={filters.status}
          onPageChange={handlePageChange}
          onApprove={openApproveModal}
          onReject={openRejectModal}
        />

        <ApproveModal
          open={approveModal.open}
          application={approveModal.application}
          onConfirm={handleApprove}
          onCancel={closeApproveModal}
        />

        <RejectModal
          open={rejectModal.open}
          application={rejectModal.application}
          onConfirm={handleReject}
          onCancel={closeRejectModal}
        />
      </div>
    </Title>
  );
}

export default DiplomaPreRegistrationManager;
