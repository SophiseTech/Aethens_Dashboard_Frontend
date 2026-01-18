import enquiryService from "@/services/Enquiry";
import handleInternalError from "@utils/handleInternalError";
import handleSuccess from "@utils/handleSuccess";
import { create } from "zustand";

const enquiryStore = create((set, get) => ({
  enquiries: [],
  loading: true,
  total: 0,
  enquiry: {},
  searchResults: [],
  searchTotal: 0,
  searchQuery: "",
  demoSlots: {},

  // Fetch enquiries list with pagination
  getEnquiries: async (limit = 10, page = 1, filters = {}) => {
    try {
      set({ loading: true });

      const { enquiries, total } = await enquiryService.getEnquiries(
        page,
        limit,
        filters
      );

      if (enquiries) {
        console.log(enquiries);
        set({ enquiries, total });
      }
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ loading: false });
    }
  },

  bookDemoSlot: async (id, slotData) => {
    try {
      set({ loading: true });

      const response = await enquiryService.bookDemoSlot(id, slotData);
      if (!response) return;

      // const updatedEnquiries = enquiries.map((item) =>
      //   item._id === id ? { ...item, demoSlot: response.data.demoSlot } : item
      // );

      // set({ enquiries: updatedEnquiries });
      handleSuccess("Demo slot booked successfully");
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ loading: false });
    }
  },

  addfollowUpDate: async (id, slotData) => {
    try {
      set({ loading: true });

      const response = await enquiryService.addFollowUpDate(id, slotData);
      if (!response) return;

      handleSuccess("Followup Date Updated successfully");
    } catch (error) {
      handleInternalError(error);
    }
    finally {
      set({ loading: false })
    }
  },

  rescheduleSlot: async (id, slotData) => {
    try {
      set({ loading: true });

      const response = await enquiryService.rescheduleSlot(id, slotData);
      if (!response) return;

      handleSuccess("Demo Slot rescheduled successfully");
    } catch (error) {
      handleInternalError(error);
    }
    finally {
      set({ loading: false })
    }
  },

  enrollStudent: async (id, payload) => {
    try {
      set({ loading: true });

      const response = await enquiryService.enrollStudent(id, payload);
      if (!response) return;

      handleSuccess("Student Enrolled Successfully");
    } catch (error) {
      handleInternalError(error);
    }
    finally {
      set({ loading: false })
    }
  },

  markDemoCompleted: async (id, notes) => {
    try {
      set({ loading: true });
      const { enquiries } = get();

      const response = await enquiryService.markDemoCompleted(id, { notes });
      if (!response) return;

      // const updatedEnquiries = enquiries.map((item) =>
      //   item._id === id
      //     ? {
      //         ...item,
      //         demoSlot: {
      //           ...item.demoSlot,
      //           status: "Completed",
      //           notes,
      //         },
      //       }
      //     : item
      // );

      // set({ enquiries: updatedEnquiries });
      handleSuccess("Demo marked as completed");
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ loading: false });
    }
  },

  getDemoSlots: async ({ selectedView }) => {
    try {
      set({ loading: true });
      const response = await enquiryService.getDemoSlots({ selectedView });
      if (response) {
        set({ demoSlots: response });
      }
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ loading: false });
    }
  },

  addEnquiry: async (data) => {
    try {
      set({ loading: true });
      const { enquiries } = get();

      const response = await enquiryService.createEnquiry(data);
      if (!response) return;

      set({ enquiries: [response.data, ...enquiries] });
      handleSuccess("Enquiry added successfully");
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ loading: false });
    }
  },

  // Search enquiries
  search: async (limit, filters = {}, page = 1) => {
    try {
      set({ loading: true });

      const offset = (page - 1) * limit;
      const { enquiries, total } = await enquiryService.search(
        offset,
        limit,
        filters
      );

      if (enquiries) {
        set({
          searchResults: enquiries,
          searchTotal: total,
          searchQuery: filters.searchQuery,
        });
      }
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ loading: false });
    }
  },

  // Set search query
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Update enquiry
  editEnquiry: async (id, updateData) => {
    try {
      set({ loading: true });
      const { enquiries, searchResults, searchQuery } = get();

      const response = await enquiryService.updateEnquiry(id, updateData);
      if (!response) return;

      if (searchQuery) {
        const updated = searchResults.map((item) =>
          item._id === id ? { ...item, ...updateData } : item
        );
        set({ searchResults: updated });
      } else {
        const updated = enquiries.map((item) =>
          item._id === id ? { ...item, ...updateData } : item
        );
        set({ enquiries: updated });
      }

      handleSuccess("Enquiry updated successfully");
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ loading: false });
    }
  },

  // Fetch single enquiry detail
  getEnquiryDetails: async (id) => {
    try {
      set({ loading: true });
      const enquiry = await enquiryService.getEnquiryDetails(id);
      set({ enquiry });
      return enquiry;
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ loading: false });
    }
  },
}));

export default enquiryStore;
