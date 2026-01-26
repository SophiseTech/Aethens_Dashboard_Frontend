import { post, get, put } from "@utils/Requests";

/**
 * Get tasks with filters and pagination
 */
export async function getTasks(filters = {}, page = 1, limit = 10, sort = { deadline: 1 }) {
    try {
        const res = await post("/tasks/list", {
            filters,
            page,
            limit,
            sort,
        });
        return res.data;
    } catch (error) {
        console.log("Error fetching tasks:", error);
        throw error;
    }
}

/**
 * Get single task by ID
 */
export async function getTaskById(id) {
    try {
        const res = await get(`/tasks/${id}`);
        return res.data;
    } catch (error) {
        console.log("Error fetching task:", error);
        throw error;
    }
}

/**
 * Create a new task
 */
export async function createTask(data) {
    try {
        const res = await post("/tasks", data);
        return res.data;
    } catch (error) {
        console.log("Error creating task:", error);
        throw error;
    }
}

/**
 * Update task
 */
export async function updateTask(id, data) {
    try {
        const res = await put(`/tasks/${id}`, data);
        return res.data;
    } catch (error) {
        console.log("Error updating task:", error);
        throw error;
    }
}

/**
 * Update task status
 */
export async function updateTaskStatus(id, status) {
    try {
        const res = await put(`/tasks/${id}/status`, { status });
        return res.data;
    } catch (error) {
        console.log("Error updating task status:", error);
        throw error;
    }
}

/**
 * Add comment to task
 */
export async function addComment(id, text) {
    try {
        const res = await post(`/tasks/${id}/comment`, { text });
        return res.data;
    } catch (error) {
        console.log("Error adding comment:", error);
        throw error;
    }
}

/**
 * Get managers with pending tasks
 */
export async function getManagersWithPendingTasks(centerId) {
    try {
        const res = await post("/tasks/list", {
            filters: { showManagersPending: true, centerId },
        });
        return res.data;
    } catch (error) {
        console.log("Error fetching managers with pending tasks:", error);
        throw error;
    }
}
