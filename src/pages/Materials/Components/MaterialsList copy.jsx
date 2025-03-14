import MaterialItem from '@pages/Materials/Components/MaterialItem'
import { Skeleton } from 'antd'
import React from 'react'

function MaterialsList({ materials, loading }) {
  if(!materials || materials.length === 0) return <p>No Materials!</p>
  return (
    <div className='grid grid-cols-2 gap-3 | lg:grid-cols-3 xl:grid-cols-4 md:grid-cols-2'>
      <Loader loading={loading}>
        {materials.map((item, index) => (
          <MaterialItem
            key={index}
            itemName={item.inventory_item_id?.name}
            itemPrice={item.total}
            itemQuantity={item.qty}
            itemCollectionDate={item.collected_on}
            itemBillId={item.bill_id}
            itemStatus={item.status}
            itemUnit={item.inventory_item_id?.unit}
          />
        ))}
      </Loader>
    </div>
  )
}

const Loader = ({ loading, children }) => {
  if (loading) return (
    Array.from({ length: 4 }).map((_, index) => (
      <Skeleton key={index} />
    ))
  )
  return children
}

export default MaterialsList