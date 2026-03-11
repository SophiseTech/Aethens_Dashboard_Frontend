import { useState } from 'react'
import { Input, Button, Tag, Tooltip, Spin, Empty } from 'antd'
import { SearchOutlined, PlusOutlined, BankOutlined, ShopOutlined, FilterOutlined } from '@ant-design/icons'
import ledgerStore from '@stores/LedgerStore'
import userStore from '@stores/UserStore'
import permissions from '@utils/permissions'

const TYPE_ICON = {
    internal: BankOutlined,
    external: ShopOutlined,
}

function LedgerSidebar({ onAddClick }) {
    const { user } = userStore()
    const { ledgers, ledgersLoading, selectedLedger, selectLedger } = ledgerStore()
    const [search, setSearch] = useState('')

    const filtered = ledgers.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.vendor_name?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-100 w-80 lg:w-96">
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-800">Ledgers</h2>
                    {permissions.ledger?.add?.includes(user?.role) && (
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={onAddClick}
                            className="bg-primary hover:bg-primary/90"
                        >
                            Add
                        </Button>
                    )}
                </div>
                <div className="flex gap-2">
                    <Input
                        placeholder="Search accounts..."
                        prefix={<SearchOutlined className="text-gray-400" />}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="rounded-lg bg-gray-50 border-none"
                    />
                    <Tooltip title="Filters">
                        <Button icon={<FilterOutlined />} className="rounded-lg border-none bg-gray-50 text-gray-400" />
                    </Tooltip>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-2">
                {ledgersLoading && ledgers.length === 0 ? (
                    <div className="flex items-center justify-center p-10">
                        <Spin />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-10">
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No ledgers found" />
                    </div>
                ) : (
                    filtered.map((ledger) => {
                        const isActive = selectedLedger?._id === ledger._id
                        const IconComponent = TYPE_ICON[ledger.type] || ShopOutlined

                        return (
                            <button
                                key={ledger._id}
                                onClick={() => selectLedger(ledger)}
                                className={`w-full text-left px-4 py-3 transition-all duration-200 border-l-4 flex items-start gap-4
                                    ${isActive
                                        ? 'bg-primary/5 border-primary shadow-sm'
                                        : 'bg-transparent border-transparent hover:bg-gray-50'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${isActive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                                    <IconComponent className="text-base" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className={`text-sm font-semibold truncate ${isActive ? 'text-primary' : 'text-gray-800'}`}>
                                            {ledger.name}
                                        </p>
                                        <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-1.5 py-0.5 rounded uppercase">
                                            {ledger.type}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate mt-1">
                                        {ledger.vendor_name || 'No vendor linked'}
                                    </p>
                                    <div className="flex items-center justify-between mt-2">
                                        <Tag color={ledger.status === 'active' ? 'success' : 'default'} className="text-[10px] px-1.5 border-none bg-gray-100 rounded-full lowercase">
                                            {ledger.status || 'active'}
                                        </Tag>
                                    </div>
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
