import Title from '@components/layouts/Title'
import PayslipLayout from '@pages/Payslips/components/PayslipLayout'
import PayslipRequestModal from '@pages/Payslips/components/PayslipRequestModal'
import payslipStore from '@stores/PayslipStore'
import userStore from '@stores/UserStore'
import { Button, Flex } from 'antd'
import { useStore } from 'zustand'

function FacultyPayslips() {

  const { getPayslips } = useStore(payslipStore)
  const { user } = useStore(userStore)

  const fetchPayslips = (limit = 10,) => {
    getPayslips(limit, {
      query: {
        faculty_id: user._id,
        payment_status: { $in: ["unpaid", "paid"] }
      },
      sort: { status: 1 },
      populate: "faculty_id manager_id"
    })
  }

  return (
    <Title title={"Payslips"}
      button={
        <Flex>
          <PayslipRequestModal />
        </Flex>
      }
    >
      <PayslipLayout fetchPayslips={fetchPayslips} />
    </Title>
  )
}

export default FacultyPayslips