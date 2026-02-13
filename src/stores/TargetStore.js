import { create } from 'zustand';
import * as TargetService from '@services/TargetService';
import handleInternalError from '@utils/handleInternalError';
import handleSuccess from '@utils/handleSuccess';

const useTargetStore = create((set, get) => ({
    targets: [],
    loading: false,
    error: null,
    analytics: null,
    analyticsLoading: false, // Separate loading state for analytics

    /**
     * Fetch all targets with optional filters
     */
    getTargets: async (filters = {}) => {
        try {
            set({ loading: true, error: null });
            // TargetService.getTargets already returns response.data (the targets array)
            const targets = await TargetService.getTargets(filters);
            if (targets) {
                set({
                    targets: targets || [],
                    loading: false
                });
                return targets;
            }
            set({ loading: false, targets: [] });
        } catch (error) {
            set({
                error: error.message,
                loading: false,
                targets: []
            });
            handleInternalError(error);
        }
    },


    /**
     * Get target analytics
     */
    getAnalytics: async (params = {}) => {
        // Prevent multiple simultaneous calls
        if (get().analyticsLoading) return;

        try {
            set({ analyticsLoading: true, error: null });
            const analytics = await TargetService.getAnalytics(params);
            // TargetService.getAnalytics already returns the analytics object directly
            if (analytics) {
                set({
                    analytics: analytics,
                    analyticsLoading: false
                });
                return analytics;
            }
            set({ analyticsLoading: false });
        } catch (error) {
            set({
                error: error.message,
                analyticsLoading: false,
                analytics: null
            });
            handleInternalError(error);
        }
    },

    /**
     * Get target by ID
     */
    getTargetById: async (id) => {
        try {
            set({ loading: true, error: null });
            const response = await TargetService.getTargetById(id);
            set({ loading: false });
            return response.data;
        } catch (error) {
            set({ error: error.message, loading: false });
            handleInternalError(error);
        }
    },

    /**
     * Create new target
     */
    createTarget: async (targetData) => {
        try {
            set({ loading: true, error: null });
            const response = await TargetService.createTarget(targetData);
            if (!response) return;

            set({ loading: false });
            handleSuccess('Target created successfully');

            // Refresh targets list and analytics
            get().getTargets();
            get().getAnalytics();
            return response;
        } catch (error) {
            set({ error: error.message, loading: false });
            handleInternalError(error);
        }
    },

    /**
     * Update target
     */
    updateTarget: async (id, targetData) => {
        try {
            set({ loading: true, error: null });
            const response = await TargetService.updateTarget(id, targetData);
            if (!response) return;

            set({ loading: false });
            handleSuccess('Target updated successfully');

            // Refresh targets list
            get().getTargets();
            return response.data;
        } catch (error) {
            set({ error: error.message, loading: false });
            handleInternalError(error);
        }
    },

    /**
     * Delete target
     */
    deleteTarget: async (id) => {
        try {
            set({ loading: true, error: null });
            await TargetService.deleteTarget(id);
            set({ loading: false });
            handleSuccess('Target deleted successfully');

            // Refresh targets list
            get().getTargets();
        } catch (error) {
            set({ error: error.message, loading: false });
            handleInternalError(error);
        }
    },

    /**
     * Get real-time progress for a target
     */
    getTargetProgress: async (id) => {
        try {
            const response = await TargetService.getTargetProgress(id);
            return response;
        } catch (error) {
            handleInternalError(error);
        }
    },

    /**
     * Get historical snapshots for a target
     */
    getTargetHistory: async (id, params = {}) => {
        try {
            const response = await TargetService.getTargetHistory(id, params);
            return response;
        } catch (error) {
            handleInternalError(error);
        }
    },

    /**
     * Get trend analysis for a target
     */
    getTargetTrends: async (id, params = {}) => {
        try {
            const response = await TargetService.getTargetTrends(id, params);
            return response;
        } catch (error) {
            handleInternalError(error);
        }
    },

    /**
     * Clear error
     */
    clearError: () => set({ error: null }),
}));

export default useTargetStore;
