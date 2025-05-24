import Title from '@components/layouts/Title'
import AllotMaterialsModal from '@pages/ManagerMaterials/Components/AllotMaterialsModal'
import MaterialsList from '@pages/ManagerMaterials/Components/MaterialsList'
import materialStore from '@stores/MaterialsStore'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

function ManagerMaterials() {
  const [searchParams, _] = useSearchParams()
  const student_id = searchParams.get("student_id")
  const course_id = searchParams.get("course_id")
  const [currentPage, setCurrentPage] = useState(1);

  const { getMaterials, materials, filters, total } = materialStore()

  useEffect(() => {
    getMaterials(10, { query: { student_id, course_id }, populate: "inventory_item_id student_id", sort: { createdAt: -1, _id: -1 } }, currentPage)
  }, [currentPage])

  return (
    <Title title={"Materials"} button={<AllotMaterialsModal student_id={student_id} course_id={course_id} />}>
      <MaterialsList currentPage={currentPage} setCurrentPage={setCurrentPage} total={total} pageSize={10} />
    </Title>
  )
}

export default ManagerMaterials