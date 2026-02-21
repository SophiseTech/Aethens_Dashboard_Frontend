import { get, post, put, del } from "@utils/Requests";
import handleError from "@utils/handleError";

class StudentSyllabusService {
    async getSyllabus(studentId, courseId) {
        try {
            const response = await get(`/v2/student-syllabus/${studentId}/${courseId}`);
            if (!response) throw new Error("Failed to fetch student syllabus");
            return response.data;
        } catch (error) {
            handleError(error);
        }
    }

    async updateSyllabus(studentId, courseId, images) {
        try {
            const response = await put(`/v2/student-syllabus/${studentId}/${courseId}`, { images });
            if (!response) throw new Error("Failed to update student syllabus");
            return response.data;
        } catch (error) {
            handleError(error);
        }
    }

    async addImage(studentId, courseId, image) {
        try {
            const response = await post(`/v2/student-syllabus/${studentId}/${courseId}/add-image`, image);
            if (!response) throw new Error("Failed to add image to student syllabus");
            return response.data;
        } catch (error) {
            handleError(error);
        }
    }

    async removeImage(studentId, courseId, galleryImageId) {
        try {
            const response = await del(`/v2/student-syllabus/${studentId}/${courseId}/image/${galleryImageId}`);
            if (!response) throw new Error("Failed to remove image from student syllabus");
            return response.data;
        } catch (error) {
            handleError(error);
        }
    }
}

export default new StudentSyllabusService();
