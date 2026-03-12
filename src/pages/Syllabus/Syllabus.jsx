import Title from '@components/layouts/Title'
import CourseDetail from '@pages/Syllabus/Components/CourseDetail'
import SyllabusList from '@pages/Syllabus/Components/SyllabusList'
import courseStore from '@stores/CourseStore'
import studentStore from '@stores/StudentStore'
import userStore from '@stores/UserStore'
import { ROLES } from '@utils/constants'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useStore } from 'zustand'

function Syllabus() {
  const { courseId, studentId } = useParams();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');

  const { getCourse, course, loading } = useStore(courseStore);
  const { user } = useStore(userStore);
  const { getStudentSyllabus, syllabus, syllabusLoading } = useStore(studentStore);

  const isViewingOtherStudent = studentId && studentId !== user?._id;
  const shouldFetchStudentSyllabus = user?.role === ROLES.STUDENT 
    ? user._id 
    : studentId;

  useEffect(() => {
    if (!user || !user._id) return;
    
    if (user.role === ROLES.STUDENT) {
      getStudentSyllabus(user._id, {
        status: statusFilter,
        search: searchText
      });
      if (courseId) {
        getCourse(courseId, { select: "-modules" });
      }
    } else if (studentId) {
      getStudentSyllabus(studentId, {
        status: statusFilter,
        search: searchText
      });
      if (courseId) {
        getCourse(courseId, { select: "-modules" });
      }
    } else if (courseId) {
      getCourse(courseId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, user?.role, courseId, studentId, statusFilter, searchText]);

  const syllabusData = shouldFetchStudentSyllabus ? syllabus : course;
  const isLoading = shouldFetchStudentSyllabus ? syllabusLoading : loading;

  return (
    <Title title="Syllabus">
      <div className="flex gap-10 | max-lg:flex-col-reverse">
        <SyllabusList
          syllabusData={syllabusData}
          loading={isLoading}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          searchText={searchText}
          setSearchText={setSearchText}
          course={course}
        />
        <CourseDetail course={course} />
      </div>
    </Title>
  );
}

export default Syllabus;
