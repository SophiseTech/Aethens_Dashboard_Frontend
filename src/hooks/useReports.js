import { useStore } from 'zustand';
import reportStore from '@stores/ReportStore';

function useReports() {
  const {
    selectedMonth,
    loading,
    setSelectedMonth,
    downloadFinancialAuditReport,
  } = useStore(reportStore);

  return {
    selectedMonth,
    loading,
    setSelectedMonth,
    downloadFinancialAuditReport,
  };
}

export default useReports;
