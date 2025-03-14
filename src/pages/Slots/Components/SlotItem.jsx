import { ClockCircleFilled, CloseOutlined, EllipsisOutlined, EnvironmentFilled } from '@ant-design/icons'
import SubMenu from '@components/SubMenu'
import slotStore from '@stores/SlotStore'
import { formatTime } from '@utils/helper'
import { Avatar, Popover } from 'antd'
import { cva } from 'class-variance-authority'
import dayjs from 'dayjs'
import React from 'react'
import { useStore } from 'zustand'

function SlotItem({ _id, session, center_id: { location }, type, slotType, start_date: sessionDate, showModal }) {
  const day = dayjs(sessionDate).format("ddd")
  const date = dayjs(sessionDate).format("DD")
  const { setReschedulingSlot } = useStore(slotStore)

  console.log(sessionDate);

  const containerStyle = cva(
    "border rounded-xl flex items-center relative overflow-hidden | gap-5 md:gap-10 p-5 2xl:p-10",
    {
      variants: {
        type: {
          upcoming: "border-primary",
          requested: "text-gray-500",
          normal: "border-border"
        }
      },
      defaultVariants: {
        type: "normal"
      }
    }
  )

  const tagStyles = cva(
    "rounded-full absolute text-xs z-10 | top-2 right-2 px-2 py-1 max-2xl:text-[0.6rem] 2xl:right-5 2xl:top-5 2xl:px-3 2xl:py-1.5",
    {
      variants: {
        type: {
          upcoming: "bg-primary text-white",
          requested: "bg-[#FFBBA7] text-[#C22F02]",
          normal: "hidden"
        }
      },
      defaultVariants: {
        type: "normal"
      }
    }
  )

  const isRequest = () => type === "requested"

  const options = [
    {
      label: 'Request reschedule',
      icon: <ClockCircleFilled />,
      key: '1',
      onClick: () => {
        setReschedulingSlot({
          start_date: sessionDate,
          session: session,
          _id
        })
        showModal()
      }
    },
    // {
    //   label: 'Mark Absent',
    //   icon: <CloseOutlined />,
    //   danger: true,
    //   key: '2',
    // },
  ];

  return (
    <div className={containerStyle({ type })}>

      <div className={tagStyles({ type })}>{type === "requested" ? "Requested" : "Upcoming"}</div>

      <div className='text-center'>
        <p className={`${isRequest() ? "text-gray-400" : "text-primary"} | text-lg 2xl:text-3xl`}>{day}</p>
        <p className={`font-bold ${isRequest() ? "text-gray-400" : "text-primary"} | text-3xl 2xl:text-5xl`}>{date}</p>
      </div>

      <div className='w-0.5 h-16 self-center bg-gray-200'></div>

      <div className='flex gap-10 items-center flex-1 flex-wrap | max-md:gap-5'>
        <div className={`flex flex-col gap-2 ${isRequest() ? "text-gray-400" : "text-gray-600"} | text-xs 2xl:text-[1rem] | p-0 lg:px-5`}>
          <div className='flex gap-2 items-center'>
            <ClockCircleFilled className='' />
            <p className='font-bold'>{formatTime(sessionDate)}</p>
          </div>
          <div className='flex gap-2 items-center'>
            <EnvironmentFilled className='' />
            <p className='font-bold'>{location}</p>
          </div>
        </div>

        <div className='flex flex-col gap-2 flex-1'>
          <h1 className={`font-bold tracking-wider ${isRequest() ? "text-gray-400" : "text-gray-600"} capitalize | text-xm 2xl:text-xl`}>{slotType} Session</h1>
          {/* <Avatar.Group
            size="default"
            max={{
              count: 3,
              style: { color: '#f56a00', backgroundColor: '#fde3cf' },
            }}
          >
            <Avatar className='| max-2xl:w-8 max-2xl:h-8' src="/images/user1.jpg" />
            <Avatar className='| max-2xl:w-8 max-2xl:h-8' src="/images/user2.jpg" />
            <Avatar className='| max-2xl:w-8 max-2xl:h-8' src="/images/user3.jpg" />
            <Avatar className='| max-2xl:w-8 max-2xl:h-8' src="/images/user4.jpg" />
          </Avatar.Group> */}
        </div>
      </div>

      <div>
        <SubMenu items={options} />
      </div>

      {isRequest() && <RequestMask />}
    </div>
  )
}

const RequestMask = () => (
  <div className='absolute -inset-5 bg-request_mask bg-no-repeat bg-cover opacity-50'>

  </div>
)

export default SlotItem