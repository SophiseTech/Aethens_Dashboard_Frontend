import { useEffect, useState, useCallback } from 'react';
import { useStore } from 'zustand';
import { message } from 'antd';
import feeStore from '@stores/FeeStore';
import centerStore from '@stores/CentersStore';
import studentService from '@services/Student';
import walletService from '@services/WalletService';
import logger from '@utils/logger';

function useFeeKpis() {
  const { getFeeKpis, kpis, kpisLoading: loading } = useStore(feeStore);
  const { selectedCenter } = useStore(centerStore);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  // Row whose reminder dialog is open; one shared dialog for both tables.
  const [reminderRow, setReminderRow] = useState(null);

  // Server pins center-bound roles to their own center, so sending the selector value
  // is safe for every role.
  useEffect(() => {
    getFeeKpis({ query: { center_id: selectedCenter } }).catch((error) => {
      logger.error('Error fetching fee KPIs:', error);
    });
  }, [selectedCenter]);

  const openStudent = useCallback(async (studentId) => {
    if (!studentId) return;

    let hideLoading = null;
    try {
      hideLoading = message.loading('Loading student fee tracker...', 0);
      setModalLoading(true);
      const studentData = await studentService.getUserById(studentId);
      if (!studentData) {
        message.error('Student details not found');
        return;
      }

      try {
        const walletData = await walletService.getWalletByStudentId(studentData._id);
        studentData.wallet = walletData;
      } catch (walletError) {
        logger.error('Error fetching student wallet details:', walletError);
      }

      setSelectedStudent(studentData);
      setModalVisible(true);
    } catch (error) {
      logger.error('Error fetching student details:', error);
      message.error('Failed to load student fee tracker');
    } finally {
      if (hideLoading) hideLoading();
      setModalLoading(false);
    }
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedStudent(null);
  }, []);

  const openReminder = useCallback((row) => setReminderRow(row), []);
  const closeReminder = useCallback(() => setReminderRow(null), []);

  return {
    kpis,
    loading,
    modalLoading,
    selectedStudent,
    modalVisible,
    openStudent,
    closeModal,
    reminderRow,
    openReminder,
    closeReminder,
  };
}

export default useFeeKpis;
