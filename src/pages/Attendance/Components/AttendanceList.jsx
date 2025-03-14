import Chip from '@components/Chips/Chip'
import { formatTime } from '@utils/helper'
import { Table } from 'antd'
import dayjs from 'dayjs'

function AttendanceList({ attendances = [] }) {


  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      render: (value) => dayjs(value).format("DD MMM, YYYY")
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (value) => <Chip type={value === "present" ? "success" : "danger"} label={value === "present" ? "Present" : "Absent"} glow={false} />
    },
    {
      title: "Clocked In",
      dataIndex: "clocked_in",
      render: (value) => <p>{formatTime(value)}</p>
    },
    {
      title: "Clocked Out",
      dataIndex: "clocked_out",
      render: (value) => <p>{formatTime(value)}</p>
    }
  ]

  return (
    <Table columns={columns} dataSource={attendances || []} />
  )
}

export default AttendanceList