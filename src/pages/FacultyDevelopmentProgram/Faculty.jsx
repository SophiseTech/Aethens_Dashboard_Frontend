import { PlusCircleFilled } from '@ant-design/icons'
import Title from '@components/layouts/Title'
import useModal from '@hooks/useModal'
import AddTask from '@pages/FacultyDevelopmentProgram/Components/AddTask'
import TaskList from '@pages/FacultyDevelopmentProgram/Components/TaskList'
import facultyDevProgramStore from '@stores/FacultyDevelopmentProgramStore'
import userStore from '@stores/UserStore'
import { Flex } from 'antd'
import React, { useEffect } from 'react'
import { useStore } from 'zustand'

function FacultyDevelopmentProgram() {

  const { handleCancel, handleOk, isModalOpen, showModal } = useModal()

  const { getPrograms, programs } = useStore(facultyDevProgramStore)
  const { user } = useStore(userStore)

  useEffect(() => {
    getPrograms(10, {
      populate: "faculty_id",
      sort: "-createdAt"
    })
  }, [])

  return (
    <Title
      title={"Faculty Development Program"}
    >
      <TaskList tasks={programs} />
      <AddTask handleCancel={handleCancel} handleOk={handleOk} isModalOpen={isModalOpen} />
    </Title>
  )
}

export default FacultyDevelopmentProgram