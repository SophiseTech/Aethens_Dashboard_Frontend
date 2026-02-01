import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Typography, Empty, Spin, Tooltip } from 'antd';
import { DollarOutlined, RightOutlined, WarningOutlined } from '@ant-design/icons';
import { FeeService } from '@services/Fee';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Text } = Typography;

function FeeReport({ dateRange }) {
    const [unpaidList, setUnpaidList] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchUnpaidReport = async () => {
        try {
            setLoading(true);
            const filters = {};

            if (dateRange?.firstDay && dateRange?.lastDay) {
                filters.query = {
                    dateRange: {
                        $gte: dateRange.firstDay,
                        $lte: dateRange.lastDay
                    }
                };
            }

            const response = await FeeService.getUnpaidReport(filters);
            setUnpaidList(response?.data?.unpaidList || []);
        } catch (error) {
            console.error("Error fetching unpaid report:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnpaidReport();
    }, [dateRange]);

    const handleItemClick = (item) => {
        if (item.studentId) {
            navigate(`/manager/wallets/s/${item.studentId}`);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount || 0);
    };

    const getTypeTag = (type) => {
        const colors = {
            single: 'blue',
            partial: 'orange',
            installment: 'purple'
        };
        return <Tag color={colors[type] || 'default'}>{type}</Tag>;
    };

    return (
        <Card
            className='border border-border w-full'
            title={
                <div className="flex items-center gap-2">
                    <DollarOutlined />
                    <span>Fee Report - Unpaid</span>
                    {unpaidList.length > 0 && (
                        <Tag color="red">{unpaidList.length}</Tag>
                    )}
                </div>
            }
        >
            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <Spin size="large" />
                </div>
            ) : unpaidList.length === 0 ? (
                <Empty
                    description="No unpaid fees in this period"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            ) : (
                <div className="max-h-[400px] overflow-y-auto">
                    <List
                        dataSource={unpaidList}
                        renderItem={(item) => (
                            <List.Item
                                key={`${item._id}-${item.dueMonth || 'balance'}`}
                                className="hover:bg-gray-50 transition-colors rounded-lg px-2 cursor-pointer"
                                onClick={() => handleItemClick(item)}
                                actions={[
                                    <Tooltip key="view" title="View Wallet">
                                        <RightOutlined className="text-gray-400" />
                                    </Tooltip>
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                            <WarningOutlined className="text-red-500" />
                                        </div>
                                    }
                                    title={
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Text strong>{item.studentName}</Text>
                                            {getTypeTag(item.type)}
                                        </div>
                                    }
                                    description={
                                        <div className="flex items-center justify-between">
                                            <Text type="secondary" className="text-xs">
                                                {item.dueMonth
                                                    ? `Due: ${dayjs(item.dueMonth).format('MMM YYYY')}`
                                                    : `Balance of ${formatCurrency(item.totalFee)}`
                                                }
                                            </Text>
                                            <Text strong className="text-red-500">
                                                {formatCurrency(item.unpaidAmount)}
                                            </Text>
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </div>
            )}
        </Card>
    );
}

export default FeeReport;
