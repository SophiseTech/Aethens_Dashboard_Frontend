import { useCallback, useState } from "react";
import useAlert from "@hooks/useAlert";
import expenseService from "@services/ExpenseService";

/**
 * useExpenses hook
 * Handles loading expenses list, ledger auto-create/reuse logic,
 * and creating new expenses.
 */
export default function useExpenses() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    const [ledgers, setLedgers] = useState([]);
    const [ledgersLoading, setLedgersLoading] = useState(false);

    const [createLoading, setCreateLoading] = useState(false);

    const alert = useAlert();

    const fetchExpenses = useCallback(async (filters = {}, currentPage = 1) => {
        try {
            setLoading(true);
            const res = await expenseService.getExpenses(filters, currentPage, 10);
            setExpenses(res?.expenses || []);
            setTotal(res?.total || 0);
            setPage(currentPage);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchLedgers = useCallback(async () => {
        try {
            setLedgersLoading(true);
            const res = await expenseService.getLedgers();
            setLedgers(res?.ledgers || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLedgersLoading(false);
        }
    }, []);

    /**
     * Core ledger resolution logic:
     * - If the user selected an existing ledger ID → use it directly.
     * - If they typed a new name → create a new ledger, return its ID.
     */
    const resolveOrCreateLedger = useCallback(
        async (ledgerValue, ledgerName, ledgerType, onModel, entityId, vendorName) => {
            // Check if the value is an existing ledger ObjectId (24-char hex)
            const isExistingId = /^[a-f\d]{24}$/i.test(ledgerValue);
            if (isExistingId) return ledgerValue;

            // It's a new name — create the ledger
            const newLedger = await expenseService.createLedger({
                name: ledgerName || ledgerValue,
                type: ledgerType || "external",
                on_model: onModel,
                entity_id: entityId,
                vendor_name: vendorName,
            });
            if (!newLedger?._id) throw new Error("Failed to create ledger");

            // Refresh ledger list so dropdown stays in sync
            fetchLedgers();
            return newLedger._id;
        },
        [fetchLedgers]
    );

    const createExpense = useCallback(
        async (formValues) => {
            try {
                setCreateLoading(true);

                // Resolve the ledger ID (create if it's a new name)
                const ledger_id = await resolveOrCreateLedger(
                    formValues.ledger_id,
                    formValues.ledger_name,
                    formValues.ledger_type,
                    formValues.on_model,
                    formValues.entity_id,
                    formValues.vendor_name
                );

                const payload = {
                    ledger_id,
                    subtotal: formValues.subtotal,
                    tax_amount: formValues.tax_amount || 0,
                    total_amount:
                        formValues.total_amount ||
                        formValues.subtotal + (formValues.tax_amount || 0),
                    description: formValues.description,
                    expense_date: formValues.expense_date?.toISOString?.() || new Date().toISOString(),
                    payment_type: formValues.payment_type,
                    payment_method: formValues.payment_method,
                    category: formValues.category,
                    attachments: formValues.attachments || [],
                };

                const res = await expenseService.createExpense(payload);
                if (res) {
                    alert.success("Expense recorded successfully");
                    await fetchExpenses({}, page);
                    return true;
                }
            } catch (err) {
                console.error(err);
                alert.error("Failed to record expense");
                return false;
            } finally {
                setCreateLoading(false);
            }
        },
        [resolveOrCreateLedger, fetchExpenses, page, alert]
    );

    const changePage = useCallback(
        (newPage) => {
            fetchExpenses({}, newPage);
        },
        [fetchExpenses]
    );

    return {
        // Expenses list
        expenses,
        loading,
        total,
        page,
        limit,
        fetchExpenses,
        changePage,

        // Ledgers
        ledgers,
        ledgersLoading,
        fetchLedgers,

        // Create
        createExpense,
        createLoading,
    };
}
