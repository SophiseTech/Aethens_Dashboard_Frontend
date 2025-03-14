import Title from '@components/layouts/Title'
import RequestList from '@pages/Inventory/Components/RequestList'
import PayslipLayout from '@pages/Payslips/components/PayslipLayout'
import payslipRequestStore from '@stores/PayslipRequest'
import payslipStore from '@stores/PayslipStore'
import userStore from '@stores/UserStore'
import { months } from '@utils/constants'
import { Button, Drawer, Flex } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { useStore } from 'zustand'

function ManagerPayslips() {

  const { getPayslipRequests, payslipRequests, loading, lastRefKey, total, rejectPayslipRequest, approvePayslipRequest } = useStore(payslipRequestStore)
  const { getPayslips } = useStore(payslipStore)
  const { user } = useStore(userStore)
  const [drawerState, setDrawerState] = useState(false);

  const handleApprove = async (id) => {
    await approvePayslipRequest(id)
  }

  const handleReject = async (id) => {
    await rejectPayslipRequest(id)
  }

  const loadRequests = () => {
    if (payslipRequests.length === 0 || lastRefKey < total) {
      getPayslipRequests(10, {
        query: { center: user.center_id, status: "pending" },
        populate: "raised_by_center"
      }) // Adjust the limit as needed
    }
  }

  const fetchPayslips = (limit = 10,) => {
    getPayslips(limit, {
      query: {
        center_id: user.center_id
      },
      sort: { status: 1 },
      populate: "faculty_id manager_id"
    })
  }

  const formattedPayslipRequest = useMemo(() => payslipRequests.map(request => ({
    ...request,
    request_details: <div>
      <p>Payslip request for month {months[request.month]}</p>
      <p>{request.request_details}</p>
    </div>
  })), [payslipRequests])

  return (
    <Title title={"Payslips"}
      button={
        <Flex>
          <Button variant='filled' color='orange' onClick={() => { setDrawerState(true) }}>Requests</Button>
        </Flex>
      }
    >
      <PayslipLayout fetchPayslips={fetchPayslips} />
      <Drawer
        title="Requests"
        placement='right'
        closable
        onClose={() => { setDrawerState(false) }}
        open={drawerState}
        key={"right"}
      >
        <RequestList items={formattedPayslipRequest || []} loadData={loadRequests} approveAction={handleApprove} rejectAction={handleReject} fromField={"username"} loading={loading} />
      </Drawer>
    </Title>
  )
}

export default ManagerPayslips