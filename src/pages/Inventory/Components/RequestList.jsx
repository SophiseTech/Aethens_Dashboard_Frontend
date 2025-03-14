import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Card, Flex, List } from 'antd';
import { useEffect } from 'react';

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

  const approveRequest = async (id) => {
    await approveAction(id)
  }

  const rejectRequest = async (id) => {
    await rejectAction(id)
  }

  return (<Card
    className='w-full'
    actions={[
      <Flex align='center' justify='center' gap={10} className='text-green-500' onClick={() => { approveRequest(item._id) }}><CheckOutlined key="approve" /> Aprove</Flex>,
      <Flex align='center' justify='center' gap={10} className='text-red-500' onClick={() => { rejectRequest(item._id) }}><CloseOutlined key="edit" /> Reject</Flex>,
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