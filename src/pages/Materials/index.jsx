import Title from '@components/layouts/Title'
import materialStore from '@stores/MaterialsStore'
import userStore from '@stores/UserStore';
import { Skeleton } from 'antd';
import { lazy, Suspense, useEffect, useState } from 'react'
import { useStore } from 'zustand';
const MaterialsList = lazy(() => import('@pages/Materials/Components/MaterialsList'));

function Materials() {

  const { loading, materials, getMaterials, total } = materialStore()
  const { user } = useStore(userStore)
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getMaterials(10, {
      query: { student_id: user._id },
      populate: "inventory_item_id",
      sort: "-createdAt"
    },
      currentPage
    )
  }, [currentPage])

  return (
    <Title title={"Materials"}>
      <Suspense fallback={<Loader />}>
        <MaterialsList materials={materials} loading={loading} currentPage={currentPage} setCurrentPage={setCurrentPage} total={total} pageSize={10} />
      </Suspense>
    </Title>
  )
}

const Loader = () => (
  <div className='flex gap-3'>
    {Array.from({ length: 4 }).map((_, index) => (
      <Skeleton.Node key={index} className='!w-full !h-60' active />
    ))}
  </div>
)



export default Materials