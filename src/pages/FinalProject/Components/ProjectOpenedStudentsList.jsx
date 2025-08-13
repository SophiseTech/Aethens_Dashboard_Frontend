import { BookOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Space, Table, Tag, Typography } from 'antd';
const { Text, Title } = Typography;

function ProjectOpenedStudentsList({ students, loading, onView }) {

  const columns = [
    {
      title: 'Student',
      dataIndex: 'username',
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={'green'}>Opened</Tag>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => onView(record._id, record.course._id)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <Title level={4}>Project Opened Students</Title>
      <Table
        columns={columns}
        dataSource={students}
        rowKey="id"
        pagination={true}
        className="mb-4"
        loading={loading}
      />

      <div className="flex justify-end">
        {/* <Pagination
          current={currentPage}
          total={students.length}
          pageSize={pageSize}
          showSizeChanger
          showQuickJumper
          showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
          onChange={(page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }}
        /> */}
      </div>
    </Card>
  )
}

export default ProjectOpenedStudentsList