import ledgerStore from '@stores/LedgerStore'
import { ArrowUpOutlined, WalletOutlined } from '@ant-design/icons'
import { Progress } from 'antd'
import { useStore } from 'zustand'

const CATEGORY_COLORS = {
    rent: '#ef4444', salary: '#f97316', food: '#eab308',
    maintenance: '#3b82f6', utilities: '#8b5cf6', travel: '#06b6d4',
    marketing: '#ec4899', other: '#6b7280',
}

const CATEGORY_LABELS = {
    rent: 'Rent', salary: 'Salary', food: 'Food',
    maintenance: 'Maintenance', utilities: 'Utilities',
    travel: 'Travel', marketing: 'Marketing', other: 'Other',
}

function SummaryCard() {
    const { expenseSummary } = useStore(ledgerStore)
    const { summary = [], grandTotal = 0 } = expenseSummary
    const top5 = summary.slice(0, 5)
    const topCategory = summary[0]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Expense */}
            <div className="bg-white rounded-xl shadow-sm p-4 flex items-start gap-4 border border-red-100">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <ArrowUpOutlined className="text-red-500 text-lg" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400 font-medium">Total Expenses</p>
                    <p className="text-xl font-bold text-red-500 mt-0.5">
                        ₹ {Number(grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>

            {/* Top Category */}
            <div className="bg-white rounded-xl shadow-sm p-4 flex items-start gap-4 border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <WalletOutlined className="text-gray-500 text-lg" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400 font-medium">Top Category</p>
                    {topCategory ? (
                        <>
                            <p className="text-xl font-bold text-gray-700 mt-0.5">
                                {CATEGORY_LABELS[topCategory._id] || topCategory._id}
                            </p>
                            <p className="text-xs text-gray-400">
                                ₹ {Number(topCategory.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                        </>
                    ) : (
                        <p className="text-sm text-gray-400 mt-0.5">—</p>
                    )}
                </div>
            </div>

            {/* Category breakdown */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <p className="text-xs text-gray-400 font-medium mb-2">Breakdown (Top 5)</p>
                {top5.length > 0 ? (
                    <div className="space-y-1.5">
                        {top5.map((item) => (
                            <div key={item._id} className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 w-20 truncate">
                                    {CATEGORY_LABELS[item._id] || item._id}
                                </span>
                                <Progress
                                    percent={grandTotal > 0 ? Math.round((item.total / grandTotal) * 100) : 0}
                                    showInfo={false}
                                    size={{ height: 4 }}
                                    strokeColor={CATEGORY_COLORS[item._id] || '#6b7280'}
                                    trailColor="#f3f4f6"
                                    className="flex-1"
                                />
                                <span className="text-xs text-gray-500 w-9 text-right">
                                    {grandTotal > 0 ? Math.round((item.total / grandTotal) * 100) : 0}%
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-gray-400">No data</p>
                )}
            </div>
        </div>
    )
}

export default SummaryCard
