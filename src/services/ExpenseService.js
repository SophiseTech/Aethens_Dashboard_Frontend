import handleError from "@utils/handleError";
import { post, get, put, del } from "@utils/Requests";

class ExpenseService {
    /**
     * Fetch all ledgers (for the sidebar / dropdown)
     */
    async getLedgers(filters = {}, lastRef = 0, limit = 20) {
        try {
            const response = await post(`/v2/ledgers/getLedgers?lastRef=${lastRef}&limit=${limit}`, { filters });
            if (response && response.data) return response.data;
            return { ledgers: [], total: 0 };
        } catch (error) {
            return handleError(error);
        }
    }

    /**
     * Create a new ledger
     */
    async createLedger(data) {
        try {
            const response = await post(`/v2/ledgers`, data);
            if (response && response.data) return response.data;
            throw new Error("Failed to create ledger");
        } catch (error) {
            return handleError(error);
        }
    }

    /**
     * Update a ledger (name, status, vendor_name)
     */
    async updateLedger(id, data) {
        try {
            const response = await put(`/v2/ledgers/${id}`, data);
            if (response && response.data) return response.data;
            throw new Error("Failed to update ledger");
        } catch (error) {
            return handleError(error);
        }
    }

    /**
     * Fetch expenses list with pagination and optional filters
     */
    async getExpenses(filters = {}, lastRef = 0, limit = 20) {
        try {
            const response = await post(
                `/v2/expenses/getExpenses?limit=${limit}&lastRef=${lastRef}`,
                filters
            );
            if (response && response.data) return response.data;
            return { expenses: [], total: 0 };
        } catch (error) {
            return handleError(error);
        }
    }

    /**
     * Create a new expense record
     */
    async createExpense(data) {
        try {
            const response = await post(`/v2/expenses`, data);
            if (response && response.data) return response.data;
            throw new Error("Failed to create expense");
        } catch (error) {
            return handleError(error);
        }
    }

    /**
     * Update an expense record
     */
    async updateExpense(id, data) {
        try {
            const response = await put(`/v2/expenses/${id}`, data);
            if (response && response.data) return response.data;
            throw new Error("Failed to update expense");
        } catch (error) {
            return handleError(error);
        }
    }

    /**
     * Delete an expense record
     */
    async deleteExpense(id) {
        try {
            const response = await del(`/v2/expenses/${id}`);
            if (!response) throw new Error("Failed to delete expense");
            return response;
        } catch (error) {
            return handleError(error);
        }
    }

    /**
     * Get expense summary (category-wise totals or date-based grouping)
     * @param {object} filters - Filter parameters (from_date, to_date, center_id, ledger_id)
     * @param {string|null} range - Date grouping range: 'day', 'month', 'year', or null for category grouping
     */
    async getExpenseSummary(filters = {}, range = null) {
        try {
            const params = range ? { ...filters, range } : filters;
            const response = await post(`/v2/expenses/summary`, params);
            if (response && response.data) return response.data;
            return { summary: [], groupedResult: [], grandTotal: 0 };
        } catch (error) {
            return handleError(error);
        }
    }

    /**
     * Get expense summary by ledger (top 10 ledgers by expense)
     * @param {object} filters - Filter parameters (from_date, to_date)
     */
    async getExpenseByLedger(filters = {}) {
        try {
            const response = await post(`/v2/expenses/by-ledger`, filters);
            if (response && response.data) return response.data;
            return { summary: [], grandTotal: 0 };
        } catch (error) {
            return handleError(error);
        }
    }
}

const expenseService = new ExpenseService();
export default expenseService;

