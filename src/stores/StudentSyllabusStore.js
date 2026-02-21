import { create } from "zustand";
import studentSyllabusService from "@services/StudentSyllabusService";
import handleInternalError from "@utils/handleInternalError";
import handleSuccess from "@utils/handleSuccess";

const studentSyllabusStore = create((set, get) => ({
    syllabus: null,     // { student_id, course_id, images: [] }
    loading: false,
    saving: false,

    fetchSyllabus: async (studentId, courseId) => {
        try {
            set({ loading: true });
            const data = await studentSyllabusService.getSyllabus(studentId, courseId);
            set({ syllabus: data || { student_id: studentId, course_id: courseId, images: [] } });
        } catch (error) {
            handleInternalError(error);
        } finally {
            set({ loading: false });
        }
    },

    addImage: async (studentId, courseId, image) => {
        try {
            set({ saving: true });
            const data = await studentSyllabusService.addImage(studentId, courseId, image);
            if (data?.data) {
                set({ syllabus: data.data });
                handleSuccess("Image added to student syllabus");
            }
            return data?.data;
        } catch (error) {
            handleInternalError(error);
        } finally {
            set({ saving: false });
        }
    },

    removeImage: async (studentId, courseId, galleryImageId) => {
        try {
            set({ saving: true });
            const data = await studentSyllabusService.removeImage(studentId, courseId, galleryImageId);
            if (data?.data) {
                set({ syllabus: data.data });
                handleSuccess("Image removed from syllabus");
            }
        } catch (error) {
            handleInternalError(error);
        } finally {
            set({ saving: false });
        }
    },

    updateSyllabus: async (studentId, courseId, images) => {
        try {
            set({ saving: true });
            const data = await studentSyllabusService.updateSyllabus(studentId, courseId, images);
            if (data?.data) {
                set({ syllabus: data.data });
                handleSuccess("Student syllabus updated");
            }
            return data?.data;
        } catch (error) {
            handleInternalError(error);
        } finally {
            set({ saving: false });
        }
    },

    reset: () => set({ syllabus: null, loading: false, saving: false }),
}));

export default studentSyllabusStore;
