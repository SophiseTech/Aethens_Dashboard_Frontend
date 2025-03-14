import { FallOutlined } from '@ant-design/icons'
import DataDisplay from '@pages/Dashboard/Components/DataDisplay'
import payslipStore from '@stores/PayslipStore'
import { useStore } from 'zustand'

function ExpenseStat() {

  const { summary } = useStore(payslipStore)

  return (
    <DataDisplay
      title={"Total Expense"}
      count={summary?.totalExpense}
      icon={<FallOutlined className='text-xl text-white' />}
      prefix={"₹"}
    // styles={{ color: "#389e0d" }}
    />
  )
}
export default ExpenseStat