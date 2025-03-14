import Title from '@components/layouts/Title'
import CourseList from '@pages/Courses/Components/CourseList'
import courseStore from '@stores/CourseStore'
import React, { useEffect } from 'react'
import { useStore } from 'zustand'

function FacultyCourses() {

  const { getCourses, courses } = useStore(courseStore)

  useEffect(() => {
    if (!courses || courses.length === 0) {
      getCourses()
    }
  }, [])

  
  return (
    <Title title={"Courses"}>
      <CourseList />
    </Title>
  )
}

export default FacultyCourses