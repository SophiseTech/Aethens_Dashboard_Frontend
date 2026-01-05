import Title from '@components/layouts/Title'
import { useEffect, useState } from 'react'
import useWallet from '@hooks/useWallet'
import WalletBalanceCard from './WalletBalanceCard'
import WalletActionModal from './WalletActionModal'
import TransactionsList from './TransactionsList'
import { Skeleton } from 'antd'
import { useParams } from 'react-router-dom'

function Wallets() {
  const { loading, selectWallet, selectedWallet, transactions, transactionsLoading, topUp, deduct, totals, transactionsPage, transactionsLimit, transactionsTotal, fetchTransactions, changeTransactionsPage } = useWallet()
  const { studentId } = useParams()

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('topup')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (studentId) {
      selectWallet(studentId)
    }
  }, [studentId, selectWallet])



  const handleTopUp = () => {
    setModalMode('topup')
    setModalOpen(true)
  }
  const handleDeduct = () => {
    setModalMode('deduct')
    setModalOpen(true)
  }

  const handleSubmit = async (values) => {
    if (!selectedWallet) return
    setActionLoading(true)
    values.wallet = selectedWallet._id
    values.description = values.source
    try {
      if (modalMode === 'topup') {
        values.type = 'credit'
        await topUp(selectedWallet.owner._id, values)
      } else {
        values.type = 'debit'
        await deduct(selectedWallet.owner._id, values)
      }
    } finally {
      setActionLoading(false)
      setModalOpen(false)
    }
  }

  return (
    <Title title="Wallet">
      {!studentId ? (
        <div className="bg-white rounded-md shadow p-6">
          <div className="text-lg font-semibold mb-2">Student ID missing</div>
          <div className="text-sm text-muted">Provide a student id in the URL, for example: <code>?studentId=6817592a4e00310de79baf88</code></div>
        </div>
      ) : (
        <div>
          {loading && !selectedWallet ? (
            <div className="bg-white rounded-md shadow p-6">
              <Skeleton active paragraph={{ rows: 4 }} />
            </div>
          ) : !selectedWallet ? (
            <div className="bg-white rounded-md shadow p-6">
              <div className="text-lg font-semibold mb-2">Student wallet not found</div>
              <div className="text-sm text-muted">No wallet details available for this student.</div>
            </div>
          ) : (
            <div>
              <WalletBalanceCard wallet={selectedWallet} totals={totals} onTopUp={handleTopUp} onDeduct={handleDeduct} />

              <TransactionsList
                transactions={transactions}
                loading={transactionsLoading}
                page={transactionsPage}
                pageSize={transactionsLimit}
                total={transactionsTotal}
                onPageChange={(p, ps) => {
                  changeTransactionsPage(p, ps)
                  fetchTransactions(selectedWallet.student._id, p, ps)
                }}
              />
            </div>
          )}
        </div>
      )}

      <WalletActionModal open={modalOpen} onCancel={() => setModalOpen(false)} onSubmit={handleSubmit} mode={modalMode} loading={actionLoading} />
    </Title>
  )
}

export default Wallets