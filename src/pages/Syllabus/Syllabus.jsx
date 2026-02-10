import Title from '@components/layouts/Title'
import CourseDetail from '@pages/Syllabus/Components/CourseDetail'
import SyllabusList from '@pages/Syllabus/Components/SyllabusList'
import courseStore from '@stores/CourseStore'
import studentStore from '@stores/StudentStore'
import userStore from '@stores/UserStore'
import { ROLES } from '@utils/constants'
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useStore } from 'zustand'

function Syllabus() {
  const { id } = useParams();

  const { getCourse, course, loading } = useStore(courseStore);
  const { user } = useStore(userStore);
  const { getStudentSyllabus, syllabus, syllabusLoading } = useStore(studentStore);

  useEffect(() => {
    if (!user) return; // Avoid unnecessary calls if user is undefined
    if (user.role === ROLES.STUDENT) {
      getStudentSyllabus()
      getCourse(id, { select: "-modules" })

    } else if (id) {

      getCourse(id)

    }
  }, [user, id, getStudentSyllabus, getCourse]); // Ensure stable function dependencies

  return (
    <Title title="Syllabus">
      <div className="flex gap-10 | max-lg:flex-col-reverse">
        <SyllabusList
          syllabusData={user?.role === ROLES.STUDENT ? syllabus : course}
          loading={user?.role === ROLES.STUDENT ? syllabusLoading : loading}
        />
        <CourseDetail course={course} />
      </div>
    </Title>
  );
}

export default Syllabus;
