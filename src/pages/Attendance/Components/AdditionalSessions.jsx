import { ThunderboltOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import Chip from '@components/Chips/Chip'
import { Card, Empty, Flex, Statistic, Table } from 'antd'
import dayjs from 'dayjs'

function AdditionalSessions({ stats, loading }) {
  const { additionalCount, additionalSlots } = stats || {}

  const columns = [
    {
      title: "Date",
      dataIndex: "start_date",
      render: (value) => dayjs(value).format("DD MMM, YYYY")
    },
    {
      title: "Time",
      dataIndex: "start_date",
      key: "time",
      render: (_, record) => `${dayjs(record.start_date).format("hh:mm A")} - ${dayjs(record.end_date).format("hh:mm A")}`
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (value) => (
        <Chip
          type={value === "attended" ? "success" : value === "absent" ? "danger" : "warning"}
          label={value?.charAt(0).toUpperCase() + value?.slice(1)}
          glow={false}
        />
      )
    },
  ]

  return (
    <Card bordered={false} className='border border-border w-fit'>
      <Flex vertical gap={16}>
        <Flex align='center' justify='space-between'>
          <Flex align='center' gap={8}>
            <div className='bg-primary p-2 rounded-lg flex flex-shrink-0'>
              <ThunderboltOutlined className='text-xl text-white' />
            </div>
            <p className='text-gray-500 font-bold'>Additional Sessions</p>
          </Flex>
          <Flex gap={16}>
            <Flex align='center' gap={4}>
              <CheckCircleOutlined className='text-green-600' />
              <span className='font-bold text-lg'>{additionalCount?.attended || 0}</span>
              <span className='text-gray-400 text-xs'>Attended</span>
            </Flex>
            <Flex align='center' gap={4}>
              <CloseCircleOutlined className='text-red-500' />
              <span className='font-bold text-lg'>{additionalCount?.non_attended || 0}</span>
              <span className='text-gray-400 text-xs'>Unattended</span>
            </Flex>
          </Flex>
        </Flex>

        {additionalSlots?.length > 0 ? (
          <Table
            columns={columns}
            dataSource={additionalSlots}
            rowKey="_id"
            pagination={false}
            size="small"
            loading={loading}
          />
        ) : (
          <Empty description="No additional sessions" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Flex>
    </Card>
  )
}

export default AdditionalSessions
