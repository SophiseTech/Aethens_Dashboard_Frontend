import Title from '@components/layouts/Title'
import AddActivity from '@pages/Activities/Components/AddActivity';
import studentService from '@services/Student';
import activitiesStore from '@stores/ActivitiesStore'
import studentStore from '@stores/StudentStore';
import userStore from '@stores/UserStore';
import { ROLES } from '@utils/constants';
import { buildCourseSwitches } from '@utils/helper';
import permissions from '@utils/permissions';
import { Button, Flex, Segmented, Skeleton } from 'antd';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom';
import { useStore } from 'zustand';
const ActivityList = lazy(() => import('@pages/Activities/Components/ActivityList'));


function Activities() {

  const { loading, getActivities, activities, total } = activitiesStore()
  const { id } = useParams()
  const { user } = useStore(userStore)
  const [activityType, setActivityType] = useState("Individual")
  const { activeStudent, getStudentById } = studentStore()
  const [courseHistories, setCourseHistories] = useState([])

  const studentInView = id ? activeStudent : user
  const studentUserId = id || user._id

  const currentQuery = activityType === "Individual"
    ? { student_id: studentUserId }
    : { course_id: user.details_id?.course_id }

  useEffect(() => {
    fetchActivity(currentQuery)
  }, [activityType])

  useEffect(() => {
    if (id && id !== activeStudent?._id) {
      getStudentById(id, {})
    }
  }, [])

  useEffect(() => {
    if (activityType !== "Individual" || !studentUserId) {
      setCourseHistories([])
      return
    }
    studentService.getCourseHistory(0, 0, { query: { user_id: studentUserId } })
      .then((response) => setCourseHistories(response?.courseHistories || []))
  }, [activityType, studentUserId])

  const fetchActivity = (query) => {
    getActivities(10, {
      query: query,
      populate: {
        path: "faculty_id",
        options: {
          select: "username _id email profile_img"
        }
      }
    })
  }

  const currentCourse = {
    course_name: studentInView?.details_id?.course?.course_name,
    start_date: studentInView?.details_id?.enrollment_date,
  }

  const courseSwitches = useMemo(
    () => activityType === "Individual" ? buildCourseSwitches(courseHistories, currentCourse) : [],
    [activityType, courseHistories, currentCourse.course_name, currentCourse.start_date]
  )

  const hasMore = activities.length < total

  // const groupedActivities = useMemo(() => groupActivities(activities), [activities]);
  return (
    <Title title={"Activities"} button={permissions.activities.add.includes(user.role) &&
      <AddActivity student={activeStudent} activityType={activityType} />
    }>
      <Suspense fallback={<Loader />}>
        {user.role === ROLES.STUDENT &&
          <Segmented
            className='w-fit'
            options={['Individual', "Course"]}
            onChange={(value) => {
              setActivityType(value)
            }}
          />
        }
        <ActivityList activities={activities} courseSwitches={courseSwitches} />
        {hasMore &&
          <Flex justify='center'>
            <Button onClick={() => fetchActivity(currentQuery)} loading={loading}>
              Load More
            </Button>
          </Flex>
        }
      </Suspense>
    </Title>
  )
}

const Loader = () => (
  <div className='w-1/2'>
    <Skeleton
      avatar
      paragraph={{
        rows: 4,
      }}
    />
  </div>
)
export default Activities