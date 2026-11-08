import paymentLinksService from "@services/PaymentLinks";
import handleSuccess from "@utils/handleSuccess";
import { create } from "zustand";

const byAmount = (a, b) => a.amount - b.amount;

// Admin list of amount → payment link mappings. Errors are already shown by the
// service (handleError); actions re-throw so the caller can keep its form open.
const paymentLinkStore = create((set, get) => ({
  links: [],
  loading: false,
  saving: false,

  getLinks: async () => {
    try {
      set({ loading: true });
      const links = await paymentLinksService.list();
      set({ links: [...links].sort(byAmount) });
    } catch {
      set({ links: [] });
    } finally {
      set({ loading: false });
    }
  },

  saveLink: async (id, values) => {
    try {
      set({ saving: true });
      const saved = id ? await paymentLinksService.update(id, values) : await paymentLinksService.create(values);
      const others = get().links.filter((link) => link._id !== saved._id);
      set({ links: [...others, saved].sort(byAmount) });
      handleSuccess(id ? "Payment link updated" : "Payment link added");
      return saved;
    } finally {
      set({ saving: false });
    }
  },

  deleteLink: async (id) => {
    await paymentLinksService.remove(id);
    set({ links: get().links.filter((link) => link._id !== id) });
    handleSuccess("Payment link deleted");
  },
}));

export default paymentLinkStore;
