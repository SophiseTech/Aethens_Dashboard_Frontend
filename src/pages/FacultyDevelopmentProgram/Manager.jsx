import { PlusCircleFilled } from '@ant-design/icons'
import Title from '@components/layouts/Title'
import useModal from '@hooks/useModal'
import AddTask from '@pages/FacultyDevelopmentProgram/Components/AddTask'
import TaskList from '@pages/FacultyDevelopmentProgram/Components/TaskList'
import centersStore from '@stores/CentersStore'
import facultyDevProgramStore from '@stores/FacultyDevelopmentProgramStore'
import userStore from '@stores/UserStore'
import { Flex } from 'antd'
import React, { useEffect } from 'react'
import { useStore } from 'zustand'

function ManagerFacultyDevelopmentProgram() {

  const { handleCancel, handleOk, isModalOpen, showModal } = useModal()

  const { getPrograms, programs } = useStore(facultyDevProgramStore)
  const { user } = useStore(userStore)
  const { selectedCenter } = useStore(centersStore);
  const centerId = (user.role === "admin" && selectedCenter) ? selectedCenter : user.center_id;

  useEffect(() => {
    getPrograms(10, {
      query: { center_id: centerId },
      populate: "faculty_id",
      sort: "-createdAt"
    })
  }, [selectedCenter])

  return (
    <Title
      title={"Faculty Development Program"}
      button={<Flex>
        <PlusCircleFilled className='text-3xl text-primary' onClick={showModal} />
      </Flex>}
    >
      <TaskList tasks={programs} />
      <AddTask handleCancel={handleCancel} handleOk={handleOk} isModalOpen={isModalOpen} />
    </Title>
  )
}

export default ManagerFacultyDevelopmentProgram