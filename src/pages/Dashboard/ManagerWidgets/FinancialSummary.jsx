import React from 'react';
import { Card, Row, Col, Statistic, Divider, Tag, Tooltip, Progress } from 'antd';
import {
    ArrowUpOutlined,
    BookOutlined,
    ToolOutlined,
    InfoCircleOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import billStore from '@stores/BillStore';
import userStore from '@stores/UserStore';
import { useStore } from 'zustand';
import { useNavigate } from 'react-router-dom';

const fmt = (val) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(val || 0);

// Theme colors
const PRIMARY = '#4F651E';
const SECONDARY = '#C6A936';
const DANGER = '#c0392b';

function FinancialSummary() {
    const { summary } = useStore(billStore);
    const { summary: userSummary } = useStore(userStore);
    const navigate = useNavigate();

    const totalStudents = userSummary?.totalStudents || 0;
    const totalResult = summary?.totalResult || {};
    const totalSplit = summary?.totalSplit || {};
    const lifetimeDue = summary?.lifetimeDue || {};

    const collectionRate = totalResult.totalIncome
        ? Math.round((totalResult.totalPaid / totalResult.totalIncome) * 100)
        : 0;

    const rateColor =
        collectionRate >= 80 ? PRIMARY : collectionRate >= 50 ? SECONDARY : DANGER;

    return (
        <Card
            className="border border-border w-full"
            title={
                <div className="flex items-center gap-2">
                    <ArrowUpOutlined style={{ color: PRIMARY }} />
                    <span>Financial Summary</span>
                </div>
            }
        >
            {/* ──── Top Stats Row ──── */}
            <Row gutter={[16, 16]}>
                {/* Enrolled Students */}
                <Col xs={12} sm={8} lg={6}>
                    <Tooltip title="View all students">
                        <Card
                            size="small"
                            className="border border-border text-center bg-card cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => navigate('/manager/students')}
                        >
                            <div className="flex flex-col items-center gap-1">
                                <TeamOutlined style={{ color: PRIMARY, fontSize: 22 }} />
                                <div className="text-2xl font-bold" style={{ color: PRIMARY }}>
                                    {totalStudents.toLocaleString('en-IN')}
                                </div>
                                <div className="text-xs text-gray-500">Enrolled Students ↗</div>
                            </div>
                        </Card>
                    </Tooltip>
                </Col>

                {/* Total Billed */}
                <Col xs={12} sm={8} lg={6}>
                    <Card size="small" className="border border-border text-center bg-card">
                        <Statistic
                            title={<span className="text-xs text-gray-500">Total Billed</span>}
                            value={totalResult.totalIncome}
                            precision={0}
                            prefix="₹"
                            valueStyle={{ color: PRIMARY, fontSize: 18 }}
                            formatter={(v) => Number(v).toLocaleString('en-IN')}
                        />
                    </Card>
                </Col>

                {/* Collected */}
                <Col xs={12} sm={8} lg={6}>
                    <Card size="small" className="border border-border text-center bg-card">
                        <Statistic
                            title={<span className="text-xs text-gray-500">Collected</span>}
                            value={totalResult.totalPaid}
                            precision={0}
                            prefix="₹"
                            valueStyle={{ color: PRIMARY, fontSize: 18 }}
                            formatter={(v) => Number(v).toLocaleString('en-IN')}
                        />
                    </Card>
                </Col>

                {/* Pending — clickable */}
                <Col xs={12} sm={8} lg={6}>
                    <Tooltip title="View due bills">
                        <Card
                            size="small"
                            className="border border-border text-center bg-card cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => navigate('/manager/bills?status=unpaid')}
                        >
                            <Statistic
                                title={<span className="text-xs text-gray-500">Pending ↗</span>}
                                value={totalResult.totalUnpaid}
                                precision={0}
                                prefix="₹"
                                valueStyle={{ color: DANGER, fontSize: 18 }}
                                formatter={(v) => Number(v).toLocaleString('en-IN')}
                            />
                        </Card>
                    </Tooltip>
                </Col>

                {/* Collection Rate */}
                <Col xs={12} sm={8} lg={6}>
                    <Card size="small" className="border border-border text-center bg-card">
                        <div className="flex flex-col items-center justify-center gap-1">
                            <span className="text-xs text-gray-500">Collection Rate</span>
                            <Progress
                                type="circle"
                                percent={collectionRate}
                                size={60}
                                strokeColor={rateColor}
                                format={(p) => (
                                    <span style={{ fontSize: 13, fontWeight: 600, color: rateColor }}>
                                        {p}%
                                    </span>
                                )}
                            />
                        </div>
                    </Card>
                </Col>
            </Row>

            <Divider style={{ margin: '16px 0' }} />

            {/* ──── Split by Category ──── */}
            <div className="mb-4">
                <span className="text-sm font-semibold" style={{ color: PRIMARY }}>
                    Breakdown by Category
                </span>
                <Row gutter={[12, 12]} className="mt-2">
                    {/* Course Fees */}
                    <Col xs={24} sm={12}>
                        <Card size="small" className="border border-border bg-card">
                            <div className="flex items-center gap-2 mb-2">
                                <BookOutlined style={{ color: PRIMARY }} />
                                <span className="font-medium text-sm">Course Fees</span>
                            </div>
                            <Row gutter={8}>
                                <Col span={8} className="text-center">
                                    <div className="text-xs text-gray-400">Billed</div>
                                    <div className="text-sm font-semibold" style={{ color: PRIMARY }}>
                                        {fmt(totalSplit?.fees?.totalIncome)}
                                    </div>
                                </Col>
                                <Col span={8} className="text-center">
                                    <div className="text-xs text-gray-400">Collected</div>
                                    <div className="text-sm font-semibold" style={{ color: PRIMARY }}>
                                        {fmt(totalSplit?.fees?.totalPaid)}
                                    </div>
                                </Col>
                                <Col span={8} className="text-center">
                                    <div className="text-xs text-gray-400">Pending</div>
                                    <div
                                        className="text-sm font-semibold cursor-pointer hover:underline"
                                        style={{ color: DANGER }}
                                        onClick={() => navigate('/manager/bills?status=unpaid&type=course')}
                                    >
                                        {fmt(totalSplit?.fees?.totalUnpaid)}
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    {/* Materials */}
                    <Col xs={24} sm={12}>
                        <Card size="small" className="border border-border bg-card">
                            <div className="flex items-center gap-2 mb-2">
                                <ToolOutlined style={{ color: SECONDARY }} />
                                <span className="font-medium text-sm">Materials</span>
                            </div>
                            <Row gutter={8}>
                                <Col span={8} className="text-center">
                                    <div className="text-xs text-gray-400">Billed</div>
                                    <div className="text-sm font-semibold" style={{ color: PRIMARY }}>
                                        {fmt(totalSplit?.materials?.totalIncome)}
                                    </div>
                                </Col>
                                <Col span={8} className="text-center">
                                    <div className="text-xs text-gray-400">Collected</div>
                                    <div className="text-sm font-semibold" style={{ color: PRIMARY }}>
                                        {fmt(totalSplit?.materials?.totalPaid)}
                                    </div>
                                </Col>
                                <Col span={8} className="text-center">
                                    <div className="text-xs text-gray-400">Pending</div>
                                    <div
                                        className="text-sm font-semibold cursor-pointer hover:underline"
                                        style={{ color: DANGER }}
                                        onClick={() => navigate('/manager/bills?status=unpaid&type=materials')}
                                    >
                                        {fmt(totalSplit?.materials?.totalUnpaid)}
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* ──── Lifetime Due ──── */}
            {(lifetimeDue.dueFees || lifetimeDue.dueMaterials) ? (
                <>
                    <div className="mb-2 flex items-center gap-2">
                        <span className="text-sm font-semibold" style={{ color: PRIMARY }}>
                            Lifetime Outstanding
                        </span>
                        <Tooltip title="Total unpaid amounts across all time — not filtered by date range">
                            <InfoCircleOutlined className="text-gray-400 text-xs" />
                        </Tooltip>
                    </div>
                    <Row gutter={[12, 12]}>
                        <Col xs={12}>
                            <Tooltip title="View due fees">
                                <div
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card cursor-pointer hover:shadow-sm transition-shadow"
                                    onClick={() => navigate('/manager/bills?status=unpaid')}
                                >
                                    <BookOutlined style={{ color: DANGER }} />
                                    <div>
                                        <div className="text-xs text-gray-500">Fee Due (All Time)</div>
                                        <div className="font-semibold text-sm" style={{ color: DANGER }}>
                                            {fmt(lifetimeDue.dueFees)}
                                        </div>
                                    </div>
                                </div>
                            </Tooltip>
                        </Col>
                        <Col xs={12}>
                            <Tooltip title="View due material bills">
                                <div
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card cursor-pointer hover:shadow-sm transition-shadow"
                                    onClick={() => navigate('/manager/bills?status=unpaid&type=materials')}
                                >
                                    <ToolOutlined style={{ color: SECONDARY }} />
                                    <div>
                                        <div className="text-xs text-gray-500">Materials Due (All Time)</div>
                                        <div className="font-semibold text-sm" style={{ color: SECONDARY }}>
                                            {fmt(lifetimeDue.dueMaterials)}
                                        </div>
                                    </div>
                                </div>
                            </Tooltip>
                        </Col>
                    </Row>
                </>
            ) : null}
        </Card>
    );
}

export default FinancialSummary;
