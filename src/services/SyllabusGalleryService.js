import handleError from "@utils/handleError";
import { get, post, put, del } from "@utils/Requests";

class SyllabusGalleryService {
    /**
     * Get all syllabus gallery images
     * @returns {Promise<Array>} Array of gallery images
     */
    async getSyllabusGalleryImages() {
        try {
            const response = await get("/v2/syllabusGallery");
            if (!response || !response.data)
                throw new Error("An error occurred. Please try again");
            return response;
        } catch (error) {
            handleError(error);
            throw error;
        }
    }

    /**
     * Get single syllabus gallery image by ID
     * @param {string} id - Image ID
     * @returns {Promise} Gallery image object
     */
    async getSyllabusGalleryImageById(id) {
        try {
            if (!id) throw new Error("Invalid image ID");
            const response = await get(`/v2/syllabusGallery/${id}`);
            if (!response || !response.data)
                throw new Error("An error occurred. Please try again");
            return response;
        } catch (error) {
            handleError(error);
            throw error;
        }
    }

    /**
     * Create new syllabus gallery image
     * @param {Object} data - Image data
     * @param {string} data.name - Image name
     * @param {string} data.url - Image URL
     * @returns {Promise} Created gallery image
     */
    async createSyllabusGalleryImage(data) {
        try {
            if (!data.name || !data.url) {
                throw new Error("Please fill all required fields");
            }
            const response = await post("/v2/syllabusGallery", data);
            if (!response || !response.data)
                throw new Error("An error occurred. Please try again");
            return response;
        } catch (error) {
            handleError(error);
            throw error;
        }
    }

    /**
     * Update syllabus gallery image
     * @param {string} id - Image ID
     * @param {Object} data - Updated image data
     * @returns {Promise} Updated gallery image
     */
    async updateSyllabusGalleryImage(id, data) {
        try {
            if (!id) throw new Error("Invalid image ID");
            if (!data.name || !data.url) {
                throw new Error("Please fill all required fields");
            }
            const response = await put(`/v2/syllabusGallery/${id}`, data);
            if (!response || !response.data)
                throw new Error("An error occurred. Please try again");
            return response;
        } catch (error) {
            handleError(error);
            throw error;
        }
    }

    /**
     * Delete syllabus gallery image
     * @param {string} id - Image ID
     * @returns {Promise} Deleted gallery image
     */
    async deleteSyllabusGalleryImage(id) {
        try {
            if (!id) throw new Error("Invalid image ID");
            const response = await del(`/v2/syllabusGallery/${id}`);
            if (!response) throw new Error("An error occurred. Please try again");
            return response;
        } catch (error) {
            handleError(error);
            throw error;
        }
    }
}

export default new SyllabusGalleryService();
