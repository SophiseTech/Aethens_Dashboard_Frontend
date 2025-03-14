import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import CustomDatePicker from '@components/form/CustomDatePicker'
import CustomForm from '@components/form/CustomForm'
import finalProjectStore from '@stores/FinalProjectStore'
import userStore from '@stores/UserStore'
import { formatDate } from '@utils/helper'
import { Button, Descriptions, Flex, Form, Modal } from 'antd'
import _ from 'lodash'
import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from 'zustand'

function ProjectDetailModal({ isModalOpen, handleOk, handleCancel, student_id }) {

  const { getProject, project, loading, editProject, createLoading } = useStore(finalProjectStore)
  const { user } = useStore(userStore)
  const [form] = Form.useForm()

  useEffect(() => {
    if (isModalOpen && (!project || project?.student_id !== student_id)) {
      getProject({
        query: {
          student_id: student_id,
        },
        sort: "-createdAt"
      })
    }
  }, [student_id, isModalOpen])

  const approveProject = async (id) => {
    const deadline = form.getFieldValue("deadline")
    await editProject(id, { status: "approved", deadline })
  }

  const rejectProject = async (id) => {
    await editProject(id, { status: "rejected" })
  }


  const items = [
    {
      key: "1",
      label: "Project Details",
      children: project?.project_details
    },
    {
      key: "2",
      label: "Image",
      children: <Link to={project?.image || "#"} target='_blank'>Click here to view image</Link>
    },
    {
      key: "4",
      label: "Deadline",
      children: (project.status === "approved" && project?.deadline) ? formatDate(project?.deadline) : "-----"
    },
    {
      key: "3",
      label: "Status",
      children: project?.status
    },
  ]

  const initialValues = {
    deadline: ""
  }

  return (
    <Modal
      title={"Request Final Project"}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
    >
      {_.isEmpty(project) ?
        <p>Student haven't requested any project</p>
        :
        <>
          <Descriptions bordered items={items} column={1} />

          {project?.status === "pending" &&
            <div className='mt-5'>
              <CustomForm form={form} initialValues={initialValues} action={() => { }}>
                <CustomDatePicker label={"Select Deadline"} name={"deadline"} />
              </CustomForm>
              <Flex gap={10}>
                <Button variant='solid' color='green' icon={<CheckOutlined />} onClick={() => { approveProject(project._id) }} loading={createLoading}>Approve</Button>
                <Button variant='solid' color='red' icon={<CloseOutlined />} onClick={() => rejectProject(project._id)} loading={createLoading}>Reject</Button>
              </Flex>
            </div>
          }
        </>
      }
    </Modal>
  )
}

export default ProjectDetailModal