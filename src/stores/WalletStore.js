import { create } from "zustand";
import handleInternalError from "@utils/handleInternalError";

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
        course: {
          course_name: "08-14 Years Beginner 2",
        },
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
        course: {
          course_name: "05-07 Years Level 1",
        },
      },
    },

    balance: 0,
    currency: "INR",
    status: "active",

    totalCredited: 0,
    totalDebited: 0,

    transactions: [],

    createdAt: "2025-09-05T09:00:00Z",
    updatedAt: "2025-09-05T09:00:00Z",
  },
];



const walletStore = create((set, get) => ({
  wallets: [],
  loading: false,
  total: 0,
  searchQuery: null,

  // Dummy fetch
  getWallets: async (limit = 10, page = 1) => {
    try {
      set({ loading: true });

      // simulate API delay
      await new Promise((res) => setTimeout(res, 400));

      set({
        wallets: DUMMY_WALLETS.slice(0, limit),
        total: DUMMY_WALLETS.length,
      });
    } catch (e) {
      handleInternalError(e);
    } finally {
      set({ loading: false });
    }
  },

  // Dummy top-up
  topUpWallet: async (walletId, payload) => {
    try {
      const { wallets } = get();

      const updated = wallets.map((w) => {
        if (w._id !== walletId) return w;

        return {
          ...w,
          balance: w.balance + payload.amount,
          transactions: [
            {
              _id: crypto.randomUUID(),
              type: "credit",
              amount: payload.amount,
              source: "manual_topup",
              notes: payload.notes || "",
              createdAt: new Date().toISOString(),
            },
            ...w.transactions,
          ],
        };
      });

      set({ wallets: updated });
    } catch (e) {
      handleInternalError(e);
    }
  },

  // Dummy deduction
  deductWallet: async (walletId, payload) => {
    try {
      const { wallets } = get();

      const updated = wallets.map((w) => {
        if (w._id !== walletId) return w;

        if (w.balance < payload.amount) {
          throw new Error("Insufficient wallet balance");
        }

        return {
          ...w,
          balance: w.balance - payload.amount,
          transactions: [
            {
              _id: crypto.randomUUID(),
              type: "debit",
              amount: payload.amount,
              source: "fee_deduction",
              notes: payload.notes || "",
              createdAt: new Date().toISOString(),
            },
            ...w.transactions,
          ],
        };
      });

      set({ wallets: updated });
    } catch (e) {
      handleInternalError(e);
    }
  },
}));

export default walletStore;
