import { create } from "zustand";
import {
  listEnquiryDocumentSets,
  createEnquiryDocumentSet,
  updateEnquiryDocumentSet,
  deleteEnquiryDocumentSet,
} from "@/services/EnquiryDocumentSet";

const useEnquiryDocumentSetStore = create((set, get) => ({
  documentSets: [],
  loading: false,
  error: null,
  selected: null,
  modalOpen: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const data = await listEnquiryDocumentSets();
      set({ documentSets: data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  create: async (payload) => {
    set({ loading: true });
    try {
      await createEnquiryDocumentSet(payload);
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
      await updateEnquiryDocumentSet(id, payload);
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
      await deleteEnquiryDocumentSet(id);
      await get().fetch();
      set({ selected: null, loading: false });
    } catch (error) {
      set({ error, loading: false });
      throw error;
    }
  },

  setSelected: (selected) => set({ selected }),
  setModalOpen: (modalOpen) => set({ modalOpen }),
}));

export default useEnquiryDocumentSetStore;
