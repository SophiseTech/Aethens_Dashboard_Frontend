import { useState, useEffect } from "react";
import { Row, Col, Card, Statistic, Button, Table, Tag, Select, message, Spin } from "antd";
import {
    CalendarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    PlusOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import Title from "@components/layouts/Title";
import ApplyLeaveModal from "./Components/ApplyLeaveModal";
import leaveService from "@services/LeaveService";

function MyLeaves() {
    const [leaves, setLeaves] = useState([]);
    const [filteredLeaves, setFilteredLeaves] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState("ALL");

    useEffect(() => {
        fetchLeaves();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [leaves, statusFilter, typeFilter]);

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const data = await leaveService.getLeaves();
            setLeaves(data || []);
        } catch (error) {
            message.error("Failed to load leaves");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...leaves];

        if (statusFilter !== "ALL") {
            filtered = filtered.filter(leave => leave.status === statusFilter);
        }

        if (typeFilter !== "ALL") {
            filtered = filtered.filter(leave => leave.leaveType === typeFilter);
        }

        setFilteredLeaves(filtered);
    };

    const handleModalClose = () => {
        setModalVisible(false);
    };

    const handleLeaveSuccess = () => {
        fetchLeaves();
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
            filters: [
                { text: "Casual Leave", value: "CASUAL" },
                { text: "Sick Leave", value: "SICK" },
                { text: "Permission", value: "PERMISSION" }
            ],
            onFilter: (value, record) => record.leaveType === value,
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
        }
    ];

    return (
        <Title title="My Leaves">
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

                    {/* Filters and Apply Button */}
                    <Card>
                        <div className="flex flex-wrap gap-4 items-center justify-between">
                            <div className="flex flex-wrap gap-4">
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

                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setModalVisible(true)}
                            >
                                Apply Leave
                            </Button>
                        </div>
                    </Card>

                    {/* Leaves Table */}
                    <Card title="Leave History">
                        <Table
                            columns={columns}
                            dataSource={filteredLeaves}
                            rowKey="_id"
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showTotal: (total) => `Total ${total} leaves`,
                            }}
                        />
                    </Card>
                </div>
            </Spin>

            {/* Apply Leave Modal */}
            <ApplyLeaveModal
                visible={modalVisible}
                onClose={handleModalClose}
                onSuccess={handleLeaveSuccess}
            />
        </Title>
    );
}

export default MyLeaves;
