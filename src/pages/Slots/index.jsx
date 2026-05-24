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
      const stats = await getSlotStats(user._id, courseId)
      if (stats) setStatsLoaded(true)
    }

    loadStats()
  }, [user?._id])

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
    && user.status === 'active'

  const titleButton = canRequestAdditionalSession ? (
    <Button type="primary" onClick={() => setIsAdditionalModalOpen(true)}>
      Request Additional Session
    </Button>
  ) : null

  const rescheduleLimit = user?.details_id?.rescheduleLimit ?? 4;
  const additionalLimit = user?.details_id?.additionalLimit ?? 2;
  const remainingReschedules = user?.remainingReschedules ?? user?.details_id?.remainingReschedules ?? rescheduleLimit;
  const remainingAdditional = user?.remainingAdditionalRequests ?? user?.details_id?.remainingAdditionalRequests ?? additionalLimit;

  return (
    <Title title={"Slots"} button={titleButton}>
      <Suspense fallback={<Loader />}>
        {user?.role === 'student' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">Reschedules Remaining (Monthly)</p>
                <h3 className="text-2xl font-bold text-stone-800 mt-1">{remainingReschedules} <span className="text-sm font-normal text-stone-400">/ {rescheduleLimit}</span></h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 font-semibold text-lg">
                🔄
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">Additional Sessions Remaining (Weekly)</p>
                <h3 className="text-2xl font-bold text-stone-800 mt-1">{remainingAdditional} <span className="text-sm font-normal text-stone-400">/ {additionalLimit}</span></h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-500 font-semibold text-lg">
                ➕
              </div>
            </div>
          </div>
        )}
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
