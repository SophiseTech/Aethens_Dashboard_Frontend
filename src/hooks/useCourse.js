import courseStore from '@stores/CourseStore'
import React from 'react'

function useCourse() {

  const {
    getCourse,

    course,
    loading
  } = courseStore()

  return {
    getCourse,

    course,
    loading
  }
}

export default useCourse