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
  const { id } = useParams();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');

  const { getCourse, course, loading } = useStore(courseStore);
  const { user } = useStore(userStore);
  const { getStudentSyllabus, syllabus, syllabusLoading } = useStore(studentStore);

  useEffect(() => {
    if (!user || !user._id) return; // Avoid unnecessary calls if user is undefined
    if (user.role === ROLES.STUDENT) {
      getStudentSyllabus(user._id, {
        status: statusFilter,
        search: searchText
      });
      if (id) {
        getCourse(id, { select: "-modules" });
      }
    } else if (id) {
      getCourse(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, user?.role, id, statusFilter, searchText]); // Re-fetch when filters change

  return (
    <Title title="Syllabus">
      <div className="flex gap-10 | max-lg:flex-col-reverse">
        <SyllabusList
          syllabusData={user?.role === ROLES.STUDENT ? syllabus : course}
          loading={user?.role === ROLES.STUDENT ? syllabusLoading : loading}
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
