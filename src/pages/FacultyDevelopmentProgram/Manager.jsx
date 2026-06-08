import { PlusCircleFilled } from '@ant-design/icons'
import Title from '@components/layouts/Title'
import useModal from '@hooks/useModal'
import AddTask from '@pages/FacultyDevelopmentProgram/Components/AddTask'
import TaskList from '@pages/FacultyDevelopmentProgram/Components/TaskList'
import centersStore from '@stores/CentersStore'
import facultyDevProgramStore from '@stores/FacultyDevelopmentProgramStore'
import userStore from '@stores/UserStore'
import { Flex } from 'antd'
import React, { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStore } from 'zustand'

function ManagerFacultyDevelopmentProgram() {

  const { handleCancel, handleOk, isModalOpen, showModal } = useModal()

  const { getProgramsPaginated, programs, total, loading } = useStore(facultyDevProgramStore)
  const { user } = useStore(userStore)
  const { selectedCenter } = useStore(centersStore);
  const centerId = ((user.role === "admin" || user.role === "academic_manager") && selectedCenter) ? selectedCenter : user.center_id;

  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = parseInt(searchParams.get('page')) || 1
  const pageSize = 10

  const isMounted = useRef(false)
  const prevCenterIdRef = useRef(centerId)

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      prevCenterIdRef.current = centerId
      return
    }

    if (centerId && centerId !== prevCenterIdRef.current) {
      prevCenterIdRef.current = centerId
      setSearchParams((prev) => {
        prev.set('page', 1)
        return prev
      })
    }
  }, [centerId])

  useEffect(() => {
    getProgramsPaginated(pageSize, currentPage, {
      query: { center_id: centerId },
      populate: "faculty_id",
      sort: "-createdAt"
    })
  }, [centerId, currentPage])

  const handleOkWithRefresh = () => {
    handleOk()
    if (currentPage === 1) {
      getProgramsPaginated(pageSize, 1, {
        query: { center_id: centerId },
        populate: "faculty_id",
        sort: "-createdAt"
      })
    } else {
      setSearchParams((prev) => {
        prev.set('page', 1)
        return prev
      })
    }
  }

  const handlePageChange = (page) => {
    setSearchParams((prev) => {
      prev.set('page', page)
      return prev
    })
  }

  const pagination = {
    current: currentPage,
    pageSize: pageSize,
    total: total,
    onChange: handlePageChange,
    showSizeChanger: false,
    showTotal: (t) => `Total ${t} tasks`,
  }

  return (
    <Title
      title={"Faculty Development Program"}
      button={<Flex>
        <PlusCircleFilled className='text-3xl text-primary' onClick={showModal} />
      </Flex>}
    >
      <TaskList tasks={programs} loading={loading} pagination={pagination} />
      <AddTask handleCancel={handleCancel} handleOk={handleOkWithRefresh} isModalOpen={isModalOpen} />
    </Title>
  )
}

export default ManagerFacultyDevelopmentProgram