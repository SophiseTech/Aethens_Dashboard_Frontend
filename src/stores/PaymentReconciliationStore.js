import paymentReconciliationService from "@services/PaymentReconciliation";
import handleInternalError from "@utils/handleInternalError";
import handleSuccess from "@utils/handleSuccess";
import { create } from "zustand";

const paymentReconciliationStore = create((set, get) => ({
  statements: [],
  statementsLoading: false,
  // { statement, matched, mismatched, statementOnly, erpOnly, missingTxnId }
  detail: null,
  detailLoading: false,
  uploading: false,
  reconciling: false,

  getStatements: async () => {
    try {
      set({ statementsLoading: true });
      const statements = await paymentReconciliationService.getStatements();
      set({ statements: statements || [] });
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ statementsLoading: false });
    }
  },

  getStatement: async (id) => {
    try {
      set({ detailLoading: true, ...(get().detail?.statement?._id !== id ? { detail: null } : {}) });
      const detail = await paymentReconciliationService.getStatement(id);
      set({ detail });
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ detailLoading: false });
    }
  },

  // Returns the created statement so the caller can open it.
  uploadStatement: async (fileName, rows) => {
    try {
      set({ uploading: true });
      const statement = await paymentReconciliationService.uploadStatement(fileName, rows);
      if (statement) {
        set({ statements: [statement, ...get().statements] });
        handleSuccess("Statement uploaded and reconciled");
      }
      return statement;
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ uploading: false });
    }
  },

  reconcile: async (id) => {
    try {
      set({ reconciling: true });
      const detail = await paymentReconciliationService.reconcile(id);
      if (detail) {
        set({ detail });
        handleSuccess("Matching re-run");
      }
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ reconciling: false });
    }
  },

  deleteStatement: async (id) => {
    try {
      await paymentReconciliationService.deleteStatement(id);
      set({ statements: get().statements.filter((statement) => statement._id !== id) });
      handleSuccess("Statement deleted");
      return true;
    } catch (error) {
      handleInternalError(error);
    }
  },
}));

export default paymentReconciliationStore;
