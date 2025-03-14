import { Avatar } from 'antd'
import React from 'react'

function ActivityAvatar({avatar}) {
  return (
    <div className='relative flex items-center justify-center'>
      <div className='pb-2 bg-white self-start relative z-10'>
        <Avatar src={avatar} className='| w-10 h-10 2xl:w-14 2xl:h-14' />
      </div>
      <div className='w-0.5 -bottom-3 absolute bg-gray-200 top-0'></div>
    </div>
  )
}

export default ActivityAvatar