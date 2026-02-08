import handleError from "@utils/handleError";
import { del, get, post, put } from "@utils/Requests";

/**
 * Get all targets with optional filters
 */
export const getTargets = async (params = {}) => {
    try {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/targets?${queryString}` : '/targets';
        const response = await get(endpoint);
        if (!response || !response.data)
            throw new Error("An error occurred. Please try again");
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

/**
 * Get single target by ID
 */
export const getTargetById = async (id) => {
    try {
        if (!id) throw new Error("Invalid target ID");
        const response = await get(`/targets/${id}`);
        if (!response || !response.data)
            throw new Error("An error occurred. Please try again");
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

/**
 * Create new target (Admin only)
 */
export const createTarget = async (targetData) => {
    try {
        const response = await post('/targets', targetData);
        if (!response || !response.data)
            throw new Error("An error occurred. Please try again");
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

/**
 * Update target
 */
export const updateTarget = async (id, targetData) => {
    try {
        if (!id) throw new Error("Invalid target ID");
        const response = await put(`/targets/${id}`, targetData);
        if (!response || !response.data)
            throw new Error("An error occurred. Please try again");
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

/**
 * Delete target
 */
export const deleteTarget = async (id) => {
    try {
        if (!id) throw new Error("Invalid target ID");
        const response = await del(`/targets/${id}`);
        if (!response) throw new Error("An error occurred. Please try again");
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

/**
 * Get target analytics for dashboard
 */
export const getAnalytics = async (params = {}) => {
    try {
        // Filter out 'all' value since backend treats it as no filter
        const filteredParams = { ...params };
        if (filteredParams.center === 'all') {
            delete filteredParams.center;
        }
        const queryString = new URLSearchParams(filteredParams).toString();
        const endpoint = queryString ? `/targets/analytics?${queryString}` : '/targets/analytics';
        const response = await get(endpoint);
        if (!response || !response.data)
            throw new Error("An error occurred. Please try again");
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

/**
 * Get real-time progress for a target
 */
export const getTargetProgress = async (id) => {
    try {
        if (!id) throw new Error("Invalid target ID");
        const response = await get(`/targets/${id}/progress`);
        if (!response || !response.data)
            throw new Error("An error occurred. Please try again");
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

/**
 * Get historical snapshots for a target
 */
export const getTargetHistory = async (id, params = {}) => {
    try {
        if (!id) throw new Error("Invalid target ID");
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/targets/${id}/history?${queryString}` : `/targets/${id}/history`;
        const response = await get(endpoint);
        if (!response || !response.data)
            throw new Error("An error occurred. Please try again");
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

/**
 * Get trend analysis for a target
 */
export const getTargetTrends = async (id, params = {}) => {
    try {
        if (!id) throw new Error("Invalid target ID");
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/targets/${id}/trends?${queryString}` : `/targets/${id}/trends`;
        const response = await get(endpoint);
        if (!response || !response.data)
            throw new Error("An error occurred. Please try again");
        return response.data;
    } catch (error) {
        handleError(error);
    }
};
