import React, { useMemo } from 'react';
import { Table, Tag, Spin, Empty, Pagination } from 'antd';
import dayjs from 'dayjs';
import { getConfig } from '@pages/AttendanceRegister/utils';


function AttendanceRegisterTable({
  students,
  attendanceData,
  selectedMonth,
  loading,
  pagination,
  onPageChange
}) {
  // Generate days in the selected month
  const daysInMonth = useMemo(() => {
    const monthDate = dayjs(selectedMonth);
    const daysCount = monthDate.daysInMonth();
    const days = [];

    for (let i = 1; i <= daysCount; i++) {
      days.push(monthDate.date(i).toDate());
    }
    return days;
  }, [selectedMonth]);

  // Build dynamic columns for each day
  const dayColumns = useMemo(() => {
    return daysInMonth.map((day, index) => {
      const dateKey = dayjs(day).format('YYYY-MM-DD');
      const dayName = dayjs(day).format('ddd').substring(0, 1); // M, T, W, etc.

      return {
        key: `day-${index}`,
        title: (
          <div className="flex flex-col items-center justify-center">
            <span className="text-xs font-bold">{dayName}</span>
            <span className="text-xs">{dayjs(day).date()}</span>
          </div>
        ),
        dataIndex: dateKey,
        width: 50,
        align: 'center',
        render: (value, row) => {
          const status = value?.status || 'no_slot';
          const type = value?.type || 'no_slot'
          const config = getConfig(status, type, value?.isHoliday);
          return (
            <div
              className="w-full h-full flex items-center justify-center text-white font-bold text-sm rounded"
              style={{
                backgroundColor: config.color,
                minHeight: '32px'
              }}
              title={config.tooltip}
            >
              {config.label}
            </div>
          );
        }
      };
    });
  }, [daysInMonth]);

  // Transform student data for table
  const tableData = useMemo(() => {
    return students.map((student, index) => {
      const studentId = student.user_id || student._id;
      const studentAttendance = student?.attendance || {};

      let totalPresent = 0;
      let totalMarked = 0;

      Object.values(studentAttendance).forEach(record => {
        if (record?.status) {
          if (record?.status === 'present') {
            totalPresent++
          }
          totalMarked++;
        }
      });

      const record = {
        key: studentId,
        index: (pagination.page - 1) * pagination.limit + index + 1,
        studentId,
        username: student.username || 'N/A',
        email: student.email || 'N/A',
        admissionNumber: student.admissionNumber || 'N/A',
        totalMarked,
        totalPresent,
        ...studentAttendance
      };

      return record;
    });
  }, [students, attendanceData, pagination]);

  const columns = [
    {
      title: 'S.No',
      key: 'index',
      width: 50,
      fixed: 'left',
      align: 'center',
      render: (text, record) => record.index
    },
    {
      title: 'Student Name',
      key: 'username',
      width: 150,
      fixed: 'left',
      render: (text, record) => (
        <div className="flex flex-col">
          <span className="font-semibold">{record.username}</span>
          <span className="text-xs text-gray-500">{record.admissionNumber}</span>
        </div>
      )
    },
    {
      title: 'Stat',
      key: 'totalPresent',
      width: 50,
      fixed: 'left',
      render: (text, record) => (
          <span className="font-semibold">{record.totalPresent}/{record.totalMarked}</span>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: 180,
      render: (email) => <span className="text-xs truncate">{email}</span>
    },
    ...dayColumns
  ];

  const monthYear = dayjs(selectedMonth).format('MMMM YYYY');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spin size="large" tip="Loading attendance data..." />
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 border border-border">
        <Empty
          description="No students found"
          style={{ marginTop: 60, marginBottom: 60 }}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-b border-border">
        <h3 className="text-lg font-bold text-gray-800">
          Attendance Register - {monthYear}
        </h3>
        <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
          <span className='flex items-center gap-1'>P: Present <span className='w-3 h-3 rounded-sm block' style={{background: getConfig('present','regular', false).color}}></span>|</span> 
          <span className='flex items-center gap-1'>A: Absent <span className='w-3 h-3 rounded-sm block' style={{background: getConfig('absent','regular', false).color}}></span>|</span> 
          <span className='flex items-center gap-1'>H: Holiday <span className='w-3 h-3 rounded-sm block' style={{background: getConfig('present','regular', true).color}}></span>|</span>
          <span className='flex items-center gap-1'>U: Upcoming <span className='w-3 h-3 rounded-sm block' style={{background: getConfig('upcoming','regular', false).color}}></span>|</span>
          <span className='flex items-center gap-1'>NA: No Slot <span className='w-3 h-3 rounded-sm block' style={{background: getConfig('no_slot','regular', false).color}}></span></span>
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          scroll={{ x: 'max-content' }}
          size="small"
          rowKey="key"
          className="attendance-register-table"
          style={{
            fontSize: '12px'
          }}
        />
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center p-4 border-t border-border bg-gray-50">
          <Pagination
            current={pagination.page}
            pageSize={pagination.limit}
            total={pagination.total}
            onChange={onPageChange}
            showSizeChanger={false}
            showQuickJumper
          />
        </div>
      )}
    </div>
  );
}

export default AttendanceRegisterTable;
