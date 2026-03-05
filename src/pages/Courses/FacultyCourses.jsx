import Title from '@components/layouts/Title'
import CourseList from '@pages/Courses/Components/CourseList'
import courseStore from '@stores/CourseStore'
import React, { useEffect, useState } from 'react'
import { useStore } from 'zustand'

const PAGE_SIZE = 10

function FacultyCourses() {
  const { getCoursesForAdmin } = useStore(courseStore)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    getCoursesForAdmin(PAGE_SIZE, 1)
  }, [])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    getCoursesForAdmin(PAGE_SIZE, page)
  }

  return (
    <Title title={"Courses"}>
      <CourseList
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
      />
    </Title>
  )
}

export default FacultyCourses