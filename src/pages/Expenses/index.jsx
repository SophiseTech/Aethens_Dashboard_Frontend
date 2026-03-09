import { useEffect, useState } from "react";
import { Table, Button, Tag, Space, Tooltip } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Title from "@components/layouts/Title";
import useExpenses from "@hooks/useExpenses";
import AddExpenseDrawer from "./AddExpenseDrawer";
import permissions from "@utils/permissions";
import userStore from "@stores/UserStore";
import dayjs from "dayjs";
import { paymentMethods } from "@utils/constants";

const CATEGORY_LABELS = {
    rent: "Rent",
    salary: "Salary",
    food: "Food",
    maintenance: "Maintenance",
    utilities: "Utilities",
    travel: "Travel",
    marketing: "Marketing",
    other: "Other",
};

function Expenses() {
    const { user } = userStore();
    const {
        expenses,
        loading,
        total,
        page,
        limit,
        fetchExpenses,
        changePage,
        ledgers,
        ledgersLoading,
        fetchLedgers,
        createExpense,
        createLoading,
    } = useExpenses();

    const [drawerOpen, setDrawerOpen] = useState(false);

    const canAdd = permissions.expenses.add.includes(user?.role);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const handleOpenDrawer = () => {
        fetchLedgers(); // load existing ledgers for the dropdown
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
    };

    const handleSubmit = async (values) => {
        const success = await createExpense(values);
        if (success) setDrawerOpen(false);
    };

    const columns = [
        {
            title: "Date",
            dataIndex: "expense_date",
            key: "expense_date",
            width: 110,
            render: (date) => dayjs(date).format("DD MMM YYYY"),
            sorter: (a, b) => dayjs(a.expense_date).unix() - dayjs(b.expense_date).unix(),
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
            render: (text) => (
                <Tooltip title={text}>
                    <span className="text-gray-800">{text}</span>
                </Tooltip>
            ),
        },
        {
            title: "Ledger",
            dataIndex: "ledger_id",
            key: "ledger",
            render: (ledger) =>
                ledger ? (
                    <span className="text-sm font-medium text-gray-600">{ledger.name}</span>
                ) : (
                    "—"
                ),
        },
        {
            title: "Category",
            dataIndex: "category",
            key: "category",
            render: (cat) => (
                <Tag color="geekblue">{CATEGORY_LABELS[cat] || cat}</Tag>
            ),
        },
        {
            title: "Payment Method",
            dataIndex: "payment_method",
            key: "payment_method",
            render: (method) => paymentMethods[method] || method,
        },
        {
            title: "Amount (₹)",
            dataIndex: "total_amount",
            key: "total_amount",
            align: "right",
            render: (amount) => (
                <span className="font-semibold text-primary">
                    ₹ {Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
            ),
            sorter: (a, b) => a.total_amount - b.total_amount,
        },
    ];

    return (
        <Title
            title="Expenses"
            button={
                canAdd && (
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleOpenDrawer}
                        style={{ backgroundColor: "#4F651E" }}
                    >
                        Add Expense
                    </Button>
                )
            }
        >
            <div className="bg-white rounded-xl shadow-sm p-4">
                <Table
                    dataSource={expenses}
                    columns={columns}
                    loading={loading}
                    rowKey="_id"
                    scroll={{ x: 800 }}
                    pagination={{
                        current: page,
                        pageSize: limit,
                        total,
                        showSizeChanger: false,
                        showTotal: (t) => `Total ${t} expenses`,
                        onChange: (p) => changePage(p),
                    }}
                    locale={{
                        emptyText: (
                            <div className="py-12 text-center text-gray-400">
                                <p className="text-lg font-medium">No expenses recorded yet</p>
                                {canAdd && (
                                    <p className="text-sm mt-1">
                                        Click <strong>Add Expense</strong> to get started
                                    </p>
                                )}
                            </div>
                        ),
                    }}
                />
            </div>

            <AddExpenseDrawer
                open={drawerOpen}
                onClose={handleCloseDrawer}
                onSubmit={handleSubmit}
                loading={createLoading}
                ledgers={ledgers}
                ledgersLoading={ledgersLoading}
            />
        </Title>
    );
}

export default Expenses;
