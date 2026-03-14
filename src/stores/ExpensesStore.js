import expenseService from "@/services/ExpenseService";
import handleInternalError from "@utils/handleInternalError";
import handleSuccess from "@utils/handleSuccess";
import _ from "lodash";
import { create } from "zustand";

const expensesStore = create((set, get) => ({
  // Expense list state
  expenses: [],
  expenseLoading: false,
  expenseTotal: 0,
  expenseLastRefKey: 0,
  expenseFilters: {},
  
  // Summary state (supports both category and date grouping)
  // summary: category-based (for backward compatibility with SummaryCard.jsx)
  // groupedResult: date-based (for IncomeChart.jsx)
  expenseSummary: {
    summary: [],      // For SummaryCard.jsx and LedgerDetails.jsx (category-based)
    groupedResult: [],  // For IncomeChart.jsx (date-based)
    grandTotal: 0,
  },

  // Fetch expenses list
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

  // Fetch expense summary (supports date-based or category-based grouping)
  getExpenseSummary: async (filters = {}, range = null) => {
    try {
      set({ expenseLoading: true });
      const result = await expenseService.getExpenseSummary(filters, range);
      if (result) set({ expenseSummary: result });
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ expenseLoading: false });
    }
  },

  // Create new expense
  createExpense: async (data) => {
    try {
      set({ createLoading: true });
      const newExpense = await expenseService.createExpense(data);
      if (newExpense) {
        set((state) => ({
          expenses: [newExpense, ...state.expenses],
          expenseTotal: state.expenseTotal + 1,
        }));
        handleSuccess("Expense logged successfully");
        return newExpense;
      }
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ createLoading: false });
    }
  },

  // Update existing expense
  updateExpense: async (id, data) => {
    try {
      set({ createLoading: true });
      const updated = await expenseService.updateExpense(id, data);
      if (updated) {
        set((state) => ({
          expenses: state.expenses.map((e) => (e._id === id ? { ...e, ...updated } : e)),
        }));
        handleSuccess("Expense updated successfully");
        return updated;
      }
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ createLoading: false });
    }
  },

  // Delete expense
  deleteExpense: async (id) => {
    try {
      set({ createLoading: true });
      await expenseService.deleteExpense(id);
      set((state) => ({
        expenses: state.expenses.filter((e) => e._id !== id),
        expenseTotal: state.expenseTotal - 1,
      }));
      handleSuccess("Expense deleted successfully");
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ createLoading: false });
    }
  },
}));

export default expensesStore;
