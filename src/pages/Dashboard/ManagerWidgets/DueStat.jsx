import { ExclamationCircleOutlined } from '@ant-design/icons'
import DataDisplay from '@pages/Dashboard/Components/DataDisplay'
import billStore from '@stores/BillStore'
import { useStore } from 'zustand'

function DueStat() {

  const { summary } = useStore(billStore)

  return (
    <DataDisplay
      title={"Total Dues"}
      count={summary?.totalResult?.totalUnpaid}
      icon={<ExclamationCircleOutlined className='text-xl text-white' />}
      prefix={"₹"}
      // styles={{ color: "#cf1322" }}
    />
  )
}
export default DueStat