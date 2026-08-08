import { useEffect, useState, useCallback } from 'react';
import { useStore } from 'zustand';
import { message } from 'antd';
import feeStore from '@stores/FeeStore';
import studentService from '@services/Student';
import walletService from '@services/WalletService';
import logger from '@utils/logger';

function useFeeKpis() {
  const { getFeeKpis, kpis, loading } = useStore(feeStore);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    getFeeKpis({});
  }, []);

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

  return {
    kpis,
    loading,
    modalLoading,
    selectedStudent,
    modalVisible,
    openStudent,
    closeModal,
  };
}

export default useFeeKpis;
