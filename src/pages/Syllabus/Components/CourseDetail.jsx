import { Avatar } from 'antd'
import React from 'react'

function CourseDetail({ course }) {
  return (
    <div className='bg-card p-3 rounded-xl flex items-start gap-10 flex-col | w-full lg:w-1/3'>
      <div className='w-full | max-lg:hidden '>
        <img src="/images/course.jpg" alt="course_img" className='rounded-xl' />
      </div>
      <div className='p-5 space-y-5'>
        <h1 className='text-3xl font-bold text-primary'>{course.course_name}</h1>

        {/* <Avatar.Group
          size="large"
          max={{
            count: 3,
            style: { color: '#f56a00', backgroundColor: '#fde3cf' },
          }}
        >
          <Avatar className='| max-2xl:w-8 max-2xl:h-8' src="https://api.dicebear.com/7.x/miniavs/svg?seed=3" />
          <Avatar className='| max-2xl:w-8 max-2xl:h-8' src="https://api.dicebear.com/7.x/miniavs/svg?seed=10" />
          <Avatar className='| max-2xl:w-8 max-2xl:h-8' src="https://api.dicebear.com/7.x/miniavs/svg?seed=6" />
          <Avatar className='| max-2xl:w-8 max-2xl:h-8' src="https://api.dicebear.com/7.x/miniavs/svg?seed=8" />
        </Avatar.Group> */}

        <p className='font-bold text-lg'>Total number of sessions: <span className='text-secondary'>{course.total_session}</span></p>
      </div>
    </div>
  )
}

export default CourseDetail