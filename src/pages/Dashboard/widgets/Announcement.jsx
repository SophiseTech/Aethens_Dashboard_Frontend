import Target from '@/assets/Target'
import { ArrowRightOutlined } from '@ant-design/icons'
import React from 'react'

function Announcement() {
  return (
    <div className='p-5 rounded-3xl flex flex-col flex-1 gap-3 justify-between relative overflow-hidden bg-radialCardGradient text-white'>
      <div className='flex items-center gap-3'>
        <img src='/icons/megaphone.svg' />
        <h1 className='font-bold | text-sm 2xl:text-lg'>Announcement</h1>
      </div>

      <div>
        <h1 className='font-bold line-clamp-1 | text-sm 2xl:text-xl'>No Announcement</h1>
        {/* <p className='mt-2 | max-2xl:text-xs'>Some remark about the activity</p> */}
      </div>

      <div className='p-2 bg-white text-primary w-fit aspect-square rounded-full flex items-center self-end'>
        <ArrowRightOutlined />
      </div>

      <img src="/icons/target_lite.svg" alt="" className='absolute -left-10 -bottom-10' />
    </div>
  )
}

export default Announcement