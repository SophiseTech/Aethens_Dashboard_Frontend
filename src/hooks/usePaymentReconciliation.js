import { useCallback, useMemo, useState } from 'react';
import { message } from 'antd';
import { useStore } from 'zustand';
import * as XLSX from 'xlsx';
import paymentReconciliationStore from '@stores/PaymentReconciliationStore';
import { formatDate, formatDateTime } from '@utils/helper';

// Only these Paytm columns are sent to the server — the full export has ~150.
const STATEMENT_COLUMNS = [
  'Transaction_ID', 'Order_ID', 'Transaction_Date', 'Transaction_Type', 'Status', 'Amount', 'RRN',
  'Bank_Transaction_ID', 'Payment_Mode', 'Customer_Name', 'Customer_Nickname', 'Customer_VPA',
];

const invoiceLabel = (bill) => `${bill.center_initial || ''}${bill.invoiceNo ?? ''}`;
const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

const billRow = (bill) => ({
  key: bill._id,
  billId: bill._id,
  invoice: invoiceLabel(bill),
  student: bill.generated_for?.username || '',
  center: bill.center_id?.center_name || '',
  paymentDate: formatDate(bill.payment_date),
  method: (bill.payment_method || '').replace(/_/g, ' '),
  transactionId: bill.transaction_id || '',
  amount: round2(bill.collectedAmount),
});

const txnRow = (txn) => ({
  key: txn._id,
  txnDate: formatDateTime(txn.txnDate),
  transactionId: txn.transactionId,
  orderId: txn.orderId || '',
  rrn: txn.rrn || '',
  mode: txn.paymentMode || '',
  customer: txn.customerName || txn.vpa || '',
  amount: round2(txn.amount),
});

const matchRow = ({ txn, bills, erpAmount }) => ({
  ...txnRow(txn),
  bills: bills.map((bill) => ({ billId: bill._id, invoice: invoiceLabel(bill), student: bill.generated_for?.username || '' })),
  erpAmount: round2(erpAmount),
  difference: round2(erpAmount - txn.amount),
});

const matchesSearch = (row, search) => {
  if (!search) return true;
  const needle = search.toLowerCase();
  return JSON.stringify(row).toLowerCase().includes(needle);
};

// Statement list + upload (CSV parsed here, rows sent as JSON).
export function usePaymentStatements() {
  const { statements, statementsLoading, uploading, getStatements, uploadStatement, deleteStatement } = useStore(paymentReconciliationStore);

  const parseAndUpload = useCallback(async (file) => {
    try {
      const buffer = await file.arrayBuffer();
      // raw: keep every cell as text — Paytm ids are 35-digit numbers that lose precision as floats.
      const workbook = XLSX.read(buffer, { type: 'array', raw: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsed = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
      if (!parsed.length) {
        message.warning('The file has no rows');
        return null;
      }
      const rows = parsed.map((row) => Object.fromEntries(
        Object.entries(row).filter(([key]) => STATEMENT_COLUMNS.includes(key.replace(/^\W+/, '').trim()))
      ));
      return await uploadStatement(file.name, rows);
    } catch (error) {
      message.error(error?.message || 'Could not read the statement file');
      return null;
    }
  }, [uploadStatement]);

  return { statements, statementsLoading, uploading, getStatements, parseAndUpload, deleteStatement };
}

// One statement's reconciliation lists.
export function usePaymentStatementDetail() {
  const { detail, detailLoading, reconciling, getStatement, reconcile } = useStore(paymentReconciliationStore);
  const [search, setSearch] = useState('');

  const lists = useMemo(() => {
    if (!detail) return null;
    return {
      matched: detail.matched.map(matchRow),
      mismatched: detail.mismatched.map(matchRow),
      statementOnly: detail.statementOnly.map(txnRow),
      erpOnly: detail.erpOnly.map(billRow),
      missingTxnId: detail.missingTxnId.map(billRow),
    };
  }, [detail]);

  const filtered = useMemo(() => {
    if (!lists) return null;
    return Object.fromEntries(Object.entries(lists).map(([name, rows]) => [name, rows.filter((row) => matchesSearch(row, search))]));
  }, [lists, search]);

  const exportList = useCallback((name, label) => {
    const rows = (filtered?.[name] || []).map((row) => {
      const exported = { ...row };
      delete exported.key;
      delete exported.billId;
      delete exported.bills;
      if (row.bills) exported.invoices = row.bills.map((bill) => `${bill.invoice} (${bill.student})`).join(', ');
      return exported;
    });
    if (!rows.length) {
      message.info('Nothing to export');
      return;
    }
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), label.slice(0, 31));
    const stamp = detail?.statement?.fileName?.replace(/\.[^.]+$/, '') || 'statement';
    XLSX.writeFile(workbook, `${stamp}-${name}.xlsx`);
  }, [filtered, detail]);

  return {
    statement: detail?.statement,
    lists: filtered,
    detailLoading,
    reconciling,
    search,
    setSearch,
    getStatement,
    reconcile,
    exportList,
  };
}
