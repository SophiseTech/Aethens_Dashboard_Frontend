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
    <Card
      bordered={false}
      className='border border-border w-fit max-h-[380px]'
      styles={{ body: { height: '100%', display: 'flex', flexDirection: 'column' } }}
    >
      <Flex vertical gap={16} className='h-full' style={{ minHeight: 0 }}>
        <Flex align='center' justify='space-between' className='flex-shrink-0'>
          <Flex align='center' gap={8}>
            <div className='flex flex-shrink-0 p-2 rounded-lg bg-primary'>
              <ThunderboltOutlined className='text-xl text-white' />
            </div>
            <p className='font-bold text-gray-500'>Additional Sessions</p>
          </Flex>
          <Flex gap={16}>
            <Flex align='center' gap={4}>
              <CheckCircleOutlined className='text-green-600' />
              <span className='text-lg font-bold'>{additionalCount?.attended || 0}</span>
              <span className='text-xs text-gray-400'>Attended</span>
            </Flex>
            <Flex align='center' gap={4}>
              <CloseCircleOutlined className='text-red-500' />
              <span className='text-lg font-bold'>{additionalCount?.non_attended || 0}</span>
              <span className='text-xs text-gray-400'>Unattended</span>
            </Flex>
          </Flex>
        </Flex>

        {additionalSlots?.length > 0 ? (
          <div className='overflow-hidden flex-1'>
            <Table
              columns={columns}
              dataSource={additionalSlots}
              rowKey="_id"
              pagination={false}
              size="small"
              loading={loading}
              scroll={{ y: 220 }}
            />
          </div>
        ) : (
          <div className='flex flex-grow justify-center items-center'>
            <Empty description="No additional sessions" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        )}
      </Flex>
    </Card>
  )
}

export default AdditionalSessions
