import { get, put, post } from "@utils/Requests";

export const FeeService = {
  getFeeDetailsByStudent: (studentId) => {
    return get(`/fees/student/${studentId}`);
  },
  // Moved from BillsRoute to FeeRoute
  markAsPaid: (billId, payload = {}) => {
    return put(`/fees/bill/${billId}/mark-as-paid`, payload);
  },
  markPartialPayment: (feeAccountId, payload) => {
    return post(`/fees/${feeAccountId}/mark-payment`, payload);
  },
  getUnpaidReport: (filters = {}) => {
    return post(`/fees/unpaid-report`, { filters });
  },
  generatePartialBalanceBill: (feeAccountId) => {
    return post(`/fees/${feeAccountId}/generate-partial-bill`);
  },
  // New: generate a bill for a specific installment
  generateInstallmentBill: (feeAccountId, installmentId) => {
    return post(`/fees/${feeAccountId}/installment/${installmentId}/generate-bill`);
  },
  // New: mark an installment as paid without generating a bill
  markInstallmentAsPaid: (feeAccountId, installmentId, payload = {}) => {
    return post(`/fees/${feeAccountId}/installment/${installmentId}/mark-paid`, payload);
  },
};
