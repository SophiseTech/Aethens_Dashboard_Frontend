import Title from '@components/layouts/Title'
import CourseDetail from '@pages/Syllabus/Components/CourseDetail'
import SyllabusList from '@pages/Syllabus/Components/SyllabusList'
import courseStore from '@stores/CourseStore'
import studentStore from '@stores/StudentStore'
import { ROLES } from '@utils/constants'
import { AutoComplete } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { useStore } from 'zustand'

function StudentSyllabus() {
  const [searchText, setSearchText] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const debounceRef = useRef(null)

  const { getCourse, course, loading: courseLoading } = useStore(courseStore)
  const { getStudentSyllabus, syllabus, syllabusLoading, searchResults: studentSearchResults } = useStore(studentStore)

  useEffect(() => {
    if (selectedStudent) {
      const courseId = selectedStudent?.details_id?.course_id?._id || selectedStudent?.details_id?.course_id
      if (courseId) {
        getCourse(courseId, { select: "-modules" })
      }
      getStudentSyllabus(selectedStudent._id, {})
    }
  }, [selectedStudent])

  useEffect(() => {
    const filtered = studentSearchResults
      .filter(s => s.role === ROLES.STUDENT)
      .map(s => ({
        value: s.username,
        label: (
          <div className="flex justify-between">
            <span>{s.username}</span>
            <span className="text-gray-400 text-sm">{s.details_id?.admissionNumber}</span>
          </div>
        ),
        student: s
      }))
    setSearchResults(filtered)
  }, [studentSearchResults])

  const handleSearch = (value) => {
    setSearchText(value)
    clearTimeout(debounceRef.current)
    if (value.trim()) {
      debounceRef.current = setTimeout(() => {
        studentStore.getState().search(20, { searchQuery: value, role: 'student' })
      }, 300)
    } else {
      setSearchResults([])
    }
  }

  const handleSelect = (value, option) => {
    setSelectedStudent(option.student)
    setSearchText(value)
  }

  return (
    <Title title="Student Syllabus">
      <div className="mb-4">
        <AutoComplete
          style={{ width: 300 }}
          options={searchResults}
          onSearch={handleSearch}
          onSelect={handleSelect}
          placeholder="Search by name or admission number"
          allowClear
          value={searchText}
          onClear={() => {
            setSearchText('')
            setSearchResults([])
            setSelectedStudent(null)
          }}
        />
      </div>
      {selectedStudent && (
        <div className="mb-4">
          <p className="font-semibold">
            Showing syllabus for: {selectedStudent.username} ({selectedStudent.details_id?.admissionNumber})
          </p>
        </div>
      )}
      <div className="flex gap-10 | max-lg:flex-col-reverse">
        <SyllabusList
          syllabusData={syllabus}
          loading={syllabusLoading}
          statusFilter="all"
          setStatusFilter={() => {}}
          searchText=""
          setSearchText={() => {}}
          course={course}
        />
        <CourseDetail course={course} />
      </div>
    </Title>
  )
}

export default StudentSyllabus
