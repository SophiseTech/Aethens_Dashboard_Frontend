import { ClockCircleFilled, CloseOutlined, EnvironmentFilled } from '@ant-design/icons'
import SubMenu from '@components/SubMenu'
import slotStore from '@stores/SlotStore'
import { formatTime } from '@utils/helper'
import { Avatar, Modal, Popover, Tag } from 'antd'
import { cva } from 'class-variance-authority'
import dayjs from 'dayjs'
import React from 'react'
import { useStore } from 'zustand'

function SlotItem({ _id, session, center_id: { location }, type, slotType, start_date: sessionDate, showModal, holidayInfo }) {
  const day = dayjs(sessionDate).format("ddd")
  const date = dayjs(sessionDate).format("DD")
  const { setReschedulingSlot, markAbsent, createLoading } = useStore(slotStore)

  const containerStyle = cva(
    "border rounded-xl flex items-center relative overflow-hidden | gap-5 md:gap-10 p-5 2xl:p-10",
    {
      variants: {
        type: {
          upcoming: "border-primary",
          requested: "text-gray-500",
          normal: "border-border",
          completed: "border-gray-200 text-gray-400",
          absent: "border-red-500",
          cancelled: "border-red-500",
        }
      },
      defaultVariants: {
        type: "normal"
      }
    }
  )

  const tagStyles = cva(
    "rounded-full text-xs z-10 | px-2 py-1 max-2xl:text-[0.6rem] 2xl:px-3 2xl:py-1.5",
    {
      variants: {
        type: {
          upcoming: "bg-primary text-white",
          requested: "bg-[#FFBBA7] text-[#C22F02]",
          normal: "hidden",
          completed: "hidden",
          absent: "bg-red-500 text-white",
          cancelled: "bg-red-500 text-white",
        }
      },
      defaultVariants: {
        type: "normal"
      }
    }
  )

  const isRequest = () => type === "requested" || type === "completed"

  const getOptions = (type) => {
    return [
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
        },
        disabled: type === "completed" || type === "cancelled"
      },
      {
        label: 'Mark Absent',
        icon: <CloseOutlined />,
        danger: true,
        key: '2',
        onClick: () => {
          Modal.confirm({
            title: 'Confirm Mark Absent',
            content: 'Are you sure you want to mark this student as absent?',
            okText: 'Yes',
            cancelText: 'No',
            onOk: () => {
              markAbsent(_id, "cancelled");
            }
          });
        },
        disabled: type === "completed" || type === "cancelled" || type === "absent"
      },
    ];
  }

  return (
    <div className={containerStyle({ type })}>

      <div className="flex gap-2 absolute top-2 right-2 z-10 2xl:right-5 2xl:top-5">
        <div className={tagStyles({ type })}>{type === "requested" ? "Requested" : type === "cancelled" ? "Cancelled" : type === "absent" ? "Absent" : "Upcoming"}</div>

        {/* Holiday Tag */}
        {holidayInfo && (
          <Tag color="red" className="">
            🎉 {holidayInfo.title}
          </Tag>
        )}
      </div>

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
        </div>
      </div>

      <div>
        <SubMenu items={getOptions(type)} />
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