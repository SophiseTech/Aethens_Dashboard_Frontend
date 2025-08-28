import courseStore from '@stores/CourseStore'
import React, { useMemo } from 'react'

function useCourse() {

  const {
    getCourse,
    getCourses,

    course,
    courses,
    loading
  } = courseStore()

  const courseOptions = useMemo(() => courses?.map(course => ({label: course.course_name, value: course._id})) || [], [courses]) || []

  return {
    getCourse,
    getCourses,

    course,
    courses,
    loading,
    courseOptions
  }
}

export default useCourse