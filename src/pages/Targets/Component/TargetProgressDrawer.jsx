import { useState, useMemo, useEffect } from "react";
import {
    Drawer,
    Card,
    Typography,
    Row,
    Col,
    Divider,
    Tag,
    Progress,
    Descriptions,
    Statistic,
    Button,
    Modal,
    Form,
    InputNumber,
    Space,
    Popconfirm,
} from "antd";
import {
    AimOutlined,
    CalendarOutlined,
    InfoCircleOutlined,
    EditOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import { formatDate } from "@utils/helper";
import Chip from "@components/Chips/Chip";
import userStore from "@stores/UserStore";
import useTargetStore from "@stores/TargetStore";
import centersStore from "@stores/CentersStore";
import CustomForm from "@components/form/CustomForm";
import CustomInput from "@components/form/CustomInput";
import CustomSelect from "@components/form/CustomSelect";
import CustomDatePicker from "@components/form/CustomDatePicker";
import CustomSubmit from "@components/form/CustomSubmit";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const TargetProgressDrawer = ({ target, visible, onClose, loading }) => {
    const { user } = userStore();
    const { updateTarget, deleteTarget, loading: targetLoading } = useTargetStore();
    const { centers } = centersStore();
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [form] = Form.useForm();

    const isAdmin = user?.role === 'admin';

    // Center options for select
    const centerOptions = useMemo(
        () => centers?.map(center => ({ label: center.center_name, value: center._id })),
        [centers]
    );

    const targetTypeOptions = [
        { label: 'Enrollments', value: 'enrollments' },
        { label: 'Revenue', value: 'revenue' },
        { label: 'Enquiries', value: 'enquiries' },
        { label: 'Demos', value: 'demos' },
    ];

    const statusOptions = [
        { label: 'Active', value: 'active' },
        { label: 'Completed', value: 'completed' },
        { label: 'Expired', value: 'expired' },
        { label: 'Cancelled', value: 'cancelled' },
    ];

    // Populate form when editing
    useEffect(() => {
        if (editModalOpen && target?.target) {
            const targetData = target.target;
            const metrics = targetData.metrics || {};
            const metricKey = Object.keys(metrics)[0] || 'enrollments';
            const metricValue = metrics[metricKey] || 0;

            form.setFieldsValue({
                title: targetData.title,
                description: targetData.description,
                center: targetData.center?._id,
                startDate: targetData.start_date ? dayjs(targetData.start_date) : null,
                endDate: targetData.end_date ? dayjs(targetData.end_date) : null,
                targetType: metricKey,
                targetValue: metricValue,
                status: targetData.status,
            });
        }
    }, [editModalOpen, target, form]);

    if (!target) return null;

    const getStatusColor = (status) => {
        const colorMap = {
            'active': 'success',
            'completed': 'blue',
            'expired': 'warning',
            'cancelled': 'default'
        };
        return colorMap[status] || 'default';
    };

    const getMetricStatusType = (status) => {
        const typeMap = {
            'achieved': 'success',
            'on-track': 'primary',
            'at-risk': 'warning',
            'behind': 'danger'
        };
        return typeMap[status] || 'draft';
    };

    const handleEdit = () => {
        setEditModalOpen(true);
    };

    const handleEditCancel = () => {
        form.resetFields();
        setEditModalOpen(false);
    };

    const handleEditSubmit = async (values) => {
        const targetId = target.target?._id;
        if (!targetId) return { reset: false };

        const updateData = {
            title: values.title,
            description: values.description,
            center: values.center,
            start_date: values.startDate?.toISOString(),
            end_date: values.endDate?.toISOString(),
            status: values.status,
            metrics: {
                [values.targetType]: values.targetValue
            }
        };

        const updated = await updateTarget(targetId, updateData);
        if (updated) {
            setEditModalOpen(false);
            onClose(); // Close the drawer to refresh
            return { reset: true };
        }
        return { reset: false };
    };

    const handleDelete = async () => {
        const targetId = target.target?._id;
        if (!targetId) return;

        await deleteTarget(targetId);
        onClose(); // Close the drawer after deletion
    };

    return (
        <>
            <Drawer
                title="Target Progress Details"
                placement="right"
                open={visible}
                onClose={onClose}
                width={500}
                headerStyle={{ background: "#f0f2f5" }}
                bodyStyle={{ padding: 20 }}
                extra={
                    isAdmin && (
                        <Space>
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={handleEdit}
                                disabled={target.target?.status === 'completed'}
                                title={target.target?.status === 'completed' ? "Completed targets cannot be edited" : ""}
                            >
                                Edit
                            </Button>
                            <Popconfirm
                                title="Delete Target"
                                description="Are you sure you want to delete this target?"
                                onConfirm={handleDelete}
                                okText="Yes, Delete"
                                cancelText="Cancel"
                                okButtonProps={{ danger: true }}
                            >
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                >
                                    Delete
                                </Button>
                            </Popconfirm>
                        </Space>
                    )
                }
            >
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <Statistic title="Loading..." loading />
                    </div>
                ) : (
                    <>
                        {/* Target Header */}
                        <Card bordered={false}>
                            <div className="flex justify-between items-center">
                                <Title level={3} style={{ marginBottom: 0 }}>
                                    {target.target?.title}
                                </Title>
                                <Tag color={getStatusColor(target.target?.status)} className="text-base px-3 py-1 m-0">
                                    {target.target?.status?.toUpperCase()}
                                </Tag>
                            </div>
                        </Card>

                        <Divider />

                        {/* Target Information */}
                        <Card bordered={false}>
                            <Title level={5}>
                                <InfoCircleOutlined /> Target Information
                            </Title>
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="Description">
                                    {target.target?.description || '-'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Center">
                                    {target.target?.center?.center_name || '-'}
                                </Descriptions.Item>
                            </Descriptions>
                            <Row gutter={16} className="mt-2">
                                <Col span={12}>
                                    <Text type="secondary" className="block text-xs mb-1">Start Date</Text>
                                    <div className="flex items-center gap-2">
                                        <CalendarOutlined className="text-gray-400" />
                                        <Text>{formatDate(target.target?.start_date)}</Text>
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <Text type="secondary" className="block text-xs mb-1">End Date</Text>
                                    <div className="flex items-center gap-2">
                                        <CalendarOutlined className="text-gray-400" />
                                        <Text>{formatDate(target.target?.end_date)}</Text>
                                    </div>
                                </Col>
                            </Row>
                        </Card>

                        <Divider />

                        {/* Overall Progress */}
                        <Card className="bg-blue-50" bordered={false}>
                            <div className="text-center">
                                <Title level={5}>Overall Progress</Title>
                                <Progress
                                    type="circle"
                                    percent={Math.round(target.overall_progress || 0)}
                                    strokeColor={{
                                        '0%': '#108ee9',
                                        '100%': '#87d068',
                                    }}
                                    size={120}
                                />
                                <div className="mt-6 flex justify-around w-full border-t border-blue-100 pt-4">
                                    <div className="text-center">
                                        <Text type="secondary" className="block text-xs mb-1">Achieved</Text>
                                        <Text strong className="text-xl text-green-600">
                                            {target.current_progress && Object.values(target.current_progress).reduce((sum, m) => sum + (Number(m.achieved) || 0), 0).toLocaleString()}
                                        </Text>
                                    </div>
                                    <div className="text-center">
                                        <Text type="secondary" className="block text-xs mb-1">Remaining</Text>
                                        <Text strong className="text-xl text-gray-600">
                                            {Math.max(0, (target.current_progress && Object.values(target.current_progress).reduce((sum, m) => sum + (Number(m.target) || 0), 0)) - (target.current_progress && Object.values(target.current_progress).reduce((sum, m) => sum + (Number(m.achieved) || 0), 0))).toLocaleString()}
                                        </Text>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Divider />

                        {/* Metrics Breakdown */}
                        <div>
                            <Title level={5}>Metrics Breakdown</Title>
                            {target.current_progress && Object.keys(target.current_progress).length > 0 ? (
                                <div className="space-y-3">
                                    {Object.entries(target.current_progress).map(([metricKey, metricData]) => (
                                        <Card key={metricKey} size="small" className="shadow-sm">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium capitalize">
                                                        {metricKey.replace(/_/g, ' ')}
                                                    </span>
                                                    <Chip
                                                        label={metricData.status}
                                                        type={getMetricStatusType(metricData.status)}
                                                        size="small"
                                                        glow={true}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-sm text-gray-600">
                                                    <span>Target: <strong>{metricData.target?.toLocaleString() || 0}</strong></span>
                                                    <span>Achieved: <strong>{metricData.achieved?.toLocaleString() || 0}</strong></span>
                                                </div>
                                                <Progress
                                                    percent={Math.round(metricData.percentage || 0)}
                                                    status={
                                                        metricData.percentage >= 100 ? 'success' :
                                                            metricData.percentage >= 75 ? 'active' :
                                                                metricData.percentage >= 50 ? 'normal' :
                                                                    'exception'
                                                    }
                                                />
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <Card size="small">
                                    <Text type="secondary">No metrics data available</Text>
                                </Card>
                            )}
                        </div>

                        <Divider />

                        {/* Progress History */}
                        {target.history && target.history.length > 0 && (
                            <>
                                <div>
                                    <Title level={5}>Progress History</Title>
                                    <Text type="secondary" className="block mb-3">
                                        Historical snapshots of target progress
                                    </Text>
                                    <div className="space-y-2">
                                        {target.history.slice(0, 5).map((snapshot, index) => (
                                            <Card key={snapshot._id || index} size="small" className="bg-gray-50">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <Text strong>{formatDate(snapshot.snapshot_date)}</Text>
                                                        <br />
                                                        <Text type="secondary" className="text-xs">
                                                            Overall: {Math.round(snapshot.overall_progress)}%
                                                        </Text>
                                                    </div>
                                                    <Progress
                                                        type="circle"
                                                        percent={Math.round(snapshot.overall_progress || 0)}
                                                        width={50}
                                                        strokeWidth={8}
                                                    />
                                                </div>
                                                {snapshot.current_progress && (
                                                    <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                                                        {Object.entries(snapshot.current_progress).map(([key, data]) => (
                                                            <div key={key}>
                                                                <Text type="secondary">{key}:</Text> {data.achieved}/{data.target}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}
            </Drawer>

            {/* Edit Target Modal */}
            <Modal
                title="Edit Target"
                open={editModalOpen}
                footer={null}
                onCancel={handleEditCancel}
                destroyOnClose
            >
                <CustomForm
                    form={form}
                    action={handleEditSubmit}
                    resetOnFinish={(result) => Boolean(result && result.reset === true)}
                >
                    <CustomInput
                        label="Target Title"
                        name="title"
                        placeholder="e.g., Q1 Enrollment Target"
                    />
                    <CustomInput
                        label="Description"
                        name="description"
                        placeholder="Describe the target"
                        required={false}
                    />
                    <CustomSelect
                        label="Status"
                        name="status"
                        options={statusOptions}
                    />
                    <CustomSelect
                        label="Target Type"
                        name="targetType"
                        options={targetTypeOptions}
                    />
                    <Form.Item
                        label="Target Value"
                        name="targetValue"
                        rules={[{ required: true, message: 'Please enter target value' }]}
                    >
                        <InputNumber
                            className="w-full"
                            min={0}
                            placeholder="Enter target value"
                        />
                    </Form.Item>
                    <CustomSelect
                        label="Center"
                        name="center"
                        options={centerOptions}
                    />
                    <Row gutter={16}>
                        <Col span={12}>
                            <CustomDatePicker
                                label="Start Date"
                                name="startDate"
                                className="w-full"
                            />
                        </Col>
                        <Col span={12}>
                            <CustomDatePicker
                                label="End Date"
                                name="endDate"
                                className="w-full"
                            />
                        </Col>
                    </Row>
                    <CustomSubmit className='bg-primary' label="Update Target" loading={targetLoading} />
                </CustomForm>
            </Modal>
        </>
    );
};

export default TargetProgressDrawer;
