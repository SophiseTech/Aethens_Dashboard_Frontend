import { create } from "zustand";
import {
  listCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  queueCampaign,
  pauseCampaign,
  resumeCampaign,
  cancelCampaign,
} from "@/services/Campaign";

const useCampaignStore = create((set, get) => ({
  campaigns: [],
  loading: false,
  error: null,
  selected: null,
  detail: null,
  modalOpen: false,
  detailDrawerOpen: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const data = await listCampaigns();
      set({ campaigns: data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  fetchDetail: async (id) => {
    set({ loading: true });
    try {
      const data = await getCampaign(id);
      set({ detail: data, loading: false });
      return data;
    } catch (error) {
      set({ error, loading: false });
      throw error;
    }
  },

  create: async (payload) => {
    set({ loading: true });
    try {
      const data = await createCampaign(payload);
      await get().fetch();
      set({ modalOpen: false, loading: false });
      return data;
    } catch (error) {
      set({ error, loading: false });
      throw error;
    }
  },

  update: async (id, payload) => {
    set({ loading: true });
    try {
      await updateCampaign(id, payload);
      await get().fetch();
      set({ modalOpen: false, selected: null, loading: false });
    } catch (error) {
      set({ error, loading: false });
      throw error;
    }
  },

  queue: async (id) => {
    set({ loading: true });
    try {
      await queueCampaign(id);
      await get().fetch();
      set({ loading: false });
    } catch (error) {
      set({ error, loading: false });
      throw error;
    }
  },

  pause: async (id) => {
    await pauseCampaign(id);
    await get().fetch();
  },

  resume: async (id) => {
    await resumeCampaign(id);
    await get().fetch();
  },

  cancel: async (id) => {
    await cancelCampaign(id);
    await get().fetch();
  },

  setSelected: (selected) => set({ selected }),
  setModalOpen: (modalOpen) => set({ modalOpen }),
  setDetailDrawerOpen: (detailDrawerOpen) => set({ detailDrawerOpen }),
}));

export default useCampaignStore;
