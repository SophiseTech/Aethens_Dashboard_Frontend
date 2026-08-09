import { SwapOutlined } from '@ant-design/icons'
import ActivityItem from '@pages/Activities/Components/ActivityItem'
import { formatDate, formatFileSize, formatTime, mergeActivityFeed } from '@utils/helper'
import { Divider } from 'antd'
import React, { useMemo } from 'react'

function ActivityList({ activities, courseSwitches = [] }) {

  const isDocument = (activity) => activity.type === 'attachment' || (!activity.title && !['image', 'video', 'jpeg', 'png', 'jpg'].includes(activity.resource?.fileType))
  const isImage = (activity) => activity.type === 'image' || ['image', 'jpeg', 'png', 'jpg'].includes(activity.resource?.fileType)

  const feed = useMemo(() => mergeActivityFeed(activities, courseSwitches), [activities, courseSwitches])

  if (!activities || activities.length === 0) return <p>No activities!</p>
  return (
    <div className='flex flex-col gap-5 group'>
      {feed.map((item) => (
        item.type === 'course-change' ? (
          <CourseChangeDivider key={item.key} {...item.data} />
        ) : (
          <ActivityItem
            name={item.data?.faculty_id?.username}
            profile_img={item.data?.faculty_id?.profile_img}
            isDocument={isDocument(item.data)}
            time={`${formatDate(item.data.createdAt)} | ${formatTime(item.data.createdAt)}`}
            id={item.data?._id}
            key={item.key}
          >
            {isImage(item.data) ? (
              <ActivityItem.Image url={item.data?.resource?.url} images={item.data?.resource?.images} fileName={item.data?.resource?.fileName || item.data?.title} />
            ) : isDocument(item.data) ? (
              <ActivityItem.Document fileName={item.data?.resource?.fileName} fileSize={formatFileSize(item.data?.resource?.fileSize)} type={item.data?.resource?.fileType} url={item.data?.resource?.url} />
            ) : (
              <ActivityItem.Post title={item.data.title} content={item.data.remarks} />
            )}
          </ActivityItem>
        )
      ))}
    </div>
  )
}

const CourseChangeDivider = ({ fromCourse, toCourse, date }) => (
  <Divider className='!my-0' plain>
    <span className='flex items-center gap-2 | text-xs text-gray-500 2xl:text-sm'>
      <SwapOutlined />
      Switched from <strong>{fromCourse}</strong> to <strong>{toCourse}</strong> &middot; {formatDate(date)}
    </span>
  </Divider>
)

export default ActivityList