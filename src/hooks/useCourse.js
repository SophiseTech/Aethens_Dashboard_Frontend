import courseStore from '@stores/CourseStore'
import React, { useMemo } from 'react'

function useCourse() {

  const {
    getCourse,
    getCourses,

    course,
    courses,
    loading,

    pickerCourses,
    pickerTotal,
    pickerLoading,
    getPickerCourses
  } = courseStore()

  const courseOptions = useMemo(() => courses?.map(course => ({label: course.course_name, value: course._id})) || [], [courses]) || []
  const pickerOptions = useMemo(() => pickerCourses?.map(course => ({label: course.course_name, value: course._id})) || [], [pickerCourses])

  return {
    getCourse,
    getCourses,

    course,
    courses,
    loading,
    courseOptions,

    pickerCourses,
    pickerTotal,
    pickerLoading,
    getPickerCourses,
    pickerOptions
  }
}

export default useCourse