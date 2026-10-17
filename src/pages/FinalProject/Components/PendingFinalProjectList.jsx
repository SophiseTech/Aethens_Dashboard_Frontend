import { BookOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import CustomCheckbox from '@components/form/CustomCheckBox';
import CustomSelect from '@components/form/CustomSelect';
import { PENDING_FINAL_PROJECT_ENROLLMENT_OPTIONS } from '@hooks/usePendingFinalProjects';
import { formatDate } from '@utils/helper';
import { Avatar, Button, Card, Form, Input, Space, Table, Tag, Typography } from 'antd';
import PropTypes from 'prop-types';

const { Text, Title } = Typography;

const ENROLLMENT_STATUS_TAG = {
  completed: { color: 'green', text: 'Completed' },
  migrated: { color: 'orange', text: 'Migrated' },
};

function PendingFinalProjectList({
  students = [],
  total = 0,
  loading,
  filters,
  pagination,
  courseOptions = [],
  onFiltersChange,
  onSearch,
  onPaginationChange,
  onView,
}) {
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
      title: 'Phone',
      dataIndex: ['student', 'phone'],
      key: 'phone',
    },
    {
      title: 'Course',
      dataIndex: ['course', 'course_name'],
      key: 'courseName',
      render: (name) => (
        <Space>
          <BookOutlined />
          <Text>{name || '—'}</Text>
        </Space>
      ),
    },
    {
      title: 'Enrollment',
      dataIndex: 'enrollmentStatus',
      key: 'enrollmentStatus',
      render: (status) => {
        const config = ENROLLMENT_STATUS_TAG[status];
        return config ? <Tag color={config.color}>{config.text}</Tag> : null;
      },
    },
    {
      title: 'Ended On',
      dataIndex: 'endedOn',
      key: 'endedOn',
      render: (date) => formatDate(date),
    },
    {
      title: 'Now In',
      key: 'currentCourse',
      render: (_, record) => {
        if (!record.isContinuing) return '—';
        if (record.currentCourse?.course_name) return <Tag color='blue'>{record.currentCourse.course_name}</Tag>;
        return <Tag color='blue'>{record.currentCourseType === 'diploma' ? 'Diploma' : 'Active course'}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => onView(record.student._id)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <Space className='w-full mb-4' style={{ justifyContent: 'space-between' }} wrap>
        <Title level={4} style={{ margin: 0 }}>Pending Final Project</Title>
        <Input.Search
          placeholder='Search by student name'
          allowClear
          onChange={(e) => onSearch(e.target.value)}
          style={{ maxWidth: 280 }}
        />
      </Space>

      <Form
        layout='inline'
        initialValues={filters}
        onValuesChange={onFiltersChange}
        className='mb-4 gap-y-2'
      >
        <CustomSelect
          name='courseId'
          placeholder='All courses'
          options={courseOptions}
          required={false}
          allowClear
          className='!w-auto'
          style={{ minWidth: 220 }}
        />
        <CustomSelect
          name='enrollmentStatus'
          options={PENDING_FINAL_PROJECT_ENROLLMENT_OPTIONS}
          required={false}
          className='!w-auto'
          style={{ minWidth: 140 }}
        />
        <CustomCheckbox name='continuingOnly' label='Continuing with another course' />
      </Form>

      <Table
        columns={columns}
        dataSource={students}
        rowKey='_id'
        loading={loading}
        scroll={{ x: 'max-content' }}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total,
          showSizeChanger: true,
          onChange: onPaginationChange,
        }}
      />
    </Card>
  );
}

PendingFinalProjectList.propTypes = {
  students: PropTypes.array,
  total: PropTypes.number,
  loading: PropTypes.bool,
  filters: PropTypes.object.isRequired,
  pagination: PropTypes.object.isRequired,
  courseOptions: PropTypes.array,
  onFiltersChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onPaginationChange: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
};

export default PendingFinalProjectList;
