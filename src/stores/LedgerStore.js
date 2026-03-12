import expenseService from "@services/ExpenseService";
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
            const isLoadMore = options.loadMore;
            const LEDGERS_LIMIT = 10;
            
            if (isLoadMore) {
                if (get().ledgers.length >= get().ledgerTotal) return;
                set({ ledgersLoading: true });
            } else {
                set({ ledgersLoading: true, ledgers: [] });
            }

            const lastRef = isLoadMore ? get().ledgers.length : 0;
            const result = await expenseService.getLedgers({}, lastRef, LEDGERS_LIMIT);
            
            if (result) {
                const newLedgers = result.ledgers || [];
                set({
                    ledgers: isLoadMore ? [...get().ledgers, ...newLedgers] : newLedgers,
                    ledgerTotal: result.total || 0,
                });
                // Auto-select first ledger if none selected (skip if options.skipAutoSelect is true)
                if (!options.skipAutoSelect && newLedgers?.length > 0 && !get().selectedLedger) {
                    get().selectLedger(newLedgers[0]);
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
            get().getExpenses({ query: { ledger_id: ledger._id } });
            get().getExpenseSummary({ ledger_id: ledger._id });
        } else {
            // If clearing selection, maybe load global summary or nothing
            set({ expenseSummary: { summary: [], grandTotal: 0 } });
        }
    },

    createLedger: async (data) => {
        try {
            set({ createLoading: true });
            const newLedger = await expenseService.createLedger(data);
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
                if (selectedLedger) get().getExpenseSummary({ ledger_id: selectedLedger._id });
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
                if (selectedLedger) get().getExpenseSummary({ ledger_id: selectedLedger._id });
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
            if (selectedLedger) get().getExpenseSummary({ ledger_id: selectedLedger._id });
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
