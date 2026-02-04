import { useEffect } from 'react';
import { useStore } from 'zustand';
import attendanceRegisterStore from '@stores/AttendanceRegisterStore';

function useAttendanceRegister() {
  const {
    students,
    loading,
    attendanceData,
    pagination,
    selectedMonth,
    selectedCourse,
    setSelectedMonth,
    setSelectedCourse,
    setPage,
    fetchStudentsAttendance,
    reset
  } = useStore(attendanceRegisterStore);

  // Auto-fetch when month or course changes
  useEffect(() => {
    fetchStudentsAttendance(1);
  }, [selectedMonth, selectedCourse]);

  // Auto-fetch when page changes
  useEffect(() => {
    if (pagination.page > 1) {
      fetchStudentsAttendance(pagination.page);
    }
  }, [pagination.page, fetchStudentsAttendance]);

  return {
    students,
    loading,
    attendanceData,
    pagination,
    selectedMonth,
    selectedCourse,
    setSelectedMonth,
    setSelectedCourse,
    setPage,
    fetchStudentsAttendance,
    reset
  };
}

export default useAttendanceRegister;
