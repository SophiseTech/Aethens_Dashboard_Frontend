import { List, Avatar, Button, Skeleton } from 'antd'
import { useNavigate } from 'react-router-dom'

function WalletList({ wallets = [], loading, onSelect }) {
  useNavigate()

  // in future: navigation to student page

  return (
    <div className="w-full lg:w-1/3 p-3">
      <div className="bg-white rounded-md shadow p-4">
        <h3 className="text-lg font-semibold mb-3">Students</h3>
        {loading ? (
          <div className="space-y-3">
            <Skeleton active paragraph={{ rows: 1 }} />
            <Skeleton active paragraph={{ rows: 1 }} />
          </div>
        ) : (
          <List
            dataSource={wallets}
            locale={{ emptyText: 'No students found' }}
            renderItem={(w) => (
              <List.Item
                actions={[
                  <Button key="view" onClick={() => onSelect(w.student._id)} type="primary">View</Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar src={w.student?.profile_img} />}
                  title={<div className="flex items-center gap-2"><span>{w.student?.username}</span> <small className="text-muted">({w.student?.details_id?.admissionNumber})</small></div>}
                  description={<div className="text-sm">Balance: <strong>{w.balance ?? 0} {w.currency || 'INR'}</strong></div>}
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  )
}

import PropTypes from 'prop-types'

WalletList.propTypes = {
  wallets: PropTypes.array,
  loading: PropTypes.bool,
  onSelect: PropTypes.func,
}

export default WalletList
