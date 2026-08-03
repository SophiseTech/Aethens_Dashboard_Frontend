import { formatDateTime } from '@utils/helper'
import { Empty, Pagination, Skeleton, Tag } from 'antd'
import PropTypes from 'prop-types'

const TYPE_COLORS = {
  addition: 'green',
  dispatch: 'orange',
  receipt: 'blue',
  material_delivery: 'volcano',
}

const TYPE_LABELS = {
  addition: 'Addition',
  dispatch: 'Dispatch',
  receipt: 'Receipt',
  material_delivery: 'Material Delivery',
}

function InventoryTransactionItem({ tx }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm">{tx.item_id?.name || '—'}</span>
          <Tag color={TYPE_COLORS[tx.type] || 'default'}>{TYPE_LABELS[tx.type] || tx.type}</Tag>
        </div>
        <div className="text-xs text-muted mt-1">{formatDateTime(tx.createdAt)}</div>
        <div className="mt-2 text-sm">
          <span className="text-stone-500">Center: </span>{tx.center_id?.center_name || '—'}
          {tx.related_center_id?.center_name && (
            <span className="text-stone-500"> → {tx.related_center_id.center_name}</span>
          )}
        </div>
        {tx.description && <div className="mt-2 text-xs text-muted text-stone-500">{tx.description}</div>}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-stone-500">
          {tx.balance_before ?? '—'} → {tx.balance_after ?? '—'}
        </div>
        <div className="text-lg font-bold">{tx.quantity}</div>
      </div>
    </div>
  )
}

InventoryTransactionItem.propTypes = {
  tx: PropTypes.object.isRequired,
}

function InventoryTransactionsList({ transactions = [], loading, page = 1, pageSize = 12, total = 0, onPageChange = () => { } }) {
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton active paragraph={{ rows: 1 }} />
        <Skeleton active paragraph={{ rows: 1 }} />
      </div>
    )
  }

  if (!transactions || transactions.length === 0) {
    return <Empty description="No inventory transactions" />
  }

  return (
    <div className="bg-gray-50 rounded-md p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted">Showing {Math.min(total, transactions.length)} of {total} transactions</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {transactions.map((tx) => (
          <div key={tx._id} className="min-h-[140px]">
            <InventoryTransactionItem tx={tx} />
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <Pagination current={page} pageSize={pageSize} total={total} onChange={(p, ps) => onPageChange(p, ps)} />
      </div>
    </div>
  )
}

InventoryTransactionsList.propTypes = {
  transactions: PropTypes.array,
  loading: PropTypes.bool,
  page: PropTypes.number,
  pageSize: PropTypes.number,
  total: PropTypes.number,
  onPageChange: PropTypes.func,
}

export default InventoryTransactionsList
