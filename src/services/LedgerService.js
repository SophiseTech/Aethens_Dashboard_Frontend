import handleError from "@utils/handleError";
import { get, post, put, del } from "@utils/Requests";

class LedgerService {
    async getLedgers(filters = {}, lastRefKey = 0, limit = 20) {
        try {
            const response = await post(`/api/v2/ledgers/getLedgers?lastRef=${lastRefKey}&limit=${limit}`, { filters });
            if (!response || !response.data) throw new Error("An error occurred. Please try again");
            return response.data;
        } catch (error) {
            handleError(error);
        }
    }

    async getLedger(id) {
        try {
            const response = await get(`/api/v2/ledgers/${id}`);
            if (!response || !response.data) throw new Error("An error occurred. Please try again");
            return response.data;
        } catch (error) {
            handleError(error);
        }
    }

    async createLedger(data) {
        try {
            const response = await post(`/api/v2/ledgers`, data);
            if (!response || !response.data) throw new Error("An error occurred. Please try again");
            return response.data;
        } catch (error) {
            handleError(error);
        }
    }

    async updateLedger(id, data) {
        try {
            const response = await put(`/api/v2/ledgers/${id}`, data);
            if (!response || !response.data) throw new Error("An error occurred. Please try again");
            return response.data;
        } catch (error) {
            handleError(error);
        }
    }
}

const ledgerService = new LedgerService();
export default ledgerService;
