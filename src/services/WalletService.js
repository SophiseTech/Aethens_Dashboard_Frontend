import handleError from "@utils/handleError";
import { get, post } from "@utils/Requests";

class WalletService {
  /**
   * Get all wallets (for wallet listing page)
   * Supports pagination & search
   */
  async getWallets(page = 1, limit = 10, searchQuery = null) {
    try {
      let url = `/v3/wallet?page=${page}&limit=${limit}`;

      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }

      const response = await get(url);
      if (!response || !response.data) {
        throw new Error("Failed to fetch wallets");
      }

      return response.data; // { wallets, total }
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Get single wallet details
   */
  async getWalletByStudentId(studentId) {
    try {
      if (!studentId) throw new Error("Invalid student ID");

      const response = await get(`/v3/wallet/${studentId}`);
      if (!response || !response.data) {
        throw new Error("Failed to fetch wallet");
      }

      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Manual top-up by manager
   */
  async topUpWallet(studentId, payload) {
    try {
      if (!studentId || !payload?.amount) {
        throw new Error("Invalid top-up data");
      }

      const response = await post(
        `/v3/wallet/${studentId}/topup`,
        payload
      );

      if (!response || !response.data) {
        throw new Error("Wallet top-up failed");
      }

      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Deduct amount from wallet (used during billing)
   */
  async deductFromWallet(studentId, payload) {
    try {
      if (!studentId || !payload?.amount) {
        throw new Error("Invalid deduction data");
      }

      const response = await post(
        `/v3/wallet/${studentId}/deduct`,
        payload
      );

      if (!response || !response.data) {
        throw new Error("Wallet deduction failed");
      }

      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Wallet transaction history
   */
  async getWalletTransactions(studentId) {
    try {
      if (!studentId) throw new Error("Invalid student ID");

      const response = await get(
        `/v3/wallet/${studentId}/transactions`
      );

      if (!response || !response.data) {
        throw new Error("Failed to fetch wallet transactions");
      }

      return response.data; // { transactions }
    } catch (error) {
      handleError(error);
    }
  }
}

const walletService = new WalletService();
export default walletService;
