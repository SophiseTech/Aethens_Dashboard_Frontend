import ledgerStore from '@stores/LedgerStore'
import permissions from '@utils/permissions'
import userStore from '@stores/UserStore'
import { Button, Spin, Tag, Tooltip } from 'antd'
import { PlusOutlined, ShopOutlined, UserOutlined, BankOutlined } from '@ant-design/icons'
import { useStore } from 'zustand'

const TYPE_ICON = {
    internal: BankOutlined,
    external: ShopOutlined,
}

const TYPE_COLOR = {
    internal: 'blue',
    external: 'orange',
}

function LedgerSidebar({ onAddClick }) {
    const { user } = useStore(userStore)
    const { ledgers, ledgersLoading, selectedLedger, selectLedger } = useStore(ledgerStore)

    if (ledgersLoading && ledgers.length === 0) {
        return (
            <div className="flex items-center justify-center h-40">
                <Spin size="small" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Ledger Accounts</p>
                {permissions.ledger?.add?.includes(user?.role) && (
                    <Tooltip title="New Ledger">
                        <Button
                            type="text"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={onAddClick}
                            className="text-primary"
                        />
                    </Tooltip>
                )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto py-2 space-y-1 no-scrollbar">
                {ledgers.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-400 text-sm">
                        No ledger accounts yet.
                    </div>
                ) : (
                    ledgers.map((ledger) => {
                        const isActive = selectedLedger?._id === ledger._id
                        const IconComponent = TYPE_ICON[ledger.type] || ShopOutlined

                        return (
                            <button
                                key={ledger._id}
                                onClick={() => selectLedger(ledger)}
                                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 flex items-start gap-3 group
                  ${isActive
                                        ? 'bg-primary/10 border-l-4 border-primary'
                                        : 'hover:bg-gray-50 border-l-4 border-transparent'
                                    }`}
                            >
                                <IconComponent
                                    className={`mt-0.5 text-base flex-shrink-0 ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'}`}
                                />
                                <div className="min-w-0 flex-1">
                                    <p className={`text-sm font-medium truncate ${isActive ? 'text-primary' : 'text-gray-700'}`}>
                                        {ledger.name}
                                    </p>
                                    {ledger.vendor_name && (
                                        <p className="text-xs text-gray-400 truncate mt-0.5">{ledger.vendor_name}</p>
                                    )}
                                    <Tag
                                        color={TYPE_COLOR[ledger.type]}
                                        className="mt-1 text-xs !rounded-full !px-2 !py-0"
                                    >
                                        {ledger.type}
                                    </Tag>
                                </div>
                            </button>
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default LedgerSidebar
