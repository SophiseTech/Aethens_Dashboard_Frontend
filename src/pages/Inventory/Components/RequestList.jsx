import { CheckOutlined, CloseOutlined, LoadingOutlined } from '@ant-design/icons';
import { Card, Flex, List, message } from 'antd';
import { useEffect, useState } from 'react';

function RequestList({ loadData, items, fromField, loading = false, approveAction = async () => { }, rejectAction = async () => { }, render = () => { } }) {

  useEffect(() => {
    loadData()
  }, [])

  return (
    <List
      dataSource={items}
      renderItem={(item) => <List.Item><RequestItem item={item} fromField={fromField} approveAction={approveAction} rejectAction={rejectAction} render={render} /></List.Item>}
      loading={loading}
    />
  )
}

const RequestItem = ({ item, fromField, approveAction, rejectAction, render }) => {
  const [actionLoading, setActionLoading] = useState(null); // 'approve' | 'reject' | null
  const [hoveredAction, setHoveredAction] = useState(null); // 'approve' | 'reject' | null

  const approveRequest = async (id) => {
    if (actionLoading) return; // Prevent multiple clicks
    setActionLoading('approve');
    try {
      await approveAction(id);
      message.success('Request approved successfully');
    } catch (error) {
      message.error('Failed to approve request');
    } finally {
      setActionLoading(null);
    }
  }

  const rejectRequest = async (id) => {
    if (actionLoading) return; // Prevent multiple clicks
    setActionLoading('reject');
    try {
      await rejectAction(id);
      message.success('Request rejected');
    } catch (error) {
      message.error('Failed to reject request');
    } finally {
      setActionLoading(null);
    }
  }

  const approveButtonStyle = {
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: actionLoading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease-in-out',
    backgroundColor: actionLoading === 'approve'
      ? '#D1E499'
      : hoveredAction === 'approve'
        ? '#e8f5e9'
        : 'transparent',
    transform: actionLoading === 'approve'
      ? 'scale(0.95)'
      : hoveredAction === 'approve'
        ? 'scale(1.05)'
        : 'scale(1)',
    opacity: actionLoading && actionLoading !== 'approve' ? 0.5 : 1,
    boxShadow: hoveredAction === 'approve' ? '0 2px 8px rgba(79,101,30,0.2)' : 'none',
  };

  const rejectButtonStyle = {
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: actionLoading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease-in-out',
    backgroundColor: actionLoading === 'reject'
      ? '#ffcdd2'
      : hoveredAction === 'reject'
        ? '#ffebee'
        : 'transparent',
    transform: actionLoading === 'reject'
      ? 'scale(0.95)'
      : hoveredAction === 'reject'
        ? 'scale(1.05)'
        : 'scale(1)',
    opacity: actionLoading && actionLoading !== 'reject' ? 0.5 : 1,
    boxShadow: hoveredAction === 'reject' ? '0 2px 8px rgba(244,67,54,0.2)' : 'none',
  };

  return (<Card
    className='w-full'
    actions={[
      <Flex
        align='center'
        justify='center'
        gap={10}
        className='text-primary'
        style={approveButtonStyle}
        onClick={() => approveRequest(item._id)}
        onMouseEnter={() => !actionLoading && setHoveredAction('approve')}
        onMouseLeave={() => setHoveredAction(null)}
      >
        {actionLoading === 'approve' ? <LoadingOutlined spin /> : <CheckOutlined key="approve" />}
        {actionLoading === 'approve' ? 'Approving...' : 'Approve'}
      </Flex>,
      <Flex
        align='center'
        justify='center'
        gap={10}
        className='text-red-500'
        style={rejectButtonStyle}
        onClick={() => rejectRequest(item._id)}
        onMouseEnter={() => !actionLoading && setHoveredAction('reject')}
        onMouseLeave={() => setHoveredAction(null)}
      >
        {actionLoading === 'reject' ? <LoadingOutlined spin /> : <CloseOutlined key="reject" />}
        {actionLoading === 'reject' ? 'Rejecting...' : 'Reject'}
      </Flex>,
    ]}
  >
    <Card.Meta
      title={`Request from ${item?.raised_by_center?.[fromField]}`}
      description={item?.request_details}
    />
    {render(item)}
  </Card>)
}
export default RequestList