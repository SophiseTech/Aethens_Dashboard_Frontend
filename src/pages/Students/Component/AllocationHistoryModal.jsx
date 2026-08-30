import { Button, Modal, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import useModal from '@hooks/useModal';
import SessionStore from '@stores/SessionStore';

// Row-level "History" button + dialog for a student's session allocation/
// deallocation events (recorded on their BookedSessions enrollment). Fetches
// only when opened, so nothing loads until the manager actually asks for it.
function AllocationHistoryModal({ studentId }) {
  const { showModal, handleCancel, isModalOpen } = useModal();
  const { getAllocationHistory, allocationHistory, loadingHistory } = SessionStore();

  const handleOpen = () => {
    showModal();
    getAllocationHistory(studentId);
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('DD MMM YYYY, hh:mm A'),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => <Tag color={action === 'allocated' ? 'green' : 'red'}>{action}</Tag>,
    },
    {
      title: 'Type',
      dataIndex: 'slotType',
      key: 'slotType',
      render: (type) => type || '-',
    },
    {
      title: 'Count',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: 'By',
      dataIndex: ['performedBy', 'username'],
      key: 'performedBy',
      render: (value) => value || '-',
    },
  ];

  return (
    <>
      <Button onClick={handleOpen}>History</Button>
      <Modal
        title="Allocation History"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Table
          size="small"
          rowKey={(row, index) => row._id || index}
          columns={columns}
          dataSource={allocationHistory}
          loading={loadingHistory}
          pagination={false}
          locale={{ emptyText: 'No allocation/deallocation history yet' }}
        />
      </Modal>
    </>
  );
}

export default AllocationHistoryModal;
