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
  markAsPaid: async (billId) => {
    set({ loading: true, error: null });
    try {
      await FeeService.markAsPaid(billId);
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  }
}));

export default feeStore;
