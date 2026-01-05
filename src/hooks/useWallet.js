import { useCallback, useState } from "react";
import useAlert from "@hooks/useAlert";
import { formatDate, formatTime, sumFromObjects } from "@utils/helper";
import walletService from "@/services/WalletService";

/**
 * useWallet hook
 * - Handles loading lists and single wallet details
 * - Performs topup/deduct and refreshes transactions
 * - Exposes small data transformations (formatted amount, totals)
 */
export default function useWallet() {
  // We only operate on a single student's wallet (driven by studentId from URL)
  const [loading, setLoading] = useState(false);

  const [selectedWallet, setSelectedWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  // pagination state for transactions
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [transactionsLimit, setTransactionsLimit] = useState(6);
  const [transactionsTotal, setTransactionsTotal] = useState(0);

  const alert = useAlert();

  const fetchTransactions = useCallback(async (walletId, page = 1, limit = 6) => {
    if (!walletId) return;
    try {
      setTransactionsLoading(true);
      const res = await walletService.getWalletTransactions(walletId, page, limit);

      const { transactions, total } = res;

      // Enrich transactions
      const txs = (transactions || []).map((t) => ({
        ...t,
        formattedDate: formatDate(t.createdAt),
        formattedTime: formatTime(t.createdAt),
      }));
      setTransactions(txs);
      setTransactionsTotal(total || 0);
      setTransactionsPage(page);
      setTransactionsLimit(limit);

    } catch (err) {
      // handled in service
      console.error(err)
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

  const fetchWallet = useCallback(async (studentId) => {
    if (!studentId) return;
    try {
      setLoading(true);
      const res = await walletService.getWalletByStudentId(studentId);
      setSelectedWallet(res);
      // once we have the wallet, fetch its transactions using wallet id
      if (res._id) {
        await fetchTransactions(res._id, transactionsPage, transactionsLimit);
      }
      return res.data;
    } catch (err) {
      // handled in service
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fetchTransactions, transactionsPage, transactionsLimit]);

  const topUp = useCallback(async (studentId, payload) => {
    try {
      const res = await walletService.topUpWallet(payload);
      if (res) {
        alert.success("Top-up successful");
        // refetch wallet (which will also fetch its transactions)
        await fetchWallet(studentId);
        return res;
      }
    } catch (err) {
      console.error(err)
      alert.error("Top-up failed");
    }
  }, [alert, fetchWallet]);

  const deduct = useCallback(async (studentId, payload) => {
    try {
      const res = await walletService.deductFromWallet(payload);
      if (res) {
        alert.success("Deducted successfully");
        // refetch wallet (which will also fetch its transactions)
        await fetchWallet(studentId);
        return res;
      }
    } catch (err) {
      console.error(err)
      alert.error("Deduction failed");
    }
  }, [alert, fetchWallet]);

  const totals = {
    totalCredited: selectedWallet?.totalCredited || sumFromObjects(transactions.filter(t => t.type === 'credit'), 'amount'),
    totalDebited: selectedWallet?.totalDebited || sumFromObjects(transactions.filter(t => t.type === 'debit'), 'amount'),
  };

  // pagination helper: change page/limit and fetch for the current wallet
  const changeTransactionsPage = useCallback((page, limit) => {
    setTransactionsPage(page);
    setTransactionsLimit(limit || transactionsLimit);
    if (selectedWallet && selectedWallet._id) {
      fetchTransactions(selectedWallet._id, page, limit || transactionsLimit);
    }
  }, [fetchTransactions, selectedWallet, transactionsLimit]);

  // convenience: select wallet and auto-load transactions
  const selectWallet = useCallback(async (studentId) => {
    if (!studentId) return;
    await fetchWallet(studentId);
  }, [fetchWallet]);

  return {
    // selected
    selectedWallet,
    loading,
    selectWallet,
    fetchWallet,

    // transactions
    transactions,
    transactionsLoading,
    fetchTransactions,
    transactionsPage,
    transactionsLimit,
    transactionsTotal,
    changeTransactionsPage,

    // actions
    topUp,
    deduct,

    // derived
    totals,
  };
}
