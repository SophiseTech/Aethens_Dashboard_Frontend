import { create } from "zustand";
import { getDashboardKpis, getCampaignsOverview, getTemplatePerformance, getCampaignFunnel } from "@/services/WhatsAppAnalytics";

const useWhatsAppAnalyticsStore = create((set) => ({
  kpis: null,
  campaignsOverview: [],
  templatePerformance: [],
  funnel: null,
  loading: false,
  error: null,

  fetchDashboard: async (params) => {
    set({ loading: true });
    try {
      const [kpis, campaignsOverview, templatePerformance] = await Promise.all([
        getDashboardKpis(params),
        getCampaignsOverview(params),
        getTemplatePerformance(params),
      ]);
      set({ kpis, campaignsOverview, templatePerformance, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  fetchFunnel: async (campaignId) => {
    try {
      const funnel = await getCampaignFunnel(campaignId);
      set({ funnel });
      return funnel;
    } catch (error) {
      set({ error });
      throw error;
    }
  },
}));

export default useWhatsAppAnalyticsStore;
