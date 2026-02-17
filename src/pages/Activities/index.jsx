import Title from '@components/layouts/Title'
import AddActivity from '@pages/Activities/Components/AddActivity';
import activitiesStore from '@stores/ActivitiesStore'
import studentStore from '@stores/StudentStore';
import userStore from '@stores/UserStore';
import { ROLES } from '@utils/constants';
import permissions from '@utils/permissions';
import { Segmented, Skeleton } from 'antd';
import { lazy, Suspense, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { useStore } from 'zustand';
const ActivityList = lazy(() => import('@pages/Activities/Components/ActivityList'));


function Activities() {

  const { loading, getActivities, activities } = activitiesStore()
  const { id } = useParams()
  const { user } = useStore(userStore)
  const [activityType, setActivityType] = useState("Individual")
  const { activeStudent, getStudentById } = studentStore()

  useEffect(() => {
    if (activityType === "Individual") {
      fetchActivity({ student_id: id || user._id })
    } else if (activityType === "Course") {
      fetchActivity({ course_id: user.details_id?.course_id })
    }
  }, [activityType])

  useEffect(() => {
    if (id && id !== activeStudent?._id) {
      getStudentById(id, {})
    }
  }, [])

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
        <ActivityList activities={activities} />
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