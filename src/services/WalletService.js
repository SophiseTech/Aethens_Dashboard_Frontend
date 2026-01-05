import handleError from "@utils/handleError";
import { get, post } from "@utils/Requests";

// Temporary in-service dummy data for development / local testing
const DUMMY_WALLETS = [
  {
    _id: "wallet_1",
    student: {
      _id: "6817592a4e00310de79baf88",
      username: "Test Student",
      email: "test@student.com",
      profile_img: "https://app.schoolofathens.art/images/default.jpg",
      details_id: {
        admissionNumber: "SA25806",
        course: { course_name: "08-14 Years Beginner 2" },
      },
    },
    balance: 2500,
    currency: "INR",
    status: "active",
    totalCredited: 2000,
    totalDebited: 500,
    transactions: [
      {
        _id: "txn_1",
        type: "credit",
        amount: 2000,
        source: "manual_topup",
        notes: "Initial topup",
        createdAt: "2025-09-01T10:30:00Z",
      },
      {
        _id: "txn_2",
        type: "debit",
        amount: 500,
        source: "fee_deduction",
        notes: "August fees",
        createdAt: "2025-09-10T12:00:00Z",
        bill: { _id: "bill_1001", billNumber: "INV-1001" }
      },
    ],
    createdAt: "2025-09-01T10:00:00Z",
    updatedAt: "2025-09-10T12:00:00Z",
  },
  {
    _id: "wallet_2",
    student: {
      _id: "6823b8405a6ef8e731d86c4f",
      username: "Whitefield Student",
      email: "whitefield@student.com",
      profile_img: "https://app.schoolofathens.art/images/default.jpg",
      details_id: {
        admissionNumber: "SA25807",
        course: { course_name: "05-07 Years Level 1" },
      },
    },
    balance: 0,
    currency: "INR",
    status: "active",
    totalCredited: 0,
    totalDebited: 0,
    transactions: [
      {
        _id: "txn_w2_1",
        type: "debit",
        amount: 150,
        source: "fee_deduction",
        notes: "Course fees",
        createdAt: "2025-09-15T09:30:00Z",
        bill: { _id: "bill_2001", billNumber: "INV-2001" }
      }
    ],
    createdAt: "2025-09-05T09:00:00Z",
    updatedAt: "2025-09-05T09:00:00Z",
  },
];

function findDummyWallet(studentId) {
  if (!studentId) return null;
  return (
    DUMMY_WALLETS.find(
      (w) => w.student?._id === studentId || w._id === studentId || w.student?.details_id?.admissionNumber === studentId
    ) || null
  );
}

function createTransaction(type, amount, source = "manual", notes = "", bill = null) {
  const txn = {
    _id: `txn_${Math.random().toString(36).slice(2, 9)}`,
    type,
    amount,
    source,
    notes,
    createdAt: new Date().toISOString(),
  };

  if (bill) {
    txn.bill = bill;
  }

  return txn;
}

class WalletService {
  /**
   * Get all wallets (for wallet listing page)
   * Supports pagination & search
   */
  async getWallets(page = 1, limit = 10, searchQuery = null) {
    try {
      // const url = `/v3/wallet?page=${page}&limit=${limit}`;

      // const response = await get(url);
      // if (response && response.data) return response.data; // { wallets, total }

      // fallback to dummy
      const filtered = DUMMY_WALLETS.filter((w) => {
        if (!searchQuery) return true;
        const q = String(searchQuery).toLowerCase();
        return (
          String(w.student?.username || "").toLowerCase().includes(q) ||
          String(w.student?.details_id?.admissionNumber || "").toLowerCase().includes(q) ||
          String(w.student?.email || "").toLowerCase().includes(q)
        );
      });

      const start = (page - 1) * limit;
      const wallets = filtered.slice(start, start + limit);
      return { wallets, total: filtered.length };
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
