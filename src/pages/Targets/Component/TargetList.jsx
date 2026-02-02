import { useEffect, useState, useCallback, useMemo } from "react";
import { Segmented, Table, Select, Form, Button, Row, Col } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { EyeOutlined } from "@ant-design/icons";
import useTargetStore from "@stores/TargetStore";
import userStore from "@stores/UserStore";
import centersStore from "@stores/CentersStore";
import { formatDate } from "@utils/helper";
import Chip from "@components/Chips/Chip";
import CustomDatePicker from '@components/form/CustomDatePicker';
import TargetDashboard from "./TargetDashboard";
import TargetProgressDrawer from "./TargetProgressDrawer";

function TargetList() {
    const { targets, loading, getTargets } = useTargetStore();
    const { user } = userStore();
    const { selectedCenter, centers, getCenters } = centersStore();

    const nav = useNavigate();
    const location = useLocation();
    const [dateFilters, setDateFilters] = useState({});
    const [statusFilter, setStatusFilter] = useState(null);
    const [form] = Form.useForm();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedTargetProgress, setSelectedTargetProgress] = useState(null);
    const [progressLoading, setProgressLoading] = useState(false);
    const { getTargetProgress } = useTargetStore();
    const queryParams = new URLSearchParams(location.search);

    // default view from URL params
    const selectedView = queryParams.get("view") || 'Dashboard';

    const updateURL = (view) => {
        nav(`?view=${view}`, { replace: true });
    };

    // Fetch targets based on selected view
    const fetchTargets = useCallback(() => {
        const filters = {};
        if (selectedView === 'All') {
            getTargets({ ...filters, ...dateFilters });
        } else if (selectedView === 'Dashboard') {
            getTargets(filters);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedView, dateFilters, statusFilter]);

    useEffect(() => {
        fetchTargets();
    }, [fetchTargets]);

    // Fetch centers if needed
    useEffect(() => {
        if (centers.length === 0) {
            getCenters();
        }
    }, [centers.length, getCenters]);

    // Filter targets based on center and status
    const filteredTargets = useMemo(() => {
        let filtered = targets;

        // Filter by center (when using AdminCenterSelector in the global layout)
        if (selectedCenter && selectedCenter !== 'all') {
            filtered = filtered.filter(target => target.center?._id === selectedCenter);
        }

        // Filter by status
        if (statusFilter && statusFilter !== 'all') {
            filtered = filtered.filter(target => target.status === statusFilter);
        }

        return filtered;
    }, [targets, selectedCenter, statusFilter]);

    // Calculate stats for dashboard
    const stats = useMemo(() => {
        return {
            total: targets.length,
            active: targets.filter(t => t.status === 'active').length,
            completed: targets.filter(t => t.status === 'completed').length,
            expired: targets.filter(t => t.status === 'expired').length,
            cancelled: targets.filter(t => t.status === 'cancelled').length,
        };
    }, [targets]);

    const columns = [
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
            render: (text) => <span className="font-medium">{text}</span>,
        },
        {
            title: "Target",
            dataIndex: "metrics",
            key: "metrics",
            render: (metrics) => {
                if (!metrics || Object.keys(metrics).length === 0) {
                    return <span className="text-gray-400">-</span>;
                }
                return (
                    <div className="space-y-1">
                        {Object.entries(metrics).map(([key, value]) => (
                            <div key={key} className="text-gray-700">
                                <span className="capitalize font-medium">{key}</span>:{' '}
                                <span className="text-primary font-semibold">
                                    {typeof value === 'object' ? value.target : value}
                                </span>
                            </div>
                        ))}
                    </div>
                );
            },
        },
        {
            title: "Center",
            dataIndex: ["center", "center_name"],
            key: "center",
            render: (text) => <span className="text-gray-700">{text || '-'}</span>,
        },
        {
            title: "Start Date",
            dataIndex: "start_date",
            key: "start_date",
            render: (date) => formatDate(date),
        },
        {
            title: "End Date",
            dataIndex: "end_date",
            key: "end_date",
            render: (date) => formatDate(date),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                const typeMap = {
                    active: 'success',
                    completed: 'draft',
                    expired: 'warning',
                    cancelled: 'archived'
                };
                return (
                    <Chip
                        label={status}
                        type={typeMap[status] || 'danger'}
                        size="small"
                        glow={true}
                    />
                );
            },
        },
        {
            title: "Progress",
            dataIndex: "_id",
            key: "progress",
            render: (id) => (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={async () => {
                        setProgressLoading(true);
                        setDrawerVisible(true);
                        const progressData = await getTargetProgress(id);
                        setSelectedTargetProgress(progressData);
                        setProgressLoading(false);
                    }}
                >
                    View
                </Button>
            ),
        },
    ];

    const startDate = Form.useWatch('start_date', form);
    const endDate = Form.useWatch('end_date', form);

    // Table View (for All)
    const TableView = () => (
        <div>
            {/* Date Filters */}
            <div className="my-4">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={(values) => {
                        const filters = {};
                        if (values.start_date) filters.start_date = values.start_date.startOf('day').toISOString();
                        if (values.end_date) filters.end_date = values.end_date.endOf('day').toISOString();
                        setDateFilters(filters);
                    }}
                >
                    <Row gutter={12}>
                        <Col xs={24} sm={12} md={8} lg={8}>
                            <CustomDatePicker
                                name="start_date"
                                label="From"
                                placeholder="Select start date"
                                required={false}
                                disabledMode="after"
                                targetDate={endDate}
                                className="w-full"
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8}>
                            <CustomDatePicker
                                name="end_date"
                                label="To"
                                placeholder="Select end date"
                                required={false}
                                disabledMode="before"
                                targetDate={startDate}
                                className="w-full"
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8}>
                            <Form.Item label="Status" name="status">
                                <Select
                                    placeholder="Select status"
                                    allowClear
                                    options={[
                                        { label: 'All', value: 'all' },
                                        { label: 'Active', value: 'active' },
                                        { label: 'Completed', value: 'completed' },
                                        { label: 'Expired', value: 'expired' },
                                        { label: 'Cancelled', value: 'cancelled' }
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row className="mt-2" justify="end">
                        <Col>
                            <Button onClick={() => {
                                form.resetFields();
                                setDateFilters({});
                                setStatusFilter(null);
                            }} style={{ marginRight: 8 }}>
                                Reset
                            </Button>
                            <Button type="primary" htmlType="submit" onClick={() => {
                                const values = form.getFieldsValue();
                                const filters = {};
                                if (values.start_date) filters.start_date = values.start_date.startOf('day').toISOString();
                                if (values.end_date) filters.end_date = values.end_date.endOf('day').toISOString();
                                setDateFilters(filters);
                                setStatusFilter(values.status || null);
                            }}>
                                Apply
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </div>

            <div className="mb-4 flex flex-wrap gap-4 justify-between items-center">
                <p>
                    Total Targets: <span className="font-bold">{filteredTargets.length}</span>
                    {selectedCenter && selectedCenter !== 'all' && (
                        <span className="ml-2 text-gray-500">
                            (Filtered by {centers.find(c => c._id === selectedCenter)?.center_name || 'center'})
                        </span>
                    )}
                </p>
            </div>

            <Table
                columns={columns}
                dataSource={filteredTargets}
                loading={loading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} targets`,
                }}
                rowKey="_id"
            />
        </div>
    );


    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <Segmented
                    options={["Dashboard", "All"]}
                    value={selectedView}
                    onChange={(view) => { updateURL(view) }}
                />
            </div>

            {selectedView === 'Dashboard' ? (
                <TargetDashboard />
            ) : (
                <>
                    <TableView />
                    <TargetProgressDrawer
                        target={selectedTargetProgress}
                        visible={drawerVisible}
                        onClose={() => {
                            setDrawerVisible(false);
                            setSelectedTargetProgress(null);
                        }}
                        loading={progressLoading}
                    />
                </>
            )}
        </>
    );
}

export default TargetList;
