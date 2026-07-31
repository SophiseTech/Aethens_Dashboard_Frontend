import MasonryLayout from '@components/MasonryLayout'
import ActivityGalleryDrawer from '@pages/ActivityGallery/Components/ActivityGalleryDrawer'
import ActivityGalleryItem from '@pages/ActivityGallery/Components/ActivityGalleryItem'
import activitiesStore from '@stores/ActivitiesStore'
import { Skeleton } from 'antd'
import React, { useEffect, useState } from 'react'
import { useStore } from 'zustand'

const IMAGE_FILE_TYPES = ["image", "jpeg", "png", "jpg"]

function ActivityGalleryList() {
  const { getActivities, activities, loading } = useStore(activitiesStore)
  const [selectedActivity, setSelectedActivity] = useState(null)

  useEffect(() => {
    getActivities(30, {
      query: { completed: true, "resource.fileType": { $in: IMAGE_FILE_TYPES } },
      populate: [
        { path: "faculty_id", options: { select: "username _id profile_img" } },
        { path: "student_id", options: { select: "username _id profile_img" } },
        { path: "course_id", options: { select: "course_name _id" } },
      ]
    })
  }, [])

  if (loading) return <Loader />

  if (!activities || activities.length === 0) return <p>No completed activities to display</p>

  return (
    <div>
      <MasonryLayout>
        {activities.map((activity, index) => (
          <ActivityGalleryItem
            key={activity?._id || index}
            activity={activity}
            onClick={setSelectedActivity}
          />
        ))}
      </MasonryLayout>
      <ActivityGalleryDrawer
        activity={selectedActivity}
        open={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />
    </div>
  )
}

const Loader = () => (
  <MasonryLayout>
    <Skeleton.Node active fullSize className='!w-full' style={{ height: 300 }} />
    <Skeleton.Node active fullSize className='!w-full' style={{ height: 220 }} />
    <Skeleton.Node active fullSize className='!w-full' style={{ height: 260 }} />
    <Skeleton.Node active fullSize className='!w-full' style={{ height: 180 }} />
    <Skeleton.Node active fullSize className='!w-full' style={{ height: 240 }} />
  </MasonryLayout>
)

export default ActivityGalleryList
