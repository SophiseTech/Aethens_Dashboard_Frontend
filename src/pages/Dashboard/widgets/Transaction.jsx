import billStore from '@stores/BillStore'
import userStore from '@stores/UserStore'
import React, { useEffect } from 'react'
import { useStore } from 'zustand'

function Transaction() {

  const { loading, getBills, bills } = billStore()
  const { user } = useStore(userStore)

  useEffect(() => {
    if (!bills || bills.length <= 0) {
      getBills(5, {
        query: { generated_for: user._id },
        populate: [
          { path: "generated_for", populate: { path: "details_id", model: "Student" } }, // Deep populate details_id
          { path: "generated_by" },
          { path: "items.item" }
        ]
      })
    }
  }, [])

  return (
    <div className='border border-border rounded-3xl flex-1 flex flex-col gap-3 overflow-auto | p-4 2xl:p-5'>
      <h1 className='font-bold | text-sm 2xl:text-xl'>Recent History</h1>
      <div className='flex-1 overflow-auto'>
        {bills.map((item, index) => (
          <TransacionItem key={index} item={item} />
        ))}
      </div>
    </div>
  )
}

const TransacionItem = ({ item }) => {
  return (
    <div className='flex items-center justify-start | p-2 2xl:p-3'>
      <div className='flex gap-3 flex-1 items-center'>
        <div className='bg-accent rounded-full w-[13%] aspect-square flex items-center justify-center | p-1 2xl:p-2'>
          <img src="/icons/rupee.svg" alt="alarm" className='w-3/4' />
        </div>
        <div className='flex flex-col justify-center'>
          <p className='text-gray-500 | max-2xl:text-[0.6rem] capitalize'>{item.subject || "Invoice"} (Bill No: {item.invoiceNo})</p>
          <h1 className='font-bold | text-xs 2xl:text-xl'>Rs {item.total}</h1>
        </div>
      </div>
      <div>
        <p className='font-bold text-green-500 capitalize | text-[0.6rem] 2xl:text-sm'>{item.status}</p>
      </div>
    </div>
  )
}

export default Transaction