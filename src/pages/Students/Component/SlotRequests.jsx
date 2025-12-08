import RequestList from '@pages/Inventory/Components/RequestList'
import slotStore from '@stores/SlotStore'
import userStore from '@stores/UserStore'
import { formatDate, formatTime } from '@utils/helper'
import { Drawer } from 'antd'
import React, { useEffect, useMemo } from 'react'
import { useStore } from 'zustand'

function SlotRequests({ handleClose, drawerState }) {

  const { getSlotRequests, slotRequests, rejectSlotRequest, approveSlotRequest, requestLoading } = useStore(slotStore)
  const { user } = useStore(userStore)

  useEffect(() => {
    if (!slotRequests || slotRequests.length === 0) {
      loadRequests(10)
    }
  }, [])

  const loadRequests = (limit = 10) => {
    getSlotRequests(limit, {
      query: { center: user.center_id, status: "pending" },
      sort: { createdAt: -1 },
      populate: [
        { path: "raised_by_center", options: { select: "username" } },
        {
          path: "current_slot",
          options: { select: "start_date session" },
          populate: { path: "session", options: { select: "start_time" } }
        },
        {
          path: "requested_slot",
        }
      ]
    })
  }

  const formattedRequests = useMemo(() => slotRequests?.map(request => ({
    ...request,
    request_details: <p>
      {request.raised_by_center?.username} has requested to reschedule their slot
      from <span className='font-bold'>{formatDate(request?.current_slot?.start_date)}, {formatTime(request?.current_slot?.session?.start_time)}</span>&nbsp;
      to <span className='font-bold'>{formatDate(request?.requested_slot?.date)}, {formatTime(request?.requested_slot?.date)}</span>
    </p>
  })), [slotRequests])

  return (
    <Drawer
      title="Slot Reschedule Requests"
      placement='right'
      closable
      onClose={handleClose}
      open={drawerState}
      key={"right"}
    >
      <RequestList
        items={formattedRequests}
        loadData={loadRequests}
        approveAction={approveSlotRequest}
        rejectAction={rejectSlotRequest}
        fromField={"username"}
        loading={requestLoading}
      // render={(item) => <Table columns={columns} dataSource={item?.items || []} pagination={false} className='mt-5' />}
      />
    </Drawer>
  )
}

export default SlotRequests