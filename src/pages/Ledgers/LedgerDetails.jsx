import { Table, Button, Tag, Space, Tooltip, Statistic, Card, Tabs, Empty, Popconfirm } from 'antd'
import {
    EditOutlined,
    DeleteOutlined,
    HistoryOutlined,
    InfoCircleOutlined,
    WalletOutlined,
    FileTextOutlined
} from '@ant-design/icons'
import ledgerStore from '@stores/LedgerStore'
import userStore from '@stores/UserStore'
import permissions from '@utils/permissions'
import dayjs from 'dayjs'

const CATEGORY_LABELS = {
    rent: 'Rent', salary: 'Salary', food: 'Food',
    maintenance: 'Maintenance', utilities: 'Utilities',
    travel: 'Travel', marketing: 'Marketing', other: 'Other',
}

const CATEGORY_COLORS = {
    rent: 'volcano', salary: 'orange', food: 'gold',
    maintenance: 'blue', utilities: 'purple', travel: 'cyan',
    marketing: 'magenta', other: 'default',
}

function LedgerDetails({ onEditClick }) {
    const { user } = userStore()
    const {
        selectedLedger,
        expenses,
        expenseLoading,
        expenseSummary,
        deleteExpense,
    } = ledgerStore()

    const canEdit = permissions.ledger?.edit?.includes(user?.role)
    const canDeleteExpense = permissions.ledger?.delete?.includes(user?.role)

    if (!selectedLedger) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 p-20">
                <Empty
                    image={<WalletOutlined style={{ fontSize: 60, color: '#e5e7eb' }} />}
                    description={
                        <div className="text-center">
                            <p className="text-gray-500 font-medium">Select a ledger account</p>
                            <p className="text-gray-400 text-xs mt-1">to view details and transaction history</p>
                        </div>
                    }
                />
            </div>
        )
    }

    const { summary = [], grandTotal = 0 } = expenseSummary

    const columns = [
        {
            title: 'Date',
            dataIndex: 'expense_date',
            key: 'expense_date',
            width: 120,
            render: (d) => dayjs(d).format('DD MMM YYYY'),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            render: (text) => <Tooltip title={text}><span>{text}</span></Tooltip>,
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            width: 130,
            render: (cat) => <Tag color={CATEGORY_COLORS[cat]}>{CATEGORY_LABELS[cat] || cat}</Tag>,
        },
        {
            title: 'Amount',
            dataIndex: 'total_amount',
            key: 'total_amount',
            width: 140,
            align: 'right',
            render: (amt) => (
                <span className="font-semibold text-gray-800">
                    ₹ {Number(amt).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
            ),
        },
        {
            title: '',
            key: 'actions',
            width: 60,
            render: (_, record) => (
                <Space size={4}>
                    {canDeleteExpense && (
                        <Popconfirm
                            title="Delete this expense?"
                            onConfirm={() => deleteExpense(record._id)}
                            okText="Delete"
                            okButtonProps={{ danger: true }}
                        >
                            <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ]

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-white">
            {/* Detail Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-start justify-between bg-white sticky top-0 z-10">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold text-gray-800 truncate">{selectedLedger.name}</h1>
                        <Tag className="capitalize px-2 rounded-md font-medium border-none bg-gray-100 text-gray-600">
                            {selectedLedger.type}
                        </Tag>
                    </div>
                    <div className="flex items-center gap-4 text-gray-500 text-xs">
                        <span className="flex items-center gap-1.5 text-gray-400">
                            <InfoCircleOutlined />
                            {selectedLedger.vendor_name || 'No vendor linked'}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                        <span className="text-gray-400">Created on {dayjs(selectedLedger.createdAt).format('DD MMM YYYY')}</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    {canEdit && (
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => onEditClick(selectedLedger)}
                            className="rounded-lg shadow-sm border-gray-200"
                        >
                            Edit Account
                        </Button>
                    )}
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-8 py-6 bg-gray-50/20">
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="rounded-xl shadow-none border border-gray-100 bg-white">
                        <Statistic
                            title="Total Outflow"
                            value={grandTotal}
                            precision={2}
                            prefix="₹"
                            valueStyle={{ color: '#ef4444', fontWeight: 700, whiteSpace: 'nowrap', fontSize: '20px' }}
                        />
                    </Card>
                    <Card className="rounded-xl shadow-none border border-gray-100 bg-white">
                        <Statistic
                            title="Transactions"
                            value={expenses.length}
                            valueStyle={{ fontWeight: 700 }}
                            suffix={<HistoryOutlined className="text-gray-300 ml-2" />}
                        />
                    </Card>
                    <Card className="rounded-xl shadow-none border border-transparent bg-blue-50/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-600/70 text-[10px] font-bold uppercase tracking-wider mb-1">Top Category</p>
                                <p className="text-blue-900 font-bold text-lg">
                                    {summary[0] ? (CATEGORY_LABELS[summary[0]._id] || summary[0]._id) : '—'}
                                </p>
                            </div>
                            <FileTextOutlined className="text-blue-600/20 text-3xl" />
                        </div>
                    </Card>
                </div>

                {/* Tabs Area */}
                <Tabs
                    defaultActiveKey="transactions"
                    items={[
                        {
                            key: 'transactions',
                            label: <span className="px-2">Transactions</span>,
                            children: (
                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mt-2">
                                    <Table
                                        dataSource={expenses}
                                        columns={columns}
                                        loading={expenseLoading}
                                        rowKey="_id"
                                        pagination={{ pageSize: 15, hideOnSinglePage: true }}
                                        size="middle"
                                        locale={{
                                            emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No transactions recorded for this ledger" />
                                        }}
                                    />
                                </div>
                            ),
                        },
                        {
                            key: 'overview',
                            label: <span className="px-2">Account Overview</span>,
                            children: (
                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 mt-2 space-y-6">
                                    <div>
                                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">Account Biography</h3>
                                        <div className="grid grid-cols-2 gap-y-6">
                                            <div>
                                                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-tight mb-1">Ledger Name</p>
                                                <p className="text-gray-700 font-medium">{selectedLedger.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-tight mb-1">Classification</p>
                                                <p className="text-gray-700 font-medium font-mono uppercase text-xs">{selectedLedger.type}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-tight mb-1">Vendor / Linked Entity</p>
                                                <p className="text-gray-700 font-medium">{selectedLedger.vendor_name || 'Not available'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-tight mb-1">Current Status</p>
                                                <Tag color={selectedLedger.status === 'active' ? 'green' : 'default'} className="rounded-full border-none bg-gray-100">
                                                    {selectedLedger.status || 'active'}
                                                </Tag>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ),
                        },
                    ]}
                />
            </div>
        </div>
    )
}

export default LedgerDetails
