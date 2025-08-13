import { BookOutlined, CalendarOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import { useFinalProject } from '@hooks/useFinalProject';
import useStudents from '@hooks/useStudents';
import FilterBar from '@pages/FinalProject/Components/FilterBar';
import ProjectOpenedStudentsList from '@pages/FinalProject/Components/ProjectOpenedStudentsList';
import StudentSearchBar from '@pages/FinalProject/Components/StudentSearchBar';
import { formatDate } from '@utils/helper';
import { Avatar, Button, Card, message, Pagination, Space, Spin, Table, Tag, Typography } from 'antd';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography

export const mockSubmissions = [
  {
    _id: 1,
    studentName: 'John Doe',
    courseName: 'Web Development Fundamentals',
    phaseTitle: 'Frontend Implementation',
    submittedDate: '2025-01-10',
    status: 'under_review'
  },
  {
    _id: 2,
    studentName: 'Jane Smith',
    courseName: 'React Advanced Concepts',
    phaseTitle: 'State Management',
    submittedDate: '2025-01-09',
    status: 'under_review'
  },
  {
    _id: 3,
    studentName: 'Mike Johnson',
    courseName: 'Node.js Backend Development',
    phaseTitle: 'Database Design',
    submittedDate: '2025-01-08',
    status: 'under_review'
  }
];

function FinalProjectManagerView() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { getStatusConfig, fetchPendingSubmissions, pendingSubmissions, loading } = useFinalProject()
  const { getStudentsByCenter, students, loading: studentListLoading, getProjectOpenedStudents, projectOpenedStudents, loading: projectOpenedStudentsLoading } = useStudents()
  const nav = useNavigate()

  useEffect(() => {
    fetchPendingSubmissions()
    getStudentsByCenter()
    getProjectOpenedStudents()
  }, [])

  const onSelectStudent = (value) => {
    const student = students.find(s => s._id === value);
    console.log('Selected student id:', value);
    if (!student) {
      message.error('Student not found');
      return
    }
    console.log('Selected student:', student);
    nav(`/manager/final-project/student/${value}/course/${student?.details_id?.course_id}/details`);
  }

  const onViewStudents = (studentid, courseId) => {
    nav(`/manager/final-project/student/${studentid}/course/${courseId}/details`);
  }

  const columns = [
    {
      title: 'Student',
      dataIndex: 'studentName',
      key: 'studentName',
      render: (name) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Course',
      dataIndex: 'courseName',
      key: 'courseName',
      render: (name) => (
        <Space>
          <BookOutlined />
          <Text>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Phase',
      dataIndex: 'phaseTitle',
      key: 'phaseTitle',
    },
    {
      title: 'Submitted Date',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date) => (
        <Space>
          <CalendarOutlined />
          <Text>{formatDate(date)}</Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusConfig('under_review').color}>{getStatusConfig('under_review').text}</Tag>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => nav(`/manager/final-project/submission/${record._id}`)}
        >
          Review
        </Button>
      ),
    },
  ];

  if (loading) {
    return <div className='w-full h-full flex items-center justify-center'><Spin size="large" /></div>
  }

  return (
    <div className="p-6">
      <Title level={2}>Pending Submissions</Title>

      {/* <FilterBar onFiltersChange={(values) => console.log('Filters:', values)} /> */}

      <StudentSearchBar students={students} onSelect={onSelectStudent} />

      <Card className='mb-4'>
        <Title level={4}>Submissions</Title>
        <Table
          columns={columns}
          dataSource={pendingSubmissions}
          rowKey="id"
          pagination={true}
          className="mb-4"
        />
      </Card>

      <ProjectOpenedStudentsList students={projectOpenedStudents} loading={projectOpenedStudentsLoading} onView={onViewStudents} />
    </div>
  );
};

export default FinalProjectManagerView