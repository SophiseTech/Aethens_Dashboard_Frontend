import { create } from "zustand";
import {
  listWhatsAppTemplates,
  createWhatsAppTemplate,
  updateWhatsAppTemplate,
  deleteWhatsAppTemplate,
  submitTemplateToMeta,
  syncTemplateStatus,
} from "@/services/WhatsAppTemplate";

const useWhatsAppTemplateStore = create((set, get) => ({
  templates: [],
  loading: false,
  error: null,
  selected: null,
  modalOpen: false,
  deleteModalOpen: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const data = await listWhatsAppTemplates();
      set({ templates: data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  create: async (payload) => {
    set({ loading: true });
    try {
      await createWhatsAppTemplate(payload);
      await get().fetch();
      set({ modalOpen: false, loading: false });
    } catch (error) {
      set({ error, loading: false });
      throw error;
    }
  },

  update: async (id, payload) => {
    set({ loading: true });
    try {
      await updateWhatsAppTemplate(id, payload);
      await get().fetch();
      set({ modalOpen: false, selected: null, loading: false });
    } catch (error) {
      set({ error, loading: false });
      throw error;
    }
  },

  remove: async (id) => {
    set({ loading: true });
    try {
      await deleteWhatsAppTemplate(id);
      await get().fetch();
      set({ deleteModalOpen: false, selected: null, loading: false });
    } catch (error) {
      set({ error, loading: false });
      throw error;
    }
  },

  submitToMeta: async (id) => {
    set({ loading: true });
    try {
      await submitTemplateToMeta(id);
      await get().fetch();
      set({ loading: false });
    } catch (error) {
      set({ error, loading: false });
      throw error;
    }
  },

  syncStatus: async (id) => {
    set({ loading: true });
    try {
      await syncTemplateStatus(id);
      await get().fetch();
      set({ loading: false });
    } catch (error) {
      set({ error, loading: false });
      throw error;
    }
  },

  setSelected: (selected) => set({ selected }),
  setModalOpen: (modalOpen) => set({ modalOpen }),
  setDeleteModalOpen: (deleteModalOpen) => set({ deleteModalOpen }),
}));

export default useWhatsAppTemplateStore;
