import ActivityItem from '@pages/Activities/Components/ActivityItem'
import { formatDate, formatFileSize, formatTime } from '@utils/helper'
import React from 'react'

function ActivityList({ activities }) {

  const isDocument = (activity) => activity.type === 'attachment' || (!activity.title && activity.resource?.fileType !== 'image')
  const isImage = (activity) => activity.type === 'image' || activity.resource?.fileType === 'image'

  if (!activities || activities.length === 0) return <p>No activities!</p>
  return (
    <div className='flex flex-col gap-5 group'>
      {activities?.map((activity, index) => (
        <ActivityItem
          name={activity?.faculty_id?.username}
          profile_img={activity?.faculty_id?.profile_img}
          isDocument={isDocument(activity)}
          time={`${formatDate(activity.createdAt)} | ${formatTime(activity.createdAt)}`}
          id={activity?._id}
          key={index}
        >
          {isImage(activity) ? (
            <ActivityItem.Image url={activity?.resource?.url} fileName={activity?.resource?.fileName || activity?.title} />
          ) : isDocument(activity) ? (
            <ActivityItem.Document fileName={activity?.resource?.fileName} fileSize={formatFileSize(activity?.resource?.fileSize)} type={activity?.resource?.fileType} url={activity?.resource?.url} />
          ) : (
            <ActivityItem.Post title={activity.title} content={activity.remarks} />
          )}
        </ActivityItem>
      ))}
    </div>
  )
}

export default ActivityList