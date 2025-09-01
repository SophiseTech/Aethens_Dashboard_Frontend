/* eslint-disable react-hooks/exhaustive-deps */
import { BookOutlined, CalendarOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import { useFinalProject } from '@hooks/useFinalProject';
import useStudents from '@hooks/useStudents';
import CreateProject from '@pages/FinalProject/Components/CreateProject';
import ProjectOpenedStudentsList from '@pages/FinalProject/Components/ProjectOpenedStudentsList';
import { formatDate } from '@utils/helper';
import { Avatar, Button, Card, Space, Spin, Table, Tag, Typography } from 'antd';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const { Text, Title } = Typography

function FinalProjectManagerView() {
  const { getStatusConfig, fetchPendingSubmissions, pendingSubmissions, loading, listProjects, projectsInfo, handlePaginationChange } = useFinalProject()
  const { loading: projectOpenedStudentsLoading } = useStudents()
  const nav = useNavigate()
  const { projectId } = useParams()

  useEffect(() => {
    fetchPendingSubmissions({}, projectId)
    listProjects({
      query: {status: 'pending'},
      populate: [
        {
          path: "studentId",
          select: "username center_id",
        },
        {
          path: "facultyId",
          select: "username"
        },
        {
          path: 'courseId',
          select: "course_name"
        }
      ]
    })
  }, [])

  const onViewStudents = (projectId, studentId) => {
    nav(`/manager/final-project/${projectId}/student/${studentId}/phases`);
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
      render: () => <Tag color={getStatusConfig('under_review').color}>{getStatusConfig('under_review').text}</Tag>,
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

      {/* <StudentSearchBar students={students} onSelect={onSelectStudent} /> */}

      <CreateProject />

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

      <ProjectOpenedStudentsList 
        projectsInfo={{
          ...projectsInfo,
          handlePaginationChange: handlePaginationChange
        }} 
        loading={projectOpenedStudentsLoading} 
        onView={onViewStudents} 
      />
    </div>
  );
};

export default FinalProjectManagerView