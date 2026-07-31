import { Image } from 'antd'
import React from 'react'

function ActivityGalleryItem({ activity, onClick }) {
  const displayUrl = activity?.resource?.images?.[0] || activity?.resource?.url
  const studentName = activity?.student_id?.username || activity?.course_id?.course_name

  return (
    <div
      className='relative rounded-xl overflow-hidden border border-border bg-card cursor-pointer group/galleryItem'
      onClick={() => onClick?.(activity)}
    >
      <Image
        src={displayUrl}
        alt={activity?.resource?.fileName}
        preview={false}
        className='w-full object-cover'
      />
      <div className='absolute inset-0 bg-black/60 opacity-0 group-hover/galleryItem:opacity-100 transition-opacity flex flex-col justify-end p-3 gap-0.5'>
        <p className='text-white font-bold text-sm truncate'>{activity?.faculty_id?.username}</p>
        {studentName && <p className='text-white/80 text-xs truncate'>{studentName}</p>}
      </div>
    </div>
  )
}

export default ActivityGalleryItem
