import React, { useState } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import { useStore } from 'zustand';
import attendanceStore from '@stores/AttendanceStore';

function MarkFacultyAttendance() {
  const { submitLoading, markFacultyAttendance } = useStore(attendanceStore)

  const onFinish = async (values) => {
    console.log('Marking attendance for:', values.email);
    await markFacultyAttendance(values.email)
  };

  return (
    <Card title="Mark Faculty Attendance" className="max-w-md mx-auto mt-10 shadow-lg">
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: 'Please enter an email' }]}
        >
          <Input placeholder="Enter email" />
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

export default MarkFacultyAttendance;