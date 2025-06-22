import { create } from "zustand"

import {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "@/services/Announcement";

const useAnnouncementStore = create((set, get) => ({
  announcements: [],
  loading: false,
  error: null,
  selected: null,
  modalOpen: false,
  deleteModalOpen: false,
  filter: { status: "all", search: "" },

  fetch: async () => {
    set({ loading: true });
    try {
      const data = await listAnnouncements();
      set({ announcements: data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  create: async (payload) => {
    set({ loading: true });
    try {
      await createAnnouncement(payload);
      await get().fetch();
      set({ modalOpen: false, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  update: async (id, payload) => {
    set({ loading: true });
    try {
      await updateAnnouncement(id, payload);
      await get().fetch();
      set({ modalOpen: false, selected: null, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  remove: async (id) => {
    set({ loading: true });
    try {
      await deleteAnnouncement(id);
      await get().fetch();
      set({ deleteModalOpen: false, selected: null, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  setSelected: (selected) => set({ selected }),
  setModalOpen: (modalOpen) => set({ modalOpen }),
  setDeleteModalOpen: (deleteModalOpen) => set({ deleteModalOpen }),
  setFilter: (filter) =>
    set((state) => ({ filter: { ...state.filter, ...filter } })),
}));

export default useAnnouncementStore;