import React, { useEffect, useMemo } from 'react';
import { Flex, Button, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import Title from '@components/layouts/Title';
import useAttendanceRegister from '@hooks/useAttendanceRegister';
import { ROLES } from '@utils/constants';
import { useStore } from 'zustand';
import userStore from '@stores/UserStore';
import dayjs from 'dayjs';
import AttendanceRegisterFilter from './Components/AttendanceRegisterFilter';
import AttendanceRegisterTable from './Components/AttendanceRegisterTable';
import AttendanceStats from './Components/AttendanceStats';
import { exportToCSV } from './utils';

function AttendanceRegister() {
  const { user } = useStore(userStore);

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
    fetchStudentsAttendance
  } = useAttendanceRegister();

  // Check authorization
  useEffect(() => {
    if (![ROLES.MANAGER, ROLES.ADMIN].includes(user?.role)) {
      return;
    }
  }, [user]);

  // Auto-fetch on mount

  const handleApplyFilters = () => {
    fetchStudentsAttendance(1);
  };

  const handlePageChange = (page) => {
    setPage(page);
  };

  // Generate table data for export
  const tableDataForExport = useMemo(() => {
    return students.map((student, index) => {
      const studentId = student.user_id || student._id;
      const studentAttendance = attendanceData[studentId] || {};

      const record = {
        index: (pagination.page - 1) * pagination.limit + index + 1,
        studentId,
        username: student.username || 'N/A',
        email: student.email || 'N/A',
        admissionNumber: student.admissionNumber || 'N/A',
        ...studentAttendance
      };

      return record;
    });
  }, [students, attendanceData, pagination]);

  const handleDownloadReport = () => {
    if (students.length === 0) {
      message.warning('No data to download');
      return;
    }

    try {
      const monthYear = dayjs(selectedMonth).format('MMMM-YYYY');
      const filename = selectedCourse
        ? `attendance-register-${monthYear}-course.csv`
        : `attendance-register-${monthYear}-all.csv`;

      exportToCSV(tableDataForExport, filename);
      message.success('Report downloaded successfully!');
    } catch (error) {
      message.error('Failed to download report');
      console.error(error);
    }
  };

  return (
    <Title
      title="Attendance Register"
      button={
        <Button
          icon={<DownloadOutlined />}
          onClick={handleDownloadReport}
          disabled={students.length === 0}
        >
          Download Report
        </Button>
      }
    >
      <Flex vertical gap={24}>
        {/* Filters Section */}
        <AttendanceRegisterFilter
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          onApply={handleApplyFilters}
          loading={loading}
        />

        {/* Statistics Section */}
        {!loading && (
          <AttendanceStats
            students={students}
            attendanceData={attendanceData}
            loading={loading}
          />
        )}

        {/* Attendance Register Table */}
        <AttendanceRegisterTable
          students={students}
          attendanceData={attendanceData}
          selectedMonth={selectedMonth}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </Flex>
    </Title>
  );
}

export default AttendanceRegister;