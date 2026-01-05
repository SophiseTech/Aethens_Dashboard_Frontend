import { Empty, Skeleton, Tag } from 'antd'
import { formatDate } from '@utils/helper'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'

function TransactionItem({ tx }) {
  const isCredit = tx.type === 'credit'
  const sign = isCredit ? '+' : '-'

  const nav = useNavigate()

  const openBill = (bill) => {
    if (!bill || !bill._id) return
    nav(`/manager/bills?bill_id=${bill._id}`)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow h-full flex justify-between">
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gray-50 border ${isCredit ? 'border-green-200' : 'border-red-200'}`}>
          <div className={`text-lg font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>{isCredit ? '＋' : '−'}</div>
        </div>

        <div className="flex-1">
          <div className="font-semibold text-sm">{tx.source || (isCredit ? 'Top-up' : 'Deduction')}</div>
          <div className="text-xs text-muted mt-1">{tx.formattedDate} {tx.formattedTime}</div>

          {tx.description && <div className="mt-2 text-xs text-muted text-stone-500">{tx.description}</div>}

          {tx.bill && (
            <div className="mt-3">
              <a onClick={() => openBill(tx.bill)} className="text-sm text-blue-600 hover:underline">View Bill • <span className="font-medium">{tx.bill.billNumber}</span></a>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-right">
        <div className={`text-xl font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>{sign} {Number(tx.amount).toFixed(2)}</div>
        <div className="mt-2 text-sm text-muted">{tx.type === 'credit' ? <Tag color="green">Credit</Tag> : <Tag color="volcano">Debit</Tag>}</div>
      </div>
    </div>
  )
}

TransactionItem.propTypes = {
  tx: PropTypes.object.isRequired,
}

import { Pagination } from 'antd'

function TransactionsList({ transactions = [], loading, page = 1, pageSize = 6, total = 0, onPageChange = () => {} }) {
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton active paragraph={{ rows: 1 }} />
        <Skeleton active paragraph={{ rows: 1 }} />
      </div>
    )
  }

  if (!transactions || transactions.length === 0) {
    return <Empty description="No transactions" />
  }

  return (
    <div className="bg-gray-50 rounded-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold">Recent Transactions</h4>
        <div className="text-sm text-muted">Showing {Math.min(total, transactions.length)} of {total} transactions</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {transactions.map((tx) => (
          <div key={tx._id} className="min-h-[120px]">
            <TransactionItem tx={tx} />
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <Pagination current={page} pageSize={pageSize} total={total} onChange={(p, ps) => onPageChange(p, ps)} />
      </div>
    </div>
  )
}

TransactionsList.propTypes = {
  transactions: PropTypes.array,
  loading: PropTypes.bool,
  page: PropTypes.number,
  pageSize: PropTypes.number,
  total: PropTypes.number,
  onPageChange: PropTypes.func,
}

export default TransactionsList
