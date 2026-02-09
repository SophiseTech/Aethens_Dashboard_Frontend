import { get, post, put, del } from "@utils/Requests";

const inventoryAuditService = {
    /**
     * Create a new audit (Admin only)
     */
    createAudit: async (data) => {
        const response = await post("/v2/inventoryAudit", data);
        return response.data;
    },

    /**
     * Get audit by ID
     */
    getAuditById: async (id) => {
        const response = await get(`/v2/inventoryAudit/${id}`);
        return response.data;
    },

    /**
     * List audits with filters
     */
    listAudits: async (filters = {}) => {
        const response = await post("/v2/inventoryAudit/list", filters);
        return response.data;
    },

    /**
     * Update audit (Submit counts, update status)
     */
    updateAudit: async (id, data) => {
        const response = await put(`/v2/inventoryAudit/${id}`, data);
        return response.data;
    },

    /**
     * Delete audit (Admin only)
     */
    deleteAudit: async (id) => {
        const response = await del(`/v2/inventoryAudit/${id}`);
        return response;
    },
};

export default inventoryAuditService;
