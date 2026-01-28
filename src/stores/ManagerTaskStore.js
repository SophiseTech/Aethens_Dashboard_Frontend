import { create } from "zustand";
import {
    getTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    addComment,
    getTaskById,
    getManagersWithPendingTasks,
} from "@/services/ManagerTask";

const useManagerTaskStore = create((set, get) => ({
    // State
    tasks: [],
    selectedTask: null,
    loading: false,
    error: null,

    // Pagination
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    },

    // Filters
    filters: {
        priority: null,
        status: null,
        assignedTo: null,
        search: "",
        deadlineFrom: null,
        deadlineTo: null,
        centerId: null,
        dueToday: false,
    },

    // UI State
    modalOpen: false,
    historyModalOpen: false,
    managersWithPending: [],
    selectedManagerFilter: null,

    // Actions
    fetch: async (page = 1) => {
        set({ loading: true, error: null });
        try {
            const { filters, pagination } = get();
            const cleanFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v != null && v !== "")
            );

            const data = await getTasks(cleanFilters, page, pagination.limit);

            set({
                tasks: data.tasks || [],
                pagination: {
                    page: data.page || 1,
                    limit: data.limit || 10,
                    total: data.total || 0,
                    totalPages: data.totalPages || 0,
                },
                loading: false,
            });
        } catch (error) {
            set({ error, loading: false });
        }
    },

    fetchById: async (id) => {
        set({ loading: true, error: null });
        try {
            const task = await getTaskById(id);
            set({ selectedTask: task, loading: false });
            return task;
        } catch (error) {
            set({ error, loading: false });
            throw error;
        }
    },

    create: async (payload) => {
        set({ loading: true, error: null });
        try {
            const task = await createTask(payload);
            await get().fetch(get().pagination.page);
            set({ modalOpen: false, loading: false });
            return task;
        } catch (error) {
            set({ error, loading: false });
            throw error;
        }
    },

    update: async (id, payload) => {
        set({ loading: true, error: null });
        try {
            const task = await updateTask(id, payload);
            await get().fetch(get().pagination.page);
            set({ modalOpen: false, selectedTask: null, loading: false });
            return task;
        } catch (error) {
            set({ error, loading: false });
            throw error;
        }
    },

    updateStatus: async (id, status) => {
        set({ loading: true, error: null });
        try {
            const task = await updateTaskStatus(id, status);
            // Update task in list
            set((state) => ({
                tasks: state.tasks.map((t) => (t._id === id ? task : t)),
                selectedTask: state.selectedTask?._id === id ? task : state.selectedTask,
                loading: false,
            }));
            return task;
        } catch (error) {
            set({ error, loading: false });
            throw error;
        }
    },

    addComment: async (id, text) => {
        set({ loading: true, error: null });
        try {
            const task = await addComment(id, text);
            set((state) => ({
                tasks: state.tasks.map((t) => (t._id === id ? task : t)),
                selectedTask: state.selectedTask?._id === id ? task : state.selectedTask,
                loading: false,
            }));
            return task;
        } catch (error) {
            set({ error, loading: false });
            throw error;
        }
    },

    fetchManagersWithPending: async (centerId) => {
        try {
            const data = await getManagersWithPendingTasks(centerId);
            set({ managersWithPending: data.managers || [] });
        } catch (error) {
            console.error("Error fetching managers with pending:", error);
        }
    },

    // Setters
    setFilters: (newFilters) =>
        set((state) => ({
            filters: { ...state.filters, ...newFilters },
        })),

    resetFilters: () =>
        set({
            filters: {
                priority: null,
                status: null,
                assignedTo: null,
                search: "",
                deadlineFrom: null,
                deadlineTo: null,
                centerId: null,
                dueToday: false,
            },
            selectedManagerFilter: null,
        }),

    setPage: (page) =>
        set((state) => ({
            pagination: { ...state.pagination, page },
        })),

    setSelectedTask: (task) => set({ selectedTask: task }),
    setModalOpen: (open) => set({ modalOpen: open }),
    setHistoryModalOpen: (open) => set({ historyModalOpen: open }),

    // Toggle manager filter for Managers-Pending list
    toggleManagerFilter: (managerId) => {
        const currentFilter = get().selectedManagerFilter;
        if (currentFilter === managerId) {
            set({ selectedManagerFilter: null });
            get().setFilters({ assignedTo: null });
        } else {
            set({ selectedManagerFilter: managerId });
            get().setFilters({ assignedTo: managerId });
        }
    },
}));

export default useManagerTaskStore;
