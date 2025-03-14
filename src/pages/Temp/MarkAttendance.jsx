import React, { useState } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import { useStore } from 'zustand';
import attendanceStore from '@stores/AttendanceStore';

function MarkAttendance() {
  const { submitLoading, markAttendance } = useStore(attendanceStore)

  const onFinish = async (values) => {
    console.log('Marking attendance for:', values.admissionNumber);
    await markAttendance(values.admissionNumber)
  };

  return (
    <Card title="Mark Attendance" className="max-w-md mx-auto mt-10 shadow-lg">
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Admission Number"
          name="admissionNumber"
          rules={[{ required: true, message: 'Please enter an admission number' }]}
        >
          <Input placeholder="Enter admission number" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitLoading} block>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default MarkAttendance;