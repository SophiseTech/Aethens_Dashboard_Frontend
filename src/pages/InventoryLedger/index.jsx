import Title from '@components/layouts/Title'
import InventoryTransactionsList from '@pages/InventoryLedger/Components/InventoryTransactionsList'
import centersStore from '@stores/CentersStore'
import inventoryTransactionsStore from '@stores/InventoryTransactionsStore'
import userStore from '@stores/UserStore'
import { ROLES } from '@utils/constants'
import { Select } from 'antd'
import { useEffect, useState } from 'react'
import { useStore } from 'zustand'

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'addition', label: 'Addition' },
  { value: 'dispatch', label: 'Dispatch' },
  { value: 'receipt', label: 'Receipt' },
  { value: 'material_delivery', label: 'Material Delivery' },
]

function InventoryLedger() {
  const { user } = useStore(userStore)
  const { selectedCenter } = useStore(centersStore)
  const { transactions, total, loading, getTransactions } = useStore(inventoryTransactionsStore)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [type, setType] = useState('')

  const isAdmin = user?.role === ROLES.ADMIN
  const isPurchaseManager = user?.role === ROLES.PURCHASE_MANAGER
  // Purchase managers default to their own (central store) ledger, but can
  // browse other centers' ledgers via the center selector, like admins do.
  const centerId = isAdmin
    ? selectedCenter
    : (isPurchaseManager && selectedCenter && selectedCenter !== 'all') ? selectedCenter : user?.center_id

  useEffect(() => {
    const query = {}
    if (centerId && centerId !== 'all') query.center_id = centerId
    if (type) query.type = type
    getTransactions(page, pageSize, { query })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, type, centerId])

  const handlePageChange = (p, ps) => {
    setPage(p)
    setPageSize(ps)
  }

  const handleTypeChange = (value) => {
    setType(value)
    setPage(1)
  }

  return (
    <Title title="Inventory Ledger">
      <div className="mb-4">
        <Select
          value={type}
          onChange={handleTypeChange}
          options={TYPE_OPTIONS}
          style={{ width: 220 }}
        />
      </div>
      <InventoryTransactionsList
        transactions={transactions}
        loading={loading}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={handlePageChange}
      />
    </Title>
  )
}

export default InventoryLedger
