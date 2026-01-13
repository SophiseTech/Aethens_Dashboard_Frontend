import handleError from "@utils/handleError";
import { post } from "@utils/Requests";

class WalletService {
  /**
   * Get all wallets (for wallet listing page)
   * Supports pagination & search
   */
  // async getWallets(page = 1, limit = 10, searchQuery = null) {
  //   try {
  //     // const url = `/v3/wallet?page=${page}&limit=${limit}`;

  //     // const response = await get(url);
  //     // if (response && response.data) return response.data; // { wallets, total }

  //     // fallback to dummy
  //     const filtered = DUMMY_WALLETS.filter((w) => {
  //       if (!searchQuery) return true;
  //       const q = String(searchQuery).toLowerCase();
  //       return (
  //         String(w.student?.username || "").toLowerCase().includes(q) ||
  //         String(w.student?.details_id?.admissionNumber || "").toLowerCase().includes(q) ||
  //         String(w.student?.email || "").toLowerCase().includes(q)
  //       );
  //     });

  //     const start = (page - 1) * limit;
  //     const wallets = filtered.slice(start, start + limit);
  //     return { wallets, total: filtered.length };
  //   } catch (error) {
  //     handleError(error);
  //   }
  // }

  /**
   * Get single wallet details
   */
  async getWalletByStudentId(studentId) {
    try {
      if (!studentId) throw new Error("Invalid student ID");

      const response = await post(`/v2/wallet/getWallet`, { filters: { query: { owner: studentId } } });
      if (response && response.data) return response.data;

      throw new Error("Wallet not found");
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Manual top-up by manager
   */
  async topUpWallet(payload) {
    try {
      if (!payload?.amount) {
        throw new Error("Invalid top-up data");
      }

      const response = await post(`/v2/wallet/transactions`, payload);
      if (response && response.data) return response.data;

      throw new Error("Top-up failed");

    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Deduct amount from wallet (used during billing)
   */
  async deductFromWallet(payload) {
    try {
      if (!payload?.amount) {
        throw new Error("Invalid deduction data");
      }

      const response = await post(`/v2/wallet/transactions`, payload);
      if (response && response.data) return response.data;

      throw new Error("Deduction failed");
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Wallet transaction history
   */
  async getWalletTransactions(walletId, page = 1, limit = 10) {
    try {
      if (!walletId) throw new Error("Invalid wallet ID");

      const response = await post(`/v2/wallet/transactions/getTransactions?page=${page}&limit=${limit}`, { filters: { query: { wallet: walletId } } });
      if (response && response.data) return response.data;

      return { transactions: [], total: 0 };
    } catch (error) {
      return handleError(error);
    }
  }
}

const walletService = new WalletService();
export default walletService;
