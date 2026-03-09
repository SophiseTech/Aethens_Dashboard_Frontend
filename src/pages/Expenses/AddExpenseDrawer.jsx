import { useEffect, useState, useRef } from "react";
import {
    Drawer,
    Form,
    Input,
    InputNumber,
    Select,
    DatePicker,
    Button,
    Space,
    Divider,
    Spin,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import centersService from "@services/Centers";
import userService from "@services/User";

const { TextArea } = Input;
const { Option } = Select;

const CATEGORIES = [
    { value: "rent", label: "Rent" },
    { value: "salary", label: "Salary" },
    { value: "food", label: "Food" },
    { value: "maintenance", label: "Maintenance" },
    { value: "utilities", label: "Utilities" },
    { value: "travel", label: "Travel" },
    { value: "marketing", label: "Marketing" },
    { value: "other", label: "Other" },
];

const PAYMENT_TYPES = [
    { value: "advance", label: "Advance" },
    { value: "reimbursement", label: "Reimbursement" },
    { value: "direct", label: "Direct" },
];

const PAYMENT_METHODS = [
    { value: "cash", label: "Cash" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "upi", label: "UPI" },
    { value: "cheque", label: "Cheque" },
    { value: "other", label: "Other" },
];

/**
 * AddExpenseDrawer
 * Props:
 *   open         - boolean
 *   onClose      - fn
 *   onSubmit     - fn(formValues) => Promise<void>
 *   loading      - boolean
 *   ledgers      - array of existing ledger docs
 *   ledgersLoading - boolean
 */
function AddExpenseDrawer({ open, onClose, onSubmit, loading, ledgers = [], ledgersLoading }) {
    const [form] = Form.useForm();
    const [totalAmount, setTotalAmount] = useState(0);
    // Track if the user picked a new ledger name (not an existing id)
    const [newLedgerName, setNewLedgerName] = useState(null);

    const [centers, setCenters] = useState([]);
    const [centersLoading, setCentersLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const searchTimeoutRef = useRef(null);

    const ledgerType = Form.useWatch("ledger_type", form);
    const onModel = Form.useWatch("on_model", form);

    useEffect(() => {
        if (!open) {
            form.resetFields();
            setTotalAmount(0);
            setNewLedgerName(null);
            setUsers([]);
            setCenters([]);
        }
    }, [open, form]);

    useEffect(() => {
        if (newLedgerName && ledgerType === "internal" && onModel === "Center" && centers.length === 0) {
            const fetchCenters = async () => {
                setCentersLoading(true);
                try {
                    const res = await centersService.getCenters({ status: "active" }, 0, 1000);
                    const centersList = res?.centers || (Array.isArray(res) ? res : []);
                    setCenters(centersList);
                } catch (error) {
                    console.error(error);
                } finally {
                    setCentersLoading(false);
                }
            };
            fetchCenters();
        }
    }, [newLedgerName, ledgerType, onModel, centers.length]);

    const recalcTotal = () => {
        const subtotal = form.getFieldValue("subtotal") || 0;
        const tax = form.getFieldValue("tax_amount") || 0;
        const total = subtotal + tax;
        setTotalAmount(total);
        form.setFieldValue("total_amount", total);
    };

    const handleLedgerTypeChange = (val) => {
        if (val === "external") {
            form.setFieldsValue({ on_model: undefined, entity_id: undefined });
        } else {
            form.setFieldsValue({ vendor_name: undefined });
        }
    };

    const handleOnModelChange = () => {
        form.setFieldsValue({ entity_id: undefined });
        setUsers([]);
    };

    const handleUserSearch = (search) => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        if (!search) {
            setUsers([]);
            return;
        }

        searchTimeoutRef.current = setTimeout(async () => {
            setUsersLoading(true);
            try {
                const results = await userService.searchUsersV2(search);
                setUsers(Array.isArray(results) ? results : []);
            } catch (err) {
                console.error(err);
            } finally {
                setUsersLoading(false);
            }
        }, 400);
    };

    const handleFinish = async (values) => {
        // Pass ledger_name so the hook can auto-create if needed
        await onSubmit({
            ...values,
            ledger_name: newLedgerName,
            ledger_type: values.ledger_type,
            on_model: values.on_model,
            entity_id: values.entity_id,
            vendor_name: values.vendor_name
        });
    };

    // Called when user selects an existing ledger or types a new name
    const handleLedgerChange = (value, option) => {
        if (option?.isNew) {
            setNewLedgerName(value);
        } else {
            setNewLedgerName(null);
        }
    };

    const [ledgerSearch, setLedgerSearch] = useState("");

    // Build options: existing ledgers + "Create new" if typed name doesn't match
    const ledgerOptions = ledgers.map((l) => ({
        value: l._id,
        label: l.name,
    }));

    const matchExists = ledgers.some(
        (l) => l.name.toLowerCase() === ledgerSearch.toLowerCase()
    );
    if (ledgerSearch && !matchExists) {
        ledgerOptions.push({
            value: ledgerSearch,
            label: (
                <Space>
                    <PlusOutlined />
                    {`Create "${ledgerSearch}"`}
                </Space>
            ),
            isNew: true,
        });
    }

    return (
        <Drawer
            title="Add New Expense"
            placement="right"
            width={480}
            open={open}
            onClose={onClose}
            footer={
                <div className="flex justify-end gap-2">
                    <Button onClick={onClose}>Cancel</Button>
                    <Button
                        type="primary"
                        loading={loading}
                        onClick={() => form.submit()}
                        style={{ backgroundColor: "#4F651E" }}
                    >
                        Save Expense
                    </Button>
                </div>
            }
        >
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                {/* Ledger */}
                <Form.Item
                    name="ledger_id"
                    label="Ledger / Account"
                    rules={[{ required: true, message: "Please select or create a ledger" }]}
                >
                    <Select
                        showSearch
                        placeholder="Search or create a ledger..."
                        loading={ledgersLoading}
                        filterOption={false}
                        onSearch={(v) => setLedgerSearch(v)}
                        onChange={handleLedgerChange}
                        options={ledgerOptions}
                        optionLabelProp="label"
                    />
                </Form.Item>

                {/* Ledger Type (Only show if creating a new ledger) */}
                {newLedgerName && (
                    <>
                        <Form.Item
                            name="ledger_type"
                            label="Ledger Type"
                            initialValue="external"
                            rules={[{ required: true, message: "Please select a ledger type" }]}
                        >
                            <Select placeholder="Select ledger type" onChange={handleLedgerTypeChange}>
                                <Option value="external">External</Option>
                                <Option value="internal">Internal</Option>
                            </Select>
                        </Form.Item>

                        {/* Internal Ledger Fields */}
                        {ledgerType === "internal" && (
                            <div className="flex gap-3 grid grid-cols-2 mb-6">
                                <Form.Item
                                    name="on_model"
                                    label="Entity Type"
                                    rules={[{ required: true, message: "Required" }]}
                                    style={{ marginBottom: 0 }}
                                >
                                    <Select placeholder="User or Center" onChange={handleOnModelChange}>
                                        <Option value="User">User</Option>
                                        <Option value="Center">Center</Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    name="entity_id"
                                    label="Select Entity"
                                    rules={[{ required: true, message: "Required" }]}
                                    style={{ marginBottom: 0 }}
                                >
                                    {onModel === "Center" ? (
                                        <Select
                                            placeholder="Select Center"
                                            loading={centersLoading}
                                            optionLabelProp="label"
                                            options={centers.map(c => ({ label: c.center_name || c.name, value: String(c._id) }))}
                                            showSearch
                                            filterOption={(input, option) =>
                                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                            }
                                        />
                                    ) : (
                                        <Select
                                            placeholder="Search User..."
                                            showSearch
                                            filterOption={false}
                                            loading={usersLoading}
                                            onSearch={handleUserSearch}
                                            optionLabelProp="label"
                                            options={users.map(u => ({
                                                label: `${u.username || u.name} ${u.role ? `(${u.role})` : ''}`,
                                                value: String(u._id)
                                            }))}
                                            notFoundContent={usersLoading ? <Spin size="small" /> : null}
                                        />
                                    )}
                                </Form.Item>
                            </div>
                        )}

                        {/* External Ledger Fields */}
                        {ledgerType === "external" && (
                            <Form.Item
                                name="vendor_name"
                                label="Vendor Name"
                            >
                                <Input placeholder="Enter vendor/supplier name" />
                            </Form.Item>
                        )}
                        <Divider className="my-3" />
                    </>
                )}

                {/* Description */}
                <Form.Item
                    name="description"
                    label="Description"
                    rules={[{ required: true, message: "Please enter a description" }]}
                >
                    <TextArea rows={2} placeholder="What is this expense for?" />
                </Form.Item>

                {/* Category */}
                <Form.Item
                    name="category"
                    label="Category"
                    rules={[{ required: true, message: "Please select a category" }]}
                >
                    <Select placeholder="Select category">
                        {CATEGORIES.map((c) => (
                            <Option key={c.value} value={c.value}>
                                {c.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                {/* Date */}
                <Form.Item
                    name="expense_date"
                    label="Expense Date"
                    initialValue={dayjs()}
                    rules={[{ required: true, message: "Please pick a date" }]}
                >
                    <DatePicker className="w-full" format="DD MMM YYYY" />
                </Form.Item>

                <Divider className="my-3" />

                {/* Amounts */}
                <div className="grid grid-cols-2 gap-3">
                    <Form.Item
                        name="subtotal"
                        label="Subtotal (₹)"
                        rules={[{ required: true, message: "Required" }]}
                    >
                        <InputNumber
                            className="w-full"
                            min={0}
                            precision={2}
                            placeholder="0.00"
                            onChange={recalcTotal}
                        />
                    </Form.Item>

                    <Form.Item name="tax_amount" label="Tax (₹)" initialValue={0}>
                        <InputNumber
                            className="w-full"
                            min={0}
                            precision={2}
                            placeholder="0.00"
                            onChange={recalcTotal}
                        />
                    </Form.Item>
                </div>

                <Form.Item name="total_amount" label="Total Amount (₹)">
                    <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-lg font-semibold text-primary">
                        ₹ {totalAmount.toFixed(2)}
                    </div>
                </Form.Item>

                <Divider className="my-3" />

                {/* Payment type + method */}
                <div className="grid grid-cols-2 gap-3">
                    <Form.Item
                        name="payment_type"
                        label="Payment Type"
                        rules={[{ required: true, message: "Required" }]}
                    >
                        <Select placeholder="Select type">
                            {PAYMENT_TYPES.map((t) => (
                                <Option key={t.value} value={t.value}>
                                    {t.label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="payment_method"
                        label="Payment Method"
                        rules={[{ required: true, message: "Required" }]}
                    >
                        <Select placeholder="Select method">
                            {PAYMENT_METHODS.map((m) => (
                                <Option key={m.value} value={m.value}>
                                    {m.label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>
            </Form>
        </Drawer>
    );
}

export default AddExpenseDrawer;
