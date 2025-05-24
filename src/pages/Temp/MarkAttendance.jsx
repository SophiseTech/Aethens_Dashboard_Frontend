import React, { useEffect, useMemo, useState } from 'react';
import { Form, Input, Button, message, Card, AutoComplete } from 'antd';
import { useStore } from 'zustand';
import attendanceStore from '@stores/AttendanceStore';
import studentStore from '@stores/StudentStore';
import handleInternalError from '@utils/handleInternalError';
import handleError from '@utils/handleError';

function MarkAttendance() {
  const { submitLoading, markAttendance } = useStore(attendanceStore)
  const getStudentsByCenter = studentStore(state => state.getStudentsByCenter)
  const students = studentStore(state => state.students)
  const loading = studentStore(state => state.loading)

  useEffect(() => {
    getStudentsByCenter(0)
  }, [])


  const onFinish = async (values) => {
    console.log('Marking attendance for:', values, students);
    const selectedStudent = students.find(student => student._id === values.student)
    if(!selectedStudent) return handleError("No such student exists")
    if(!selectedStudent.details_id?.admissionNumber) return handleError("Student data is not populated.")
    await markAttendance(selectedStudent?.details_id?.admissionNumber)
  };

  const options = useMemo(() => students?.map(student => ({ label: student.username, value: student._id })), [students])

  return (
    <Card title="Mark Attendance" className="max-w-md mx-auto mt-10 shadow-lg">
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Admission Number"
          name="student"
          rules={[{ required: true, message: 'Please enter an admission number' }]}
        >
          {/* <Input placeholder="Enter admission number" /> */}
          <AutoComplete
            options={options}
            filterOption={(inputValue, option) =>
              option.label.toLowerCase().includes(inputValue.toLowerCase())
            }
            placeholder="Student Name"
          />
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