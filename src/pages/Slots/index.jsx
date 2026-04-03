import Title from '@components/layouts/Title'
import slotStore from '@stores/SlotStore'
import userStore from '@stores/UserStore';
import { groupByMonthName } from '@utils/helper'
import { Button, Skeleton } from 'antd';
import holidayService from '@services/Holiday'
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
const SlotList = lazy(() => import('@pages/Slots/Components/SlotList'));
const AdditionalSessionRequestModal = lazy(() => import('@pages/Slots/Components/AdditionalSessionRequestModal'));

function Slots() {

  const { loading, slots, getSlots, getSlotStats, slotStats } = slotStore()
  const { user } = userStore()
  const [isAdditionalModalOpen, setIsAdditionalModalOpen] = useState(false)
  const [statsLoaded, setStatsLoaded] = useState(false)

  useEffect(() => {
    if (!user?._id) return
    getSlots(0, { sort: { start_date: -1 }, query: { booked_student_id: user._id, isActive: true }, populate: "center_id session" })

    const courseId = user?.details_id?.course_id?._id || user?.details_id?.course_id
    if (!courseId) return

    const loadStats = async () => {
      await getSlotStats(user._id, courseId)
      setStatsLoaded(true)
    }

    loadStats()
  }, [])

  const [holidays, setHolidays] = useState([])

  // Fetch holidays
  useEffect(() => {
    if (!user?.center_id) return
    holidayService.fetchHolidays({
      skip: 0,
      limit: 100,
      centerId: user.center_id,
      status: 'published'
    }).then(res => res?.holidays && setHolidays(res.holidays)).catch(() => { })
  }, [user?.center_id])

  const groupedSlots = useMemo(() => groupByMonthName(slots), [slots])
  const unattendedSessions = Number(slotStats?.totalCounts?.non_attended || 0)
  const canRequestAdditionalSession = user?.role === "student"
    && statsLoaded
    && user?.allow_additional_session_request !== false
    && unattendedSessions === 0

  const titleButton = canRequestAdditionalSession ? (
    <Button type="primary" onClick={() => setIsAdditionalModalOpen(true)}>
      Request Additional Session
    </Button>
  ) : null

  return (
    <Title title={"Slots"} button={titleButton}>
      <Suspense fallback={<Loader />}>
        <SlotList groupedSlots={groupedSlots} slots={slots} holidays={holidays} />
        <AdditionalSessionRequestModal
          isOpen={isAdditionalModalOpen}
          onCancel={() => setIsAdditionalModalOpen(false)}
          holidays={holidays}
        />
      </Suspense>
    </Title>
  )
}

const Loader = () => (
  <div className='w-full flex flex-col gap-3'>
    <Skeleton.Node
      active
      className='!w-full !h-40'
    />
    <Skeleton.Node
      active
      className='!w-full !h-40'
    />
    <Skeleton.Node
      active
      className='!w-full !h-40'
    />
    <Skeleton.Node
      active
      className='!w-full !h-40'
    />
  </div>
)

export default Slots
