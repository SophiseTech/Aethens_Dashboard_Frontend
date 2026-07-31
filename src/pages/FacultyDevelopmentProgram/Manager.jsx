import { PlusCircleFilled } from '@ant-design/icons'
import Filters from '@components/Filters'
import Title from '@components/layouts/Title'
import useModal from '@hooks/useModal'
import AddTask from '@pages/FacultyDevelopmentProgram/Components/AddTask'
import EditTask from '@pages/FacultyDevelopmentProgram/Components/EditTask'
import TaskList from '@pages/FacultyDevelopmentProgram/Components/TaskList'
import centersStore from '@stores/CentersStore'
import facultyDevProgramStore from '@stores/FacultyDevelopmentProgramStore'
import facultyStore from '@stores/FacultyStore'
import userStore from '@stores/UserStore'
import { Flex } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStore } from 'zustand'

function ManagerFacultyDevelopmentProgram() {

  const { handleCancel, handleOk, isModalOpen, showModal } = useModal()
  const { handleCancel: handleEditCancel, handleOk: handleEditOk, isModalOpen: isEditModalOpen, showModal: showEditModal } = useModal()
  const [editingRecord, setEditingRecord] = useState(null)
  const [extraFilters, setExtraFilters] = useState({})

  const { getProgramsPaginated, programs, total, loading } = useStore(facultyDevProgramStore)
  const { getFacultiesByCenter, faculties } = useStore(facultyStore)
  const { user } = useStore(userStore)
  const { selectedCenter } = useStore(centersStore);
  const centerId = ((user.role === "admin" || user.role === "academic_manager") && selectedCenter) ? selectedCenter : user.center_id;

  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = parseInt(searchParams.get('page')) || 1
  const pageSize = 10

  const isMounted = useRef(false)
  const prevCenterIdRef = useRef(centerId)

  const buildQuery = () => ({ center_id: centerId, ...extraFilters })

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
    getFacultiesByCenter(0)
  }, [selectedCenter])

  useEffect(() => {
    getProgramsPaginated(pageSize, currentPage, {
      query: buildQuery(),
      populate: "faculty_id",
      sort: "-createdAt"
    })
  }, [centerId, currentPage, extraFilters])

  const handleOkWithRefresh = () => {
    handleOk()
    if (currentPage === 1) {
      getProgramsPaginated(pageSize, 1, {
        query: buildQuery(),
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

  const handleEditOkWithRefresh = () => {
    handleEditOk()
    setEditingRecord(null)
  }

  const handleEditCancelAndClear = () => {
    handleEditCancel()
    setEditingRecord(null)
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    showEditModal()
  }

  const handlePageChange = (page) => {
    setSearchParams((prev) => {
      prev.set('page', page)
      return prev
    })
  }

  const resetToFirstPage = () => {
    if (currentPage !== 1) {
      setSearchParams((prev) => {
        prev.set('page', 1)
        return prev
      })
    }
  }

  const handleFilterApply = (formattedFilters) => {
    resetToFirstPage()
    setExtraFilters(formattedFilters)
  }

  const handleFilterReset = () => {
    resetToFirstPage()
    setExtraFilters({})
  }

  const facultyOptions = faculties?.map(faculty => ({
    label: faculty.username,
    value: faculty._id,
  })) || []

  const filterConfig = [
    { key: "createdAt", type: "date", placeholder: "Filter by date" },
    { key: "faculty_id", type: "select", placeholder: "Filter by faculty", options: facultyOptions },
  ]

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
      <Filters filters={filterConfig} onApply={handleFilterApply} onReset={handleFilterReset} />
      <TaskList tasks={programs} loading={loading} pagination={pagination} onEdit={handleEdit} />
      <AddTask handleCancel={handleCancel} handleOk={handleOkWithRefresh} isModalOpen={isModalOpen} />
      <EditTask record={editingRecord} handleCancel={handleEditCancelAndClear} handleOk={handleEditOkWithRefresh} isModalOpen={isEditModalOpen} />
    </Title>
  )
}

export default ManagerFacultyDevelopmentProgram
