import { RiseOutlined, UserOutlined } from '@ant-design/icons'
import DataDisplay from '@pages/Dashboard/Components/DataDisplay'
import billStore from '@stores/BillStore'
import userStore from '@stores/UserStore'
import { useStore } from 'zustand'

function IncomeStat() {

  const { summary } = useStore(billStore)

  return (
    <DataDisplay
      title={"Total Income"}
      count={summary?.totalResult?.totalIncome}
      icon={<RiseOutlined className='text-xl text-white' />}
      prefix={"₹"}
      // styles={{ color: "#389e0d" }}
    />
  )
}
export default IncomeStat