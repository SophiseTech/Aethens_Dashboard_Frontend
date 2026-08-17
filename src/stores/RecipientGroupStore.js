import { create } from "zustand";
import {
  listRecipientGroups,
  createRecipientGroup,
  updateRecipientGroup,
  deleteRecipientGroup,
  previewSavedGroup,
  previewDraftGroup,
  importCsvRows,
} from "@/services/RecipientGroup";

const useRecipientGroupStore = create((set, get) => ({
  groups: [],
  loading: false,
  error: null,
  selected: null,
  modalOpen: false,
  deleteModalOpen: false,
  preview: null,
  previewLoading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const data = await listRecipientGroups();
      set({ groups: data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  create: async (payload) => {
    set({ loading: true });
    try {
      await createRecipientGroup(payload);
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
      await updateRecipientGroup(id, payload);
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
      await deleteRecipientGroup(id);
      await get().fetch();
      set({ deleteModalOpen: false, selected: null, loading: false });
    } catch (error) {
      set({ error, loading: false });
      throw error;
    }
  },

  previewSaved: async (id) => {
    set({ previewLoading: true });
    try {
      const data = await previewSavedGroup(id);
      set({ preview: data, previewLoading: false });
      return data;
    } catch (error) {
      set({ error, previewLoading: false });
      throw error;
    }
  },

  previewDraft: async (draft) => {
    set({ previewLoading: true });
    try {
      const data = await previewDraftGroup(draft);
      set({ preview: data, previewLoading: false });
      return data;
    } catch (error) {
      set({ error, previewLoading: false });
      throw error;
    }
  },

  importCsv: async (rows) => {
    return await importCsvRows(rows);
  },

  clearPreview: () => set({ preview: null }),
  setSelected: (selected) => set({ selected }),
  setModalOpen: (modalOpen) => set({ modalOpen }),
  setDeleteModalOpen: (deleteModalOpen) => set({ deleteModalOpen }),
}));

export default useRecipientGroupStore;
