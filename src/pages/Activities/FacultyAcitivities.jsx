import Title from '@components/layouts/Title'
import ActivityList from '@pages/Activities/Components/ActivityList'
import AddActivity from '@pages/Activities/Components/AddActivity'
import activitiesStore from '@stores/ActivitiesStore'
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useStore } from 'zustand'

function FacultyAcitivities() {
  const { id } = useParams()
  const { loading, getActivities, activities } = useStore(activitiesStore)

  useEffect(() => {
    getActivities(10, {
      query: { course_id: id }, populate: {
        path: "faculty_id",
        options: {
          select: "username _id email profile_img"
        }
      }
    })
  }, [])

  return (
    <Title title={"Activities"} button={<AddActivity />}>
      <ActivityList activities={activities} />
    </Title>
  )
}

export default FacultyAcitivities