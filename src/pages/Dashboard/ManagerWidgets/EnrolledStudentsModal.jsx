import PropTypes from 'prop-types';
import { Modal, Table, Tag, Input } from 'antd';
import dayjs from 'dayjs';
import useEnrolledStudents from '@hooks/useEnrolledStudents';

const formatDate = (value) => (value ? dayjs(value).format('DD MMM YYYY') : '—');

const columns = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Admission No.', dataIndex: 'admissionNumber', key: 'admissionNumber', render: (v) => v || '—' },
  { title: 'Phone', dataIndex: 'phone', key: 'phone', render: (v) => v || '—' },
  { title: 'Course', dataIndex: 'course', key: 'course', render: (v) => v || '—' },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status) => <Tag color={status === 'active' ? 'green' : 'default'}>{status}</Tag>,
  },
  { title: 'Enrollment Date', dataIndex: 'enrollmentDate', key: 'enrollmentDate', render: formatDate },
];

// Dashboard "Enrolled Students" drill-down: the students counted on the card,
// for the dashboard's current center and date range.
function EnrolledStudentsModal({ open, onClose }) {
  const {
    students, total, page, pageSize, loading, searchInput, from, to, onSearchChange, onPageChange,
  } = useEnrolledStudents(open);

  return (
    <Modal
      title={`Enrolled Students (${formatDate(from)} – ${formatDate(to)})`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      destroyOnClose
    >
      <Input.Search
        className='mb-3'
        placeholder='Search by name'
        allowClear
        value={searchInput}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <Table
        rowKey='_id'
        size='small'
        columns={columns}
        dataSource={students}
        loading={loading}
        scroll={{ x: 700 }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: false,
          showTotal: (count) => `${count} student${count === 1 ? '' : 's'}`,
          onChange: onPageChange,
        }}
      />
    </Modal>
  );
}

EnrolledStudentsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EnrolledStudentsModal;
