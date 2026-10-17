import { create } from "zustand";
import {
  listWhatsAppTemplates,
  createWhatsAppTemplate,
  updateWhatsAppTemplate,
  deleteWhatsAppTemplate,
  submitTemplateToMeta,
  syncTemplateStatus,
} from "@/services/WhatsAppTemplate";

// In-flight lookups by "name:language", so concurrent callers share one request.
const pendingTemplateLookups = new Map();
const templateKey = (name, language) => `${name}:${language}`;

const useWhatsAppTemplateStore = create((set, get) => ({
  templates: [],
  // Single-template cache for features that need one known template (e.g. the fee
  // reminder preview): key "name:language" → template, or null when it doesn't
  // exist. Absent key = not loaded yet.
  templatesByKey: {},
  loading: false,
  error: null,
  selected: null,
  modalOpen: false,
  deleteModalOpen: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const data = await listWhatsAppTemplates();
      // Every admin create/update/delete/sync ends here, so also drop the
      // single-template cache to avoid serving a stale template to ensureTemplate.
      set({ templates: data, templatesByKey: {}, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // Loads one template by name/language at most once per session (a missing template
  // is cached as null, so it isn't re-requested). Concurrent calls share one request.
  ensureTemplate: async (name, language = "en") => {
    const key = templateKey(name, language);
    if (key in get().templatesByKey) return get().templatesByKey[key];
    if (pendingTemplateLookups.has(key)) return pendingTemplateLookups.get(key);

    const lookup = listWhatsAppTemplates({ name, language })
      .then((data) => {
        const template = data?.[0] || null;
        set((state) => ({ templatesByKey: { ...state.templatesByKey, [key]: template } }));
        return template;
      })
      .catch((error) => {
        // Not cached: a transient failure can be retried on the next open.
        set({ error });
        return null;
      })
      .finally(() => pendingTemplateLookups.delete(key));

    pendingTemplateLookups.set(key, lookup);
    return lookup;
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
