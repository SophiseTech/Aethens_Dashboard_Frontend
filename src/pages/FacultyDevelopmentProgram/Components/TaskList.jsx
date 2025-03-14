import Chip from "@components/Chips/Chip"
import facultyDevProgramStore from "@stores/FacultyDevelopmentProgramStore"
import userStore from "@stores/UserStore"
import { formatDate } from "@utils/helper"
import permissions from "@utils/permissions"
import { Button, Flex, Table } from "antd"
import { useStore } from "zustand"

function TaskList({ tasks, loading }) {

  const { editProgram } = useStore(facultyDevProgramStore)
  const { user } = useStore(userStore)

  const handleMarkDone = async (id) => {
    if (!permissions.fda.mark_don.includes(user.role)) return
    await editProgram(id, { status: "completed" })
  }

  const columns = [
    {
      title: "Faculty Name",
      dataIndex: ["faculty_id", "username"],
      // width: "10%"
    },
    {
      title: "Task",
      dataIndex: "details",
      // width: "60%"
    },
    {
      title: "Status",
      dataIndex: "status",
      // width: "10%",
      render: (value) => <Chip type={value === "pending" ? "danger" : "success"} label={value?.toUpperCase()} glow={false} />

    },
    {
      title: "Date",
      dataIndex: "createdAt",
      render: (value) => value ? <p className="whitespace-nowrap">{formatDate(value)}</p> : "",
      // width: "10%",
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, record) => (
        <Flex>
          {permissions.fda.mark_don.includes(user.role) &&
            <Button variant="filled" color="green" disabled={record.status === "completed"} onClick={() => handleMarkDone(record._id)}>Mark Done</Button>
          }
        </Flex>
      )
    },
  ]

  return (
    <Table dataSource={tasks} columns={columns} loading={loading}
      // scroll={{
      //   x: "max-content",
      // }}
    />
  )
}

export default TaskList