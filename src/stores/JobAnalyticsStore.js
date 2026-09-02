import { create } from "zustand";
import { listJobs, listJobRuns, getRunRecipients } from "@/services/JobAnalytics";

const useJobAnalyticsStore = create((set) => ({
  jobs: [],
  jobsLoading: false,

  runs: [],
  runsTotal: 0,
  runsLoading: false,

  recipients: [],
  recipientsTotal: 0,
  selectedRun: null,
  recipientsLoading: false,

  error: null,

  fetchJobs: async () => {
    set({ jobsLoading: true });
    try {
      const jobs = await listJobs();
      set({ jobs, jobsLoading: false });
    } catch (error) {
      set({ error, jobsLoading: false });
    }
  },

  fetchRuns: async (params) => {
    set({ runsLoading: true });
    try {
      const data = await listJobRuns(params);
      set({ runs: data.runs, runsTotal: data.total, runsLoading: false });
    } catch (error) {
      set({ error, runsLoading: false });
    }
  },

  fetchRecipients: async (params) => {
    set({ recipientsLoading: true });
    try {
      const data = await getRunRecipients(params);
      set({
        recipients: data.recipients,
        recipientsTotal: data.total,
        selectedRun: data.run,
        recipientsLoading: false,
      });
    } catch (error) {
      set({ error, recipientsLoading: false });
    }
  },

  clearRecipients: () => set({ recipients: [], recipientsTotal: 0, selectedRun: null }),
}));

export default useJobAnalyticsStore;
