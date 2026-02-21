import { create } from 'zustand';
import { FeeService } from '@services/Fee';

const feeStore = create((set) => ({
  feeDetails: null,
  loading: false,
  error: null,
  getFeeDetailsByStudent: async (studentId) => {
    set({ loading: true, error: null });
    try {
      const response = await FeeService.getFeeDetailsByStudent(studentId);
      set({ feeDetails: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  markAsPaid: async (billId, payload = {}) => {
    set({ loading: true, error: null });
    try {
      await FeeService.markAsPaid(billId, payload);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  markPartialPayment: async (feeAccountId, payload) => {
    set({ loading: true, error: null });
    try {
      await FeeService.markPartialPayment(feeAccountId, payload);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  generatePartialBalanceBill: async (feeAccountId) => {
    set({ loading: true, error: null });
    try {
      await FeeService.generatePartialBalanceBill(feeAccountId);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  generateInstallmentBill: async (feeAccountId, installmentId) => {
    set({ loading: true, error: null });
    try {
      await FeeService.generateInstallmentBill(feeAccountId, installmentId);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  markInstallmentAsPaid: async (feeAccountId, installmentId, payload = {}) => {
    set({ loading: true, error: null });
    try {
      await FeeService.markInstallmentAsPaid(feeAccountId, installmentId, payload);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
}));

export default feeStore;
