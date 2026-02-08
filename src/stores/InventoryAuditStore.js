import inventoryAuditService from "@services/InventoryAudit";
import handleInternalError from "@utils/handleInternalError";
import handleSuccess from "@utils/handleSuccess";
import { create } from "zustand";

const inventoryAuditStore = create((set, get) => ({
    audits: [],
    selectedAudit: null,
    loading: false,
    createLoading: false,
    total: 0,

    /**
     * Fetch audits with filters
     */
    getAudits: async (filters = {}) => {
        try {
            set({ loading: true });
            const { audits, total } = await inventoryAuditService.listAudits(filters);
            if (audits) {
                set({ audits, total });
            }
        } catch (error) {
            handleInternalError(error);
        } finally {
            set({ loading: false });
        }
    },

    /**
     * Fetch audit by ID
     */
    getAuditById: async (id) => {
        try {
            set({ loading: true });
            const audit = await inventoryAuditService.getAuditById(id);
            if (audit) {
                set({ selectedAudit: audit });
            }
            return audit;
        } catch (error) {
            handleInternalError(error);
        } finally {
            set({ loading: false });
        }
    },

    /**
     * Create new audit (Admin only)
     */
    createAudit: async (data) => {
        try {
            set({ createLoading: true });
            const newAudit = await inventoryAuditService.createAudit(data);
            if (newAudit) {
                const { audits } = get();
                set({ audits: [newAudit, ...audits] });
                handleSuccess("Audit created successfully");
                return newAudit;
            }
        } catch (error) {
            handleInternalError(error);
        } finally {
            set({ createLoading: false });
        }
    },

    /**
     * Update audit (Submit counts, status)
     */
    updateAudit: async (id, data) => {
        try {
            set({ createLoading: true });
            const updatedAudit = await inventoryAuditService.updateAudit(id, data);
            if (updatedAudit) {
                const { audits } = get();
                const updatedAudits = audits.map((audit) =>
                    audit._id === id ? updatedAudit : audit
                );
                set({ audits: updatedAudits, selectedAudit: updatedAudit });
                handleSuccess("Audit updated successfully");
                return updatedAudit;
            }
        } catch (error) {
            handleInternalError(error);
        } finally {
            set({ createLoading: false });
        }
    },

    /**
     * Delete audit (Admin only)
     */
    deleteAudit: async (id) => {
        try {
            set({ createLoading: true });
            await inventoryAuditService.deleteAudit(id);
            const { audits } = get();
            const filteredAudits = audits.filter((audit) => audit._id !== id);
            set({ audits: filteredAudits });
            handleSuccess("Audit deleted successfully");
        } catch (error) {
            handleInternalError(error);
        } finally {
            set({ createLoading: false });
        }
    },

    /**
     * Reset selected audit
     */
    clearSelectedAudit: () => set({ selectedAudit: null }),
}));

export default inventoryAuditStore;
