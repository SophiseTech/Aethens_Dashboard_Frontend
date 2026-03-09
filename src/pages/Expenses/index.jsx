import { useEffect, useState, useCallback } from 'react'
import { Table, Button, Tag, Space, Tooltip, DatePicker, Select, Popconfirm, Empty } from 'antd'
import { PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import Title from '@components/layouts/Title'
import permissions from '@utils/permissions'
import userStore from '@stores/UserStore'
import ledgerStore from '@stores/LedgerStore'
import dayjs from 'dayjs'
import SummaryCard from './SummaryCard'
import AddExpenseDrawer from './AddExpenseDrawer'
import useExpenses from '@hooks/useExpenses'

const { RangePicker } = DatePicker

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

function Expenses() {
    const { user } = userStore()
    const {
        ledgers, ledgersLoading, getLedgers,
        expenses, expenseLoading, expenseTotal,
        getExpenses, deleteExpense, getExpenseSummary,
    } = ledgerStore()

    // For the AddExpenseDrawer (handles ledger auto-create)
    const {
        fetchLedgers: hookFetchLedgers,
        createExpense: hookCreateExpense,
        createLoading: hookCreateLoading,
        ledgers: hookLedgers,
        ledgersLoading: hookLedgersLoading,
    } = useExpenses()

    // Local state
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [dateRange, setDateRange] = useState(null)
    const [categoryFilter, setCategoryFilter] = useState(null)
    const [selectedLedgerId, setSelectedLedgerId] = useState(null)

    const canAdd = permissions.expenses?.add?.includes(user?.role)
    const canDelete = permissions.ledger?.delete?.includes(user?.role)

    // Fetch ledgers on mount (for the dropdown filter)
    useEffect(() => {
        getLedgers()
    }, [])

    // Refetch expenses when any filter changes
    const applyFilters = useCallback((ledgerId, range, category) => {
        const query = {}
        if (ledgerId) query.ledger_id = ledgerId
        const filters = { query }
        if (range?.[0]) filters.from_date = range[0].startOf('day').toISOString()
        if (range?.[1]) filters.to_date = range[1].endOf('day').toISOString()
        if (category) query.category = category
        getExpenses(filters)
        getExpenseSummary({
            ledger_id: ledgerId || undefined,
            from_date: filters.from_date,
            to_date: filters.to_date,
        })
    }, [getExpenses, getExpenseSummary])

    useEffect(() => {
        applyFilters(selectedLedgerId, dateRange, categoryFilter)
    }, [selectedLedgerId, dateRange, categoryFilter])

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleOpenDrawer = () => {
        hookFetchLedgers()
        setDrawerOpen(true)
    }

    const handleExpenseSubmit = async (values) => {
        const success = await hookCreateExpense(values)
        if (success) {
            setDrawerOpen(false)
            applyFilters(selectedLedgerId, dateRange, categoryFilter)
        }
    }

    const handleDeleteExpense = async (id) => {
        await deleteExpense(id)
    }

    // ── Table columns ──────────────────────────────────────────────────────────
    const columns = [
        {
            title: 'Date',
            dataIndex: 'expense_date',
            key: 'expense_date',
            width: 110,
            render: (d) => dayjs(d).format('DD MMM YYYY'),
            sorter: (a, b) => dayjs(a.expense_date).unix() - dayjs(b.expense_date).unix(),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            render: (text) => <Tooltip title={text}><span>{text}</span></Tooltip>,
        },
        {
            title: 'Ledger',
            dataIndex: 'ledger_id',
            key: 'ledger_id',
            width: 140,
            render: (l) => l?.name || '—',
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            width: 120,
            render: (cat) => <Tag color={CATEGORY_COLORS[cat]}>{CATEGORY_LABELS[cat] || cat}</Tag>,
        },
        {
            title: 'Payment',
            dataIndex: 'payment_method',
            key: 'payment_method',
            width: 120,
            render: (m) => m?.replace('_', ' ').toUpperCase(),
        },
        {
            title: 'Amount (₹)',
            dataIndex: 'total_amount',
            key: 'total_amount',
            width: 130,
            align: 'right',
            render: (amt) => (
                <span className="font-semibold text-red-500">
                    ₹ {Number(amt).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
            ),
            sorter: (a, b) => a.total_amount - b.total_amount,
        },
        {
            title: 'By',
            dataIndex: 'created_by',
            key: 'created_by',
            width: 120,
            render: (u) => u?.name || u?.email || '—',
        },
        {
            title: '',
            key: 'actions',
            width: 60,
            render: (_, record) => (
                <Space size={4}>
                    {canDelete && (
                        <Popconfirm
                            title="Delete this expense?"
                            onConfirm={() => handleDeleteExpense(record._id)}
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
        <Title
            title="Expenses"
            button={
                canAdd && (
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleOpenDrawer}
                    >
                        Add Expense
                    </Button>
                )
            }
        >
            <div className="flex flex-col gap-4">
                {/* Summary cards */}
                <SummaryCard />

                {/* Filters row */}
                <div className="flex flex-wrap gap-3 items-center">
                    <Select
                        allowClear
                        placeholder="All ledgers"
                        style={{ minWidth: 180 }}
                        loading={ledgersLoading}
                        onChange={(val) => setSelectedLedgerId(val || null)}
                        options={ledgers.map((l) => ({ value: l._id, label: l.name }))}
                        showSearch
                        filterOption={(input, opt) =>
                            (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                    />
                    <RangePicker
                        onChange={(val) => setDateRange(val)}
                        format="DD MMM YYYY"
                        className="max-w-xs"
                    />
                    <Select
                        allowClear
                        placeholder="All categories"
                        style={{ width: 160 }}
                        onChange={(val) => setCategoryFilter(val)}
                        options={Object.entries(CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: l }))}
                    />
                    <Tooltip title="Refresh">
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => applyFilters(selectedLedgerId, dateRange, categoryFilter)}
                        />
                    </Tooltip>
                </div>

                {/* Expense table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <Table
                        dataSource={expenses}
                        columns={columns}
                        loading={expenseLoading}
                        rowKey="_id"
                        scroll={{ x: 900 }}
                        pagination={false}
                        locale={{
                            emptyText: (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={
                                        <span className="text-gray-400">
                                            {dateRange
                                                ? 'No expenses found for this period'
                                                : 'No expenses recorded yet'}
                                        </span>
                                    }
                                />
                            ),
                        }}
                    />
                    {expenseTotal > expenses.length && (
                        <div className="flex justify-center py-3 border-t border-gray-100">
                            <Button
                                onClick={() => applyFilters(selectedLedgerId, dateRange, categoryFilter)}
                                loading={expenseLoading}
                            >
                                Load more
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Expense Drawer */}
            <AddExpenseDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                onSubmit={handleExpenseSubmit}
                loading={hookCreateLoading}
                ledgers={hookLedgers}
                ledgersLoading={hookLedgersLoading}
            />
        </Title>
    )
}

export default Expenses
