import { CheckOutlined, DownloadOutlined, RestOutlined, SendOutlined } from '@ant-design/icons'
import Payslip from '@pages/Payslips/components/Payslip'
import payslipStore from '@stores/PayslipStore'
import userStore from '@stores/UserStore'
import { downloadPdf } from '@utils/helper'
import permissions from '@utils/permissions'
import { Button, Popconfirm } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from 'zustand'

function PayslipDetails() {

  const { payslips, editPayslip, deletePayslip } = useStore(payslipStore)
  const [payslip, setPayslip] = useState({})
  const { user } = useStore(userStore)
  const payslipRef = useRef(null)

  const nav = useNavigate()
  const { id } = useParams()

  useEffect(() => {
    if (payslips && payslips.length > 0) {
      setPayslip(payslips.find(payslip => payslip._id === id) || {})
    }
  }, [payslips, id])

  const handleRecordPayment = () => {
    if (id && payslip) {
      editPayslip(id, { payment_status: "paid" })
    }
  }

  const handleApprovePayslip = () => {
    if (id && payslip) {
      editPayslip(id, { payment_status: "unpaid" })
    }
  }

  const handleDeleteBill = async () => {
    if (id) {
      await deletePayslip(id)
      nav('/manager/bills')
    }
  }



  return (
    <div className='rounded-xl flex-1 h-full overflow-auto bg-card flex flex-col'>
      <div className='border-b border-border flex justify-between | p-5 2xl:p-10'>
        <h1 className='font-bold | max-2xl:text-xl 2xl:text-2xl'>Preview</h1>
        <div className='flex gap-2'>

          {permissions.payslips?.approve?.includes(user.role) &&
            <Popconfirm
              title="Approve"
              description="Are you sure to approve this payslip?"
              onConfirm={handleApprovePayslip}
            >
              <Button
                className='rounded-full '
                color='blue'
                icon={<CheckOutlined />}
                variant='outlined'
                disabled={payslip?.payment_status !== "draft"}
              >
                {payslip?.payment_status === "unpaid" ? "Approved" : "Approve"}
              </Button>
            </Popconfirm>
          }

          {permissions.payslips?.mark_paid?.includes(user.role) &&
            <Popconfirm
              title="Record Payment"
              description="Are you sure to record this payslip?"
              onConfirm={handleRecordPayment}
            >
              <Button
                className='rounded-full '
                color='green'
                icon={<p>₹</p>}
                variant='outlined'
                disabled={payslip?.payment_status !== "unpaid"}
              >
                {payslip?.payment_status === "paid" ? "Paid" : "Mark Paid"}
              </Button>
            </Popconfirm>
          }

          <Button
            className='rounded-full'
            color='orange'
            icon={<DownloadOutlined />}
            variant='outlined'
            onClick={() => {
              downloadPdf(payslipRef, `payslip_${payslip?.createdAt}`)
            }}
            disabled={payslip?.payment_status !== "paid"}
          >
            Download
          </Button>

          {permissions.payslips?.delete?.includes(user.role) &&
            <Popconfirm
              title="Delete Bill"
              description="Are you sure to delete this payslip?"
              onConfirm={handleDeleteBill}
            >
              <Button
                className='rounded-full '
                color='red'
                icon={<RestOutlined />}
                variant='outlined'

              >
                Delete
              </Button>
            </Popconfirm>
          }

        </div>
      </div>
      <div className='flex-1 overflow-auto | p-5 lg:p-10'>
        <Payslip payslip={payslip} downloadRef={payslipRef} />
      </div>
    </div>
  )
}

export default PayslipDetails