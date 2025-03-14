import Target from '@/assets/Target'
import { ArrowRightOutlined } from '@ant-design/icons'
import activitiesStore from '@stores/ActivitiesStore'
import userStore from '@stores/UserStore'
import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from 'zustand'

function Updates() {

  const { loading, getActivities, activities } = useStore(activitiesStore)
  const { user } = useStore(userStore)

  useEffect(() => {
    if (!activities || activities.length === 0) {
      getActivities(1, {
        query: { student_id: user._id, resource: { $exists: false } },
        populate: {
          path: "faculty_id",
          options: {
            select: "username _id email profile_img"
          }
        },
        sort: "-createdAt"
      })
    }
  }, [])

  console.log(activities);


  return (
    <div className='border border-border rounded-3xl flex flex-col justify-between gap-3 relative overflow-hidden flex-1 | p-4 2xl:p-5'>
      <div className='flex items-center gap-3'>
        <Target />
        <h1 className='font-bold | text-sm 2xl:text-lg'>Latest Updates</h1>
      </div>

      {activities?.length > 0 ?
        <div>
          <h1 className='text-[#526821] font-bold line-clamp-1 | text-sm 2xl:text-xl'>{activities[0].title}</h1>
          <p className='text-gray-500 mt-2 | max-2xl:text-xs'>{activities[0].remarks}</p>
        </div>
        :
        <div>
          <h1 className='text-[#526821] font-bold line-clamp-1 | text-sm 2xl:text-xl'>No Updates</h1>
        </div>
      }

      <Link to={"/activities"} className='p-2 bg-primary text-white w-fit aspect-square rounded-full flex items-center self-end hover:text-white'>
        <ArrowRightOutlined />
      </Link>

      <img src="/icons/target_lite.svg" alt="" className='absolute -left-10 -bottom-10' />
    </div>
  )
}

export default Updates