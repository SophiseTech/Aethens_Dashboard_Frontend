import handleError from "@utils/handleError";
import { post, get } from "@utils/Requests";

class ExpenseService {
    /**
     * Fetch all ledgers (for the dropdown in the expense form)
     */
    async getLedgers(filters = {}) {
        try {
            const response = await post(`/v2/ledgers/getLedgers`, { filters });
            if (response && response.data) return response.data;
            return { ledgers: [], total: 0 };
        } catch (error) {
            return handleError(error);
        }
    }

    /**
     * Create a new ledger (auto-created when a user types a new name)
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
     * Fetch expenses list with pagination and optional date range
     */
    async getExpenses(filters = {}, page = 1, limit = 10) {
        try {
            const response = await post(
                `/v2/expenses/getExpenses?limit=${limit}&lastRef=${(page - 1) * limit}`,
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
     * Get expense summary (category-wise totals) for the dashboard
     */
    async getExpenseSummary(filters = {}) {
        try {
            const response = await post(`/v2/expenses/summary`, filters);
            if (response && response.data) return response.data;
            return { summary: [], grandTotal: 0 };
        } catch (error) {
            return handleError(error);
        }
    }
}

const expenseService = new ExpenseService();
export default expenseService;
