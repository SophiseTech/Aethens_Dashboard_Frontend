import Chip from '@components/Chips/Chip'
import BillsList from '@pages/Bills/Components/BillsList'
import payslipStore from '@stores/PayslipStore'
import userStore from '@stores/UserStore'
import { Empty } from 'antd'
import dayjs from 'dayjs'
import React, { useEffect, useMemo } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import { useStore } from 'zustand'
import centersStore from '@stores/CentersStore';

function PayslipLayout({ fetchPayslips }) {

  const { id } = useParams()
  const { payslips, loading, total } = useStore(payslipStore)
  const { user } = useStore(userStore);
  const { selectedCenter } = useStore(centersStore);

  useEffect(() => {
    if (!payslips || payslips.length <= 0) {
      fetchPayslips(10)
    }
  }, [selectedCenter])



  const fields = {
    title: ["faculty_id", "username"],
    description: ["description"],
    extra: ["total"],
    status: ["chipStatus"]
  }

  const Status = ({ status }) => {
    if (status === "paid") {
      return <Chip size='small' type='success' label='Paid' />
    } else if (status === "draft") {
      return <Chip size='small' type='draft' label='Draft' />
    } else {
      return <Chip size='small' type='danger' label='Unpaid' />
    }
  }

  const formattedPayslips = useMemo(() => payslips?.map(payslip => ({
    ...payslip,
    description: `${payslip.month != null ? dayjs().month(payslip.month).format("MMMM") : ""} | ${dayjs(payslip.generated_on).format("D MMM, YYYY")}`,
    total: `₹ ${payslip.total_amount}`,
    chipStatus: <Status status={payslip.payment_status} />
  })), [payslips])

  return (
    <div className='flex gap-5 h-full overflow-auto | flex-col lg:overflow-auto lg:flex-row'>
      <div className='| w-full lg:w-1/4'>
        <BillsList
          bills={formattedPayslips}
          loading={loading}
          total={total}
          onLoadMore={fetchPayslips}
          fields={fields}
        />
      </div>
      {!id ?
        <div className='bg-card rounded-2xl flex-1 flex items-center justify-center'>
          <Empty />
        </div>
        :
        <Outlet />
      }
    </div>
  )
}

export default PayslipLayout