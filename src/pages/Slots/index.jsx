import Title from '@components/layouts/Title'
import slotStore from '@stores/SlotStore'
import userStore from '@stores/UserStore';
import { groupByMonthName } from '@utils/helper'
import { Skeleton } from 'antd';
import { lazy, Suspense, useEffect, useMemo } from 'react'
const SlotList = lazy(() => import('@pages/Slots/Components/SlotList'));

function Slots() {

  const { loading, slots, getSlots } = slotStore()
  const { user } = userStore()

  useEffect(() => {
    getSlots(0, { sort: { start_date: -1 }, query: { booked_student_id: user._id, isActive: true }, populate: "center_id session" })
  }, [])

  const groupedSlots = useMemo(() => groupByMonthName(slots), [slots])

  return (
    <Title title={"Slots"}>
      <Suspense fallback={<Loader />}>
        <SlotList groupedSlots={groupedSlots} slots={slots} />
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