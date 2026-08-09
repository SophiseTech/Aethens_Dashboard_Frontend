import { BookOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import { formatDate } from '@utils/helper';
import { Avatar, Button, Card, Input, Space, Table, Tag, Typography } from 'antd';
import PropTypes from 'prop-types';

const { Text, Title } = Typography;

function ProjectOpenedStudentsList({ projectsInfo = [], loading, onView, onSearch, title = 'Project Opened Students' }) {

  const columns = [
    {
      title: 'Student',
      dataIndex: ['student', 'username'],
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
      dataIndex: ['course', 'course_name'],
      key: 'courseName',
      render: (name) => (
        <Space>
          <BookOutlined />
          <Text>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
    },
    {
      title: 'Last Completed',
      dataIndex: 'status',
      key: 'status',
      render: (_, row) => row?.approvedPhases <= 0 ? <Tag color={'default'}>Not Started</Tag> : <Tag color={'green'}>Phase {row?.approvedPhases}</Tag>,
    },
    {
      title: 'Current Phase',
      dataIndex: 'status',
      key: 'status',
      render: (_, row) => (row?.approvedPhases + 1) <= row?.totalPhases ? <Tag color={'orange'}>Phase {row?.approvedPhases + 1}</Tag> : null,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => onView(record._id, record.student._id)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <Space className='w-full mb-4' style={{ justifyContent: 'space-between' }}>
        <Title level={4} style={{ margin: 0 }}>{title}</Title>
        {onSearch &&
          <Input.Search
            placeholder='Search by student name'
            allowClear
            onChange={(e) => onSearch(e.target.value)}
            style={{ maxWidth: 280 }}
          />
        }
      </Space>
      <Table
        columns={columns}
        dataSource={projectsInfo?.projects || []}
        rowKey="id"
        pagination={{
          current: projectsInfo?.pagination?.page || 1,
          pageSize: projectsInfo?.pagination?.limit || 10,
          total: projectsInfo?.total || 0,
          showSizeChanger: false,
          showQuickJumper: false,
          onChange: projectsInfo?.handlePaginationChange,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        className="mb-4"
        loading={loading}
      />
    </Card>
  );
}

ProjectOpenedStudentsList.propTypes = {
  projectsInfo: PropTypes.shape({
    projects: PropTypes.array,
    total: PropTypes.number,
  }),
  loading: PropTypes.bool,
  onView: PropTypes.func.isRequired,
  onSearch: PropTypes.func,
  title: PropTypes.string,
};

export default ProjectOpenedStudentsList;