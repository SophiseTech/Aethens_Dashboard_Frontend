import React, { useEffect, useMemo, useState } from 'react';
import { Form, Input, Button, message, Card, Select, Radio } from 'antd';
import { useStore } from 'zustand';
import attendanceStore from '@stores/AttendanceStore';
import studentStore from '@stores/StudentStore';
import facultyStore from '@stores/FacultyStore';
import handleInternalError from '@utils/handleInternalError';
import handleError from '@utils/handleError';

function MarkAttendance() {
  const [form] = Form.useForm();
  const [attendanceType, setAttendanceType] = useState('student');
  const { submitLoading, markAttendance, processSwipe } = useStore(attendanceStore);
  
  const getStudentsByCenter = studentStore(state => state.getStudentsByCenter);
  const students = studentStore(state => state.students);

  const getStaffByCenter = facultyStore(state => state.getStaffByCenter);
  const staff = facultyStore(state => state.staff);

  useEffect(() => {
    getStudentsByCenter(0);
    getStaffByCenter(100);
  }, []);

  const onFinish = async (values) => {
    if (attendanceType === 'student') {
      const selectedStudent = students.find(student => student._id === values.targetId);
      if(!selectedStudent) return handleError("No such student exists");
      if(!selectedStudent.details_id?.admissionNumber) return handleError("Student data is not populated.");
      await markAttendance(selectedStudent?.details_id?.admissionNumber);
      form.resetFields(['targetId']);
    } else {
      const selectedStaff = staff.find(member => member._id === values.targetId);
      if(!selectedStaff) return handleError("No such staff member exists");
      const timestamp = new Date().toISOString();
      await processSwipe(selectedStaff._id, timestamp);
      form.resetFields(['targetId']);
    }
  };

  const onTypeChange = (e) => {
    setAttendanceType(e.target.value);
    form.resetFields(['targetId']);
  };

  const options = useMemo(() => {
    if (attendanceType === 'student') {
      return students?.map(student => ({ label: student.username, value: student._id }));
    } else {
      return staff?.map(member => ({ label: member.username || member.email, value: member._id }));
    }
  }, [students, staff, attendanceType]);

  return (
    <Card title="Mark Attendance" className="max-w-md mx-auto mt-10 shadow-lg">
      <div className="mb-6 flex justify-center">
        <Radio.Group value={attendanceType} onChange={onTypeChange} buttonStyle="solid">
          <Radio.Button value="student">Student</Radio.Button>
          <Radio.Button value="staff">Staff</Radio.Button>
        </Radio.Group>
      </div>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label={attendanceType === 'student' ? 'Student Name' : 'Staff Name'}
          name="targetId"
          rules={[{ required: true, message: 'Please select a person' }]}
        >
          <Select
            showSearch
            options={options}
            filterOption={(inputValue, option) =>
              option?.label?.toLowerCase().includes(inputValue.toLowerCase())
            }
            placeholder={attendanceType === 'student' ? 'Search Student...' : 'Search Staff...'}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitLoading} block>
            {attendanceType === 'student' ? 'Submit Attendance' : 'Record Swipe'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default MarkAttendance;