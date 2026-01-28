import { Card, Avatar, Button } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'

function WalletBalanceCard({ wallet, totals = {}, onTopUp, onDeduct }) {
  if (!wallet) return null
  const { user } = useUser()

  const credited = totals.totalCredited ?? wallet.totalCredited ?? 0
  const debited = totals.totalDebited ?? wallet.totalDebited ?? 0

  return (
    <Card className="mb-4">
      <div className="flex items-center gap-4">
        <Avatar size={64} src={wallet.owner?.profile_img} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-semibold">{wallet.owner?.username}</div>
              {user.role === 'manager' && <div className="text-sm text-muted">{wallet.owner?.email}</div>}
            </div>

            <div className='flex gap-5'>
              <div className="flex gap-3">
                <div className="bg-gray-50 border rounded-md p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-50 text-green-600">
                    <ArrowUpOutlined />
                  </div>
                  <div>
                    <div className="text-xs text-muted">Total Credited</div>
                    <div className="font-semibold text-xl">{Number(credited).toFixed(2)} {wallet.currency || 'INR'}</div>
                  </div>
                </div>

                <div className="bg-gray-50 border rounded-md p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-50 text-red-600">
                    <ArrowDownOutlined />
                  </div>
                  <div>
                    <div className="text-xs text-muted">Total Debited</div>
                    <div className="font-semibold text-xl">{Number(debited).toFixed(2)} {wallet.currency || 'INR'}</div>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-muted">Current Balance</div>
                <div className="text-3xl font-extrabold">{wallet.balance ?? 0} {wallet.currency || 'INR'}</div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex gap-3">
              <Button type="primary" onClick={onTopUp}>Top-up</Button>
              <Button danger onClick={onDeduct}>Deduct</Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

import PropTypes from 'prop-types'
import useUser from '@hooks/useUser'

WalletBalanceCard.propTypes = {
  wallet: PropTypes.object,
  totals: PropTypes.object,
  onTopUp: PropTypes.func,
  onDeduct: PropTypes.func,
}

export default WalletBalanceCard
