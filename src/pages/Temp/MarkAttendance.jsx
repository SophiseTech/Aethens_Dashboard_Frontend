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
  
  const getFacultiesByCenter = facultyStore(state => state.getFacultiesByCenter);
  const faculties = facultyStore(state => state.faculties);

  useEffect(() => {
    getStudentsByCenter(0);
    getFacultiesByCenter(100);
  }, []);

  const onFinish = async (values) => {
    if (attendanceType === 'student') {
      const selectedStudent = students.find(student => student._id === values.targetId);
      if(!selectedStudent) return handleError("No such student exists");
      if(!selectedStudent.details_id?.admissionNumber) return handleError("Student data is not populated.");
      await markAttendance(selectedStudent?.details_id?.admissionNumber);
      form.resetFields(['targetId']);
    } else {
      const selectedFaculty = faculties.find(faculty => faculty._id === values.targetId);
      if(!selectedFaculty) return handleError("No such faculty exists");
      const timestamp = new Date().toISOString();
      await processSwipe(selectedFaculty._id, timestamp);
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
      return faculties?.map(faculty => ({ label: faculty.username || faculty.email, value: faculty._id }));
    }
  }, [students, faculties, attendanceType]);

  return (
    <Card title="Mark Attendance" className="max-w-md mx-auto mt-10 shadow-lg">
      <div className="mb-6 flex justify-center">
        <Radio.Group value={attendanceType} onChange={onTypeChange} buttonStyle="solid">
          <Radio.Button value="student">Student</Radio.Button>
          <Radio.Button value="faculty">Faculty</Radio.Button>
        </Radio.Group>
      </div>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label={attendanceType === 'student' ? 'Student Name' : 'Faculty Name'}
          name="targetId"
          rules={[{ required: true, message: 'Please select a person' }]}
        >
          <Select
            showSearch
            options={options}
            filterOption={(inputValue, option) =>
              option?.label?.toLowerCase().includes(inputValue.toLowerCase())
            }
            placeholder={attendanceType === 'student' ? 'Search Student...' : 'Search Faculty...'}
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