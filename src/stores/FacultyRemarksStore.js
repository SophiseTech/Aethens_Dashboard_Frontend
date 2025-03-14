import facultyRemarksService from "@/services/FacultyRemarks";
import handleInternalError from "@utils/handleInternalError";
import handleSuccess from "@utils/handleSuccess";
import { create } from "zustand";

const facultyRemarksStore = create((set, get) => ({
  facultyRemarks: [],
  loading: true,
  createLoading: false,
  lastRefKey: 0,
  total: 0,
  getFacultyRemarks: async (filters, limit = 10, skip = 0) => {
    try {
      set({ loading: true });
      const { facultyRemarks: prevFacultyRemarks, lastRefKey } = get();
      const { facultyRemarks, total } = await facultyRemarksService.getFacultyRemarks(filters,skip, limit);

      if (facultyRemarks) {
        set({
          facultyRemarks: skip === 0 ? facultyRemarks : [...prevFacultyRemarks, ...facultyRemarks],
          lastRefKey: skip + facultyRemarks.length,
          total: total,
        });
      }
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ loading: false });
    }
  },
  editFacultyRemark: async (id, updateData) => {
    try {
      set({ createLoading: true });
      if (!id || !updateData) throw new Error("Bad Data");
      const { facultyRemarks } = get();
      const updatedRemark = await facultyRemarksService.editFacultyRemark(id, updateData);
      if (updatedRemark && facultyRemarks) {
        const updatedFacultyRemarks = facultyRemarks.map(item =>
          item._id === updatedRemark._id ? { ...item, ...updateData } : item
        );
        set({ facultyRemarks: updatedFacultyRemarks });
        handleSuccess("Faculty Remark Updated Successfully");
      }
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ createLoading: false });
    }
  },
  deleteFacultyRemark: async (id) => {
    try {
      set({ createLoading: true });
      if (!id) throw new Error("Bad Data");
      const { facultyRemarks } = get();
      await facultyRemarksService.deleteFacultyRemark(id);
      if (facultyRemarks) {
        const updatedFacultyRemarks = facultyRemarks.filter(remark => remark._id !== id);
        set({ facultyRemarks: updatedFacultyRemarks });
        handleSuccess("Faculty Remark Deleted Successfully");
      }
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ createLoading: false });
    }
  },
  createFacultyRemark: async (data) => {
    try {
      set({ createLoading: true });
      if (!data) throw new Error("Bad Data");
      const newFacultyRemark = await facultyRemarksService.createFacultyRemark(data);
      const { facultyRemarks } = get();
      set({
        facultyRemarks: [newFacultyRemark, ...facultyRemarks]
      })
      handleSuccess("Remark added succesfully")
      return newFacultyRemark;
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ createLoading: false });
    }
  },
}));

export default facultyRemarksStore;
