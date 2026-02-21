import React, { useMemo } from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { UserOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { calculateAttendanceStats } from '../utils';

function AttendanceStats({
  students,
  attendanceData,
  loading
}) {
  const stats = useMemo(() => {
    if (loading || !students.length) {
      return {
        totalStudents: 0,
        totalAttendanceMarked: 0,
        averageAttendance: 0
      };
    }

    const allStats = calculateAttendanceStats(attendanceData, students);
    console.log(allStats);

    const averageAttendance = attendanceData?.totalSlots > 0 ? ((attendanceData?.totalAttendedSlots / attendanceData?.totalSlots) * 100).toFixed(1) : 0;

    return {
      totalStudents: attendanceData?.totalStudents,
      totalAttendanceMarked: attendanceData?.totalAttendedSlots,
      averageAttendance: parseFloat(averageAttendance),
      totalSlots: attendanceData?.totalSlots
    };
  }, [students, attendanceData, loading]);

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={6}>
        <Card bordered={false} className="shadow-sm">
          <Statistic
            title="Total Students"
            value={stats.totalStudents}
            prefix={<UserOutlined className="text-blue-500" />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card bordered={false} className="shadow-sm">
          <Statistic
            title="Total Slots"
            value={stats.totalSlots}
            prefix={<CheckCircleOutlined className="text-green-500" />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card bordered={false} className="shadow-sm">
          <Statistic
            title="Attended Slots"
            value={stats.totalAttendanceMarked}
            prefix={<CheckCircleOutlined className="text-green-500" />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card bordered={false} className="shadow-sm">
          <Statistic
            title="Average Attendance"
            value={stats.averageAttendance}
            suffix="%"
            prefix={<CloseCircleOutlined className="text-orange-500" />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
    </Row>
  );
}

export default AttendanceStats;
