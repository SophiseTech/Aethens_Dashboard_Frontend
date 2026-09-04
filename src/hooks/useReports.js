import { useStore } from 'zustand';
import reportStore from '@stores/ReportStore';

function useReports() {
  const {
    selectedMonth,
    loading,
    setSelectedMonth,
    downloadFinancialAuditReport,
    deactivatedStudents,
    deactivatedStudentsTotal,
    deactivatedStudentsLoading,
    deactivatedStudentsDownloading,
    deactivatedDateRange,
    setDeactivatedDateRange,
    getDeactivatedStudentsReport,
    downloadDeactivatedStudentsReport,
  } = useStore(reportStore);

  return {
    selectedMonth,
    loading,
    setSelectedMonth,
    downloadFinancialAuditReport,
    deactivatedStudents,
    deactivatedStudentsTotal,
    deactivatedStudentsLoading,
    deactivatedStudentsDownloading,
    deactivatedDateRange,
    setDeactivatedDateRange,
    getDeactivatedStudentsReport,
    downloadDeactivatedStudentsReport,
  };
}

export default useReports;
