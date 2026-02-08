import { useState, useEffect } from "react";
import { Row, Col, Card, Statistic, Table, Tag, Select, message, Spin, Button, Modal } from "antd";
import {
    CalendarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    CheckOutlined,
    CloseOutlined,
    ExclamationCircleOutlined
} from "@ant-design/icons";
import { useStore } from "zustand";
import dayjs from "dayjs";
import Title from "@components/layouts/Title";
import leaveService from "@services/LeaveService";
import userService from "@services/User";
import centerStore from "@stores/CentersStore";

const { confirm } = Modal;

function AdminLeaves() {
    const [leaves, setLeaves] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState("PENDING"); // Default to pending
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [facultyFilter, setFacultyFilter] = useState("ALL");
    const [actionLoading, setActionLoading] = useState({});

    // Get selected center from store
    const { selectedCenter } = useStore(centerStore);

    // Fetch faculties when center changes
    useEffect(() => {
        fetchFaculties();
    }, [selectedCenter]);

    // Fetch leaves when filters or center changes
    useEffect(() => {
        fetchLeaves();
    }, [selectedCenter, statusFilter, typeFilter, facultyFilter]);

    const fetchFaculties = async () => {
        try {
            console.log("Fetching faculties for center:", selectedCenter);
            if (!selectedCenter) {
                console.log("No center selected, skipping faculty fetch");
                return;
            }

            const response = await userService.getByRoleByCenter('faculty', selectedCenter, 0, 1000);
            console.log("Faculty response:", response);
            setFaculties(response?.users || []);
            // Reset faculty filter when center changes
            setFacultyFilter("ALL");
        } catch (error) {
            console.error("Failed to load faculties:", error);
            message.error("Failed to load faculties");
        }
    };

    const fetchLeaves = async () => {
        try {
            setLoading(true);

            // Build filters object for server-side filtering
            const filters = {};

            // Add center filter
            if (selectedCenter) {
                filters.centerId = selectedCenter;
            }

            // Add faculty filter
            if (facultyFilter && facultyFilter !== "ALL") {
                filters.facultyId = facultyFilter;
            }

            // Add status filter
            if (statusFilter && statusFilter !== "ALL") {
                filters.status = statusFilter;
            }

            // Add type filter
            if (typeFilter && typeFilter !== "ALL") {
                filters.leaveType = typeFilter;
            }

            const data = await leaveService.getLeaves(filters);
            setLeaves(data || []);
        } catch (error) {
            message.error("Failed to load leaves");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = (leaveId) => {
        confirm({
            title: 'Approve Leave',
            icon: <ExclamationCircleOutlined />,
            content: 'Are you sure you want to approve this leave application?',
            okText: 'Approve',
            okType: 'primary',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    setActionLoading(prev => ({ ...prev, [leaveId]: true }));
                    await leaveService.approveLeave(leaveId);
                    message.success("Leave approved successfully");
                    fetchLeaves();
                } catch (error) {
                    message.error("Failed to approve leave");
                    console.error(error);
                } finally {
                    setActionLoading(prev => ({ ...prev, [leaveId]: false }));
                }
            }
        });
    };

    const handleReject = (leaveId) => {
        confirm({
            title: 'Reject Leave',
            icon: <ExclamationCircleOutlined />,
            content: 'Are you sure you want to reject this leave application?',
            okText: 'Reject',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    setActionLoading(prev => ({ ...prev, [leaveId]: true }));
                    await leaveService.rejectLeave(leaveId);
                    message.success("Leave rejected successfully");
                    fetchLeaves();
                } catch (error) {
                    message.error("Failed to reject leave");
                    console.error(error);
                } finally {
                    setActionLoading(prev => ({ ...prev, [leaveId]: false }));
                }
            }
        });
    };

    // Calculate stats
    const stats = {
        total: leaves.length,
        pending: leaves.filter(l => l.status === "PENDING").length,
        approved: leaves.filter(l => l.status === "APPROVED").length,
        rejected: leaves.filter(l => l.status === "REJECTED").length,
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "PENDING":
                return "warning";
            case "APPROVED":
                return "success";
            case "REJECTED":
                return "error";
            default:
                return "default";
        }
    };

    const getLeaveTypeDisplay = (type) => {
        switch (type) {
            case "CASUAL":
                return "Casual Leave";
            case "SICK":
                return "Sick Leave";
            case "PERMISSION":
                return "Permission";
            default:
                return type;
        }
    };

    const columns = [
        {
            title: "Faculty",
            dataIndex: ["facultyId", "username"],
            key: "faculty",
            render: (username, record) => (
                <div>
                    <div>{username}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>{record.facultyId?.email}</div>
                </div>
            ),
        },
        {
            title: "From Date",
            dataIndex: "fromDate",
            key: "fromDate",
            render: (date) => dayjs(date).format("DD MMM YYYY"),
            sorter: (a, b) => new Date(a.fromDate) - new Date(b.fromDate),
        },
        {
            title: "To Date",
            dataIndex: "toDate",
            key: "toDate",
            render: (date) => dayjs(date).format("DD MMM YYYY"),
        },
        {
            title: "Days",
            key: "days",
            render: (_, record) => leaveService.calculateDays(record.fromDate, record.toDate),
        },
        {
            title: "Leave Type",
            dataIndex: "leaveType",
            key: "leaveType",
            render: (type) => getLeaveTypeDisplay(type),
        },
        {
            title: "Reason",
            dataIndex: "reason",
            key: "reason",
            ellipsis: true,
            render: (text) => text || "-",
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {status}
                </Tag>
            ),
        },
        {
            title: "Applied On",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => dayjs(date).format("DD MMM YYYY"),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            defaultSortOrder: 'descend',
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => {
                if (record.status !== "PENDING") {
                    return <span style={{ color: '#888' }}>-</span>;
                }

                return (
                    <div className="flex gap-2 flex-col">
                        <Button
                            type="primary"
                            size="small"
                            icon={<CheckOutlined />}
                            onClick={() => handleApprove(record._id)}
                            loading={actionLoading[record._id]}
                        >
                            Approve
                        </Button>
                        <Button
                            danger
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={() => handleReject(record._id)}
                            loading={actionLoading[record._id]}
                        >
                            Reject
                        </Button>
                    </div>
                );
            },
        }
    ];

    return (
        <Title title="Manage Leaves">
            <Spin spinning={loading}>
                <div className="space-y-6">
                    {/* Statistics Cards */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={6}>
                            <Card>
                                <Statistic
                                    title="Total Leaves"
                                    value={stats.total}
                                    prefix={<CalendarOutlined />}
                                    valueStyle={{ color: "#1890ff" }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card>
                                <Statistic
                                    title="Pending"
                                    value={stats.pending}
                                    prefix={<ClockCircleOutlined />}
                                    valueStyle={{ color: "#faad14" }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card>
                                <Statistic
                                    title="Approved"
                                    value={stats.approved}
                                    prefix={<CheckCircleOutlined />}
                                    valueStyle={{ color: "#52c41a" }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card>
                                <Statistic
                                    title="Rejected"
                                    value={stats.rejected}
                                    prefix={<CloseCircleOutlined />}
                                    valueStyle={{ color: "#ff4d4f" }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* Filters */}
                    <Card>
                        <div className="flex flex-wrap gap-4">
                            <Select
                                showSearch
                                style={{ width: 200 }}
                                value={facultyFilter}
                                onChange={setFacultyFilter}
                                placeholder="Filter by Faculty"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                <Select.Option value="ALL">All Faculty</Select.Option>
                                {faculties.map(faculty => (
                                    <Select.Option key={faculty._id} value={faculty._id}>
                                        {faculty.username}
                                    </Select.Option>
                                ))}
                            </Select>

                            <Select
                                style={{ width: 150 }}
                                value={statusFilter}
                                onChange={setStatusFilter}
                                placeholder="Filter by Status"
                            >
                                <Select.Option value="ALL">All Status</Select.Option>
                                <Select.Option value="PENDING">Pending</Select.Option>
                                <Select.Option value="APPROVED">Approved</Select.Option>
                                <Select.Option value="REJECTED">Rejected</Select.Option>
                            </Select>

                            <Select
                                style={{ width: 150 }}
                                value={typeFilter}
                                onChange={setTypeFilter}
                                placeholder="Filter by Type"
                            >
                                <Select.Option value="ALL">All Types</Select.Option>
                                <Select.Option value="CASUAL">Casual</Select.Option>
                                <Select.Option value="SICK">Sick</Select.Option>
                                <Select.Option value="PERMISSION">Permission</Select.Option>
                            </Select>
                        </div>
                    </Card>

                    {/* Leaves Table */}
                    <Card title="Leave Applications">
                        <Table
                            columns={columns}
                            dataSource={leaves}
                            rowKey="_id"
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showTotal: (total) => `Total ${total} leave applications`,
                            }}
                        />
                    </Card>
                </div>
            </Spin>
        </Title>
    );
}

export default AdminLeaves;
