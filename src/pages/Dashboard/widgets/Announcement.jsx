import Target from '@/assets/Target'
import { ArrowRightOutlined } from '@ant-design/icons'
import React, { useEffect, useState } from 'react'
import { latestAnnouncement } from '@/services/Announcement'
import { Link } from 'react-router-dom'

function Announcement() {
  const [announcement, setAnnouncement] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLatest = async () => {
      setLoading(true)
      try {
        const data = await latestAnnouncement()
        setAnnouncement(data)
      } catch (e) {
        setAnnouncement(null)
      } finally {
        setLoading(false)
      }
    }
    fetchLatest()
  }, [])

  return (
    <div className='p-5 rounded-3xl flex flex-col flex-1 gap-3 justify-between relative overflow-hidden bg-radialCardGradient text-white'>
      <div className='flex items-center gap-3'>
        <img src='/icons/megaphone.svg' />
        <h1 className='font-bold | text-sm 2xl:text-lg'>Announcement</h1>
      </div>

      <div>
        {loading ? (
          <h1 className='font-bold line-clamp-1 | text-sm 2xl:text-xl'>Loading...</h1>
        ) : announcement && announcement.title ? (
          <>
            <h1 className='font-bold line-clamp-1 | text-sm 2xl:text-xl'>{announcement.title}</h1>
            {announcement.body && (
              <p className='mt-2 | max-2xl:text-xs line-clamp-2'>{announcement.body}</p>
            )}
          </>
        ) : (
          <h1 className='font-bold line-clamp-1 | text-sm 2xl:text-xl'>No Announcement</h1>
        )}
      </div>

      <Link to={'/student/announcements'} className='self-end'>
        <div className='p-2 bg-white text-primary w-fit aspect-square rounded-full flex items-center'>
          <ArrowRightOutlined />
        </div>
      </Link>

      <img src="/icons/target_lite.svg" alt="" className='absolute -left-10 -bottom-10' />
    </div>
  )
}

export default Announcement