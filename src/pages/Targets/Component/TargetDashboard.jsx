import { useEffect } from "react";
import { Card, Row, Col, Typography, Spin } from "antd";
import { AimOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, WarningOutlined } from "@ant-design/icons";
import EChart from "@pages/Dashboard/Chart/EChart";
import useTargetStore from "@stores/TargetStore";
import userStore from "@stores/UserStore";
import centersStore from "@stores/CentersStore";

const { Title, Text } = Typography;

export default function TargetDashboard() {
    const analytics = useTargetStore(state => state.analytics);
    const analyticsLoading = useTargetStore(state => state.analyticsLoading);
    const getAnalytics = useTargetStore(state => state.getAnalytics);
    const { user } = userStore();
    const { selectedCenter, centers } = centersStore();

    // Get selected center name for display
    const selectedCenterName = selectedCenter && selectedCenter !== 'all'
        ? centers.find(c => c._id === selectedCenter)?.center_name
        : null;

    useEffect(() => {
        // Fetch analytics with center filter
        const params = {};
        if (selectedCenter && selectedCenter !== 'all') {
            params.center = selectedCenter;
        }
        getAnalytics(params);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCenter]);


    if (analyticsLoading && !analytics) {
        return (
            <div className="flex justify-center items-center mt-10">
                <Spin tip="Loading analytics..." size="large" />
            </div>
        );
    }


    if (!analytics) {
        return (
            <div className="p-6">
                <Card className="rounded-xl shadow-sm">
                    <Text type="secondary">No Targets Set Yet</Text>
                </Card>
            </div>
        );
    }

    const { overview, statusBreakdown, centerStats } = analytics;

    // Status breakdown pie chart
    const statusLabels = Object.keys(statusBreakdown || {});
    const statusValues = Object.values(statusBreakdown || {});

    const statusPie = {
        series: statusValues,
        options: {
            chart: { type: "donut" },
            labels: statusLabels.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
            legend: { position: "bottom" },
            stroke: { width: 0 },
            colors: ["#52c41a", "#1890ff", "#faad14", "#f5222d"],
            dataLabels: { enabled: true },
        },
    };

    // Determine view label based on role and selected center
    const getViewLabel = () => {
        if (user.role !== 'admin') {
            return 'Center View';
        }
        if (selectedCenterName) {
            return `${selectedCenterName} View`;
        }
        return 'System-wide View';
    };

    return (
        <div className="p-4 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Title level={3} className="!mb-0">
                    Target Analytics Dashboard
                </Title>
                <Text type="secondary">
                    {getViewLabel()}
                </Text>
            </div>

            {/* KPI Cards - Full Width Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <Card className="rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                            <AimOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                        </div>
                        <div>
                            <Text className="text-gray-500 text-xs whitespace-nowrap">Total</Text>
                            <Title level={3} className="!mb-0 !mt-0">{overview.total}</Title>
                        </div>
                    </div>
                </Card>

                <Card className="rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                            <ClockCircleOutlined style={{ fontSize: 20, color: '#52c41a' }} />
                        </div>
                        <div>
                            <Text className="text-gray-500 text-xs whitespace-nowrap">Active</Text>
                            <Title level={3} className="!mb-0 !mt-0">{overview.active}</Title>
                        </div>
                    </div>
                </Card>

                <Card className="rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                            <CheckCircleOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                        </div>
                        <div>
                            <Text className="text-gray-500 text-xs whitespace-nowrap">Completed</Text>
                            <Title level={3} className="!mb-0 !mt-0">{overview.completed}</Title>
                        </div>
                    </div>
                </Card>

                <Card className="rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center">
                            <WarningOutlined style={{ fontSize: 20, color: '#faad14' }} />
                        </div>
                        <div>
                            <Text className="text-gray-500 text-xs whitespace-nowrap">Pending</Text>
                            <Title level={3} className="!mb-0 !mt-0">{overview.pending}</Title>
                        </div>
                    </div>
                </Card>

                <Card className="rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                            <CloseCircleOutlined style={{ fontSize: 20, color: '#f5222d' }} />
                        </div>
                        <div>
                            <Text className="text-gray-500 text-xs whitespace-nowrap">Overdue</Text>
                            <Title level={3} className="!mb-0 !mt-0">{overview.overdue}</Title>
                        </div>
                    </div>
                </Card>
            </div>



            {/* Charts Row */}
            <Row gutter={[16, 16]}>
                {/* Status Breakdown Chart */}
                <Col xs={24} md={12} xl={8}>
                    <Card className="rounded-xl shadow-sm">
                        <Title level={4}>Status Breakdown</Title>
                        {statusValues.length > 0 ? (
                            <EChart
                                series={[...statusPie.series]}
                                options={statusPie.options}
                                className="w-full"
                            />
                        ) : (
                            <Text type="secondary">No data available</Text>
                        )}
                    </Card>
                </Col>

                {/* Completion Rate */}
                <Col xs={24} md={12} xl={8}>
                    <Card className="rounded-xl shadow-sm">
                        <Title level={4}>Completion Rate</Title>
                        <div className="flex flex-col items-center justify-center h-64">
                            <div className="text-center">
                                <Title level={1} className="!mb-2" style={{ color: '#1890ff' }}>
                                    {overview.total > 0
                                        ? Math.round((overview.completed / overview.total) * 100)
                                        : 0}%
                                </Title>
                                <Text type="secondary">
                                    {overview.completed} of {overview.total} targets completed
                                </Text>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* Active vs Overdue */}
                <Col xs={24} md={12} xl={8}>
                    <Card className="rounded-xl shadow-sm">
                        <Title level={4}>Active Targets Health</Title>
                        <div className="flex flex-col gap-4 mt-4">
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                                <Text strong>On Track</Text>
                                <Title level={3} className="!mb-0" style={{ color: '#52c41a' }}>
                                    {overview.active - overview.overdue}
                                </Title>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                                <Text strong>Overdue</Text>
                                <Title level={3} className="!mb-0" style={{ color: '#f5222d' }}>
                                    {overview.overdue}
                                </Title>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                                <Text strong>Pending Start</Text>
                                <Title level={3} className="!mb-0" style={{ color: '#faad14' }}>
                                    {overview.pending}
                                </Title>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Center Performance (Admin Only) */}
            {user.role === 'admin' && centerStats && centerStats.length > 0 && (
                <Card className="rounded-xl shadow-sm">
                    <Title level={4}>Center Performance</Title>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                        {centerStats.map((center) => (
                            <Card
                                key={center._id}
                                size="small"
                                className="shadow-sm rounded-lg border"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Text strong className="text-lg">{center._id}</Text>
                                        <div className="mt-2 space-y-1">
                                            <div className="flex justify-between">
                                                <Text className="text-gray-500">Total:</Text>
                                                <Text strong>{center.total}</Text>
                                            </div>
                                            <div className="flex justify-between">
                                                <Text className="text-gray-500">Active:</Text>
                                                <Text strong style={{ color: '#52c41a' }}>{center.active}</Text>
                                            </div>
                                            <div className="flex justify-between">
                                                <Text className="text-gray-500">Completed:</Text>
                                                <Text strong style={{ color: '#1890ff' }}>{center.completed}</Text>
                                            </div>
                                            <div className="flex justify-between">
                                                <Text className="text-gray-500">Overdue:</Text>
                                                <Text strong style={{ color: '#f5222d' }}>{center.overdue}</Text>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}
