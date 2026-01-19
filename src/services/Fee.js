import { get, put } from "@utils/Requests";

export const FeeService = {
  getFeeDetailsByStudent: (studentId) => {
    return get(`/fees/student/${studentId}`);
  },
  markAsPaid: (billId) => {
    return put(`/bills/${billId}/mark-as-paid`);
  },
};
