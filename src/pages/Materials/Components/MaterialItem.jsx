import { LinkOutlined } from '@ant-design/icons'
import Chip from '@components/Chips/Chip'
import dayjs from 'dayjs'
import React from 'react'
import { isMobile } from 'react-device-detect'
import { useNavigate } from 'react-router-dom'

function MaterialItem({ itemName, itemPrice, itemQuantity, itemUnit = "NOS", itemCollectionDate = new Date(), itemStatus = "collected", itemBillId }) {

  const nav = useNavigate()

  const handleViewBills = (bill_id) => {
    nav(`/bills/${bill_id}`)
  }

  return (
    <div className='border border-[#D3D3D3] p-2 rounded-3xl w-full relative group cursor-pointer'>
      <div className='bg-[#F0F0F0] rounded-3xl p-5 aspect-square'>
        <img src="/images/test.png" alt="" />
      </div>
      <div className='pb-3 flex justify-between | max-sm:flex-col p-3 2xl:p-5 '>
        <div>
          <p className='font-bold | text-xs 2xl:text-lg'>{itemName}</p>
          <h1 className='font-bold text-primary | text-lg 2xl:text-2xl'>Rs {itemPrice}</h1>
        </div>
        <div className='text-end space-y-2 | max-lg:text-left'>
          <p className='text-gray-400 | max-2xl:text-xs'>x{itemQuantity} {itemUnit}</p>
          <Chip size={`${isMobile ? "xs" : "small"}`} type={itemStatus === "collected" ? "success" : "danger"} label={itemStatus.toUpperCase()} />
          {itemStatus === "collected" && <p className='| max-2xl:text-xs'>{dayjs(itemCollectionDate).format("D MMM, YYYY")}</p>}
        </div>
      </div>
      {itemBillId &&
        <div
          className='absolute right-5 top-5 bg-primary rounded-full px-3 py-1 flex text-white gap-2 items-center cursor-pointer group-hover:bg-primary/80 transition-colors'
          onClick={() => handleViewBills(itemBillId)}
        >
          <p className='| max-2xl:text-xs'>View Bill</p>
          <LinkOutlined />
        </div>
      }
    </div>
  )
}

export default MaterialItem