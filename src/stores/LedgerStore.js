import expenseService from "@services/ExpenseService";
import userStore from "@stores/UserStore";
import centersStore from "@stores/CentersStore";
import handleInternalError from "@utils/handleInternalError";
import handleSuccess from "@utils/handleSuccess";
import _ from "lodash";
import { create } from "zustand";

const ledgerStore = create((set, get) => ({
    // ── Ledger state ───────────────────────────────────────────────────────────
    ledgers: [],
    selectedLedger: null,
    ledgersLoading: false,
    createLoading: false,
    ledgerTotal: 0,
    ledgerLastRefKey: 0,

    // ── Expense state ──────────────────────────────────────────────────────────
    expenses: [],
    expenseSummary: { summary: [], grandTotal: 0 },
    expenseLoading: false,
    expenseTotal: 0,
    expenseLastRefKey: 0,
    expenseFilters: {},

    // ── Ledger actions ─────────────────────────────────────────────────────────
    getLedgers: async (options = {}) => {
        try {
            set({ ledgersLoading: true });
            const result = await expenseService.getLedgers({});
            if (result) {
                set({
                    ledgers: result.ledgers || [],
                    ledgerTotal: result.total || 0,
                });
                // Auto-select first ledger if none selected (skip if options.skipAutoSelect is true)
                if (!options.skipAutoSelect && result.ledgers?.length > 0 && !get().selectedLedger) {
                    get().selectLedger(result.ledgers[0]);
                }
            }
        } catch (error) {
            handleInternalError(error);
        } finally {
            set({ ledgersLoading: false });
        }
    },

    selectLedger: (ledger) => {
        set({ selectedLedger: ledger, expenses: [], expenseLastRefKey: 0, expenseFilters: {} });
        if (ledger?._id) {
            const { user } = userStore.getState();
            const { selectedCenter } = centersStore.getState();
            const effectiveCenterId = user?.center_id || (selectedCenter !== 'all' ? selectedCenter : undefined);
            get().getExpenses({ query: { ledger_id: ledger._id } });
            get().getExpenseSummary({ ledger_id: ledger._id, center_id: effectiveCenterId });
        } else {
            // If clearing selection, maybe load global summary or nothing
            set({ expenseSummary: { summary: [], grandTotal: 0 } });
        }
    },

    createLedger: async (data) => {
        try {
            set({ createLoading: true });
            const { user } = userStore.getState();
            const newLedger = await expenseService.createLedger({ ...data, center_id: user?.center_id });
            if (newLedger) {
                set((state) => ({ ledgers: [newLedger, ...state.ledgers] }));
                handleSuccess("Ledger created successfully");
                return newLedger;
            }
        } catch (error) {
            handleInternalError(error);
        } finally {
            set({ createLoading: false });
        }
    },

    updateLedger: async (id, data) => {
        try {
            set({ createLoading: true });
            const updated = await expenseService.updateLedger(id, data);
            if (updated) {
                set((state) => ({
                    ledgers: state.ledgers.map((l) => (l._id === id ? { ...l, ...updated } : l)),
                    selectedLedger: state.selectedLedger?._id === id ? { ...state.selectedLedger, ...updated } : state.selectedLedger,
                }));
                handleSuccess("Ledger updated successfully");
                return updated;
            }
        } catch (error) {
            handleInternalError(error);
        } finally {
            set({ createLoading: false });
        }
    },

    // ── Expense actions ────────────────────────────────────────────────────────
    getExpenses: async (customFilters = {}, loadMore = false) => {
        try {
            set({ expenseLoading: true });
            const { expenseLastRefKey, expenses: prevExpenses, expenseFilters: stateFilters } = get();

            const isNewFilter = !_.isEqual(stateFilters, customFilters);
            const lastRef = isNewFilter || !loadMore ? 0 : expenseLastRefKey;

            const result = await expenseService.getExpenses(customFilters, lastRef, 20);
            if (result) {
                const merged = loadMore && !isNewFilter ? [...prevExpenses, ...result.expenses] : result.expenses;
                set({
                    expenses: merged,
                    expenseTotal: result.total || 0,
                    expenseLastRefKey: lastRef + (result.expenses?.length || 0),
                    expenseFilters: customFilters,
                });
            }
        } catch (error) {
            handleInternalError(error);
        } finally {
            set({ expenseLoading: false });
        }
    },

    createExpense: async (data) => {
        try {
            set({ createLoading: true });
            const newExpense = await expenseService.createExpense(data);
            if (newExpense) {
                set((state) => ({
                    expenses: [newExpense, ...state.expenses],
                    expenseTotal: state.expenseTotal + 1,
                }));
                // Refresh summary
                const { selectedLedger } = get();
                const { user } = userStore.getState();
                const { selectedCenter } = centersStore.getState();
                const effectiveCenterId = user?.center_id || (selectedCenter !== 'all' ? selectedCenter : undefined);
                if (selectedLedger) get().getExpenseSummary({ ledger_id: selectedLedger._id, center_id: effectiveCenterId });
                handleSuccess("Expense logged successfully");
                return newExpense;
            }
        } catch (error) {
            handleInternalError(error);
        } finally {
            set({ createLoading: false });
        }
    },

    updateExpense: async (id, data) => {
        try {
            set({ createLoading: true });
            const updated = await expenseService.updateExpense(id, data);
            if (updated) {
                set((state) => ({
                    expenses: state.expenses.map((e) => (e._id === id ? { ...e, ...updated } : e)),
                }));
                const { selectedLedger } = get();
                const { user } = userStore.getState();
                const { selectedCenter } = centersStore.getState();
                const effectiveCenterId = user?.center_id || (selectedCenter !== 'all' ? selectedCenter : undefined);
                if (selectedLedger) get().getExpenseSummary({ ledger_id: selectedLedger._id, center_id: effectiveCenterId });
                handleSuccess("Expense updated successfully");
                return updated;
            }
        } catch (error) {
            handleInternalError(error);
        } finally {
            set({ createLoading: false });
        }
    },

    deleteExpense: async (id) => {
        try {
            set({ createLoading: true });
            await expenseService.deleteExpense(id);
            set((state) => ({
                expenses: state.expenses.filter((e) => e._id !== id),
                expenseTotal: state.expenseTotal - 1,
            }));
            const { selectedLedger } = get();
            const { user } = userStore.getState();
            const { selectedCenter } = centersStore.getState();
            const effectiveCenterId = user?.center_id || (selectedCenter !== 'all' ? selectedCenter : undefined);
            if (selectedLedger) get().getExpenseSummary({ ledger_id: selectedLedger._id, center_id: effectiveCenterId });
            handleSuccess("Expense deleted successfully");
        } catch (error) {
            handleInternalError(error);
        } finally {
            set({ createLoading: false });
        }
    },

    getExpenseSummary: async (filters = {}) => {
        try {
            const result = await expenseService.getExpenseSummary(filters);
            if (result) set({ expenseSummary: result });
        } catch (error) {
            handleInternalError(error);
        }
    },
}));

export default ledgerStore;
