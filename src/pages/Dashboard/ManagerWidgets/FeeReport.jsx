import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Typography, Empty, Spin, Tooltip, message } from 'antd';
import { DollarOutlined, RightOutlined, WarningOutlined } from '@ant-design/icons';
import { FeeService } from '@services/Fee';
import studentService from '@services/Student';
import walletService from '@services/WalletService';
import FeeTracker from '@pages/Students/Component/FeeTracker';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import logger from '@utils/logger';

const { Text } = Typography;

function FeeReport({ dateRange }) {
    const [unpaidList, setUnpaidList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
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

    const handleItemClick = async (item) => {
        if (!item.studentId) return;
        console.log(item);

        let hideLoading = null;
        try {
            hideLoading = message.loading('Loading student fee tracker...', 0);
            setModalLoading(true);
            const studentData = await studentService.getUserById(item.studentId);
            if (studentData) {
                try {
                    const walletData = await walletService.getWalletByStudentId(studentData._id);
                    studentData.wallet = walletData;
                } catch (walletError) {
                    console.error("Error fetching student wallet details:", walletError);
                }
                setSelectedStudent(studentData);
                setModalVisible(true);
            } else {
                message.error('Student details not found');
            }
            logger.debug("Student Data after fetching for fee report: ", studentData)
        } catch (error) {
            console.error("Error fetching student details:", error);
            message.error('Failed to load student fee tracker');
        } finally {
            if (hideLoading) hideLoading();
            setModalLoading(false);
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
            className='w-full border border-border'
            title={
                <div className="flex gap-2 items-center">
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
                                className="px-2 rounded-lg transition-colors cursor-pointer hover:bg-gray-50"
                                onClick={() => handleItemClick(item)}
                                actions={[
                                    <Tooltip key="view" title="View Wallet">
                                        <RightOutlined className="text-gray-400" />
                                    </Tooltip>
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <div className="flex justify-center items-center w-10 h-10 bg-red-100 rounded-full">
                                            <WarningOutlined className="text-red-500" />
                                        </div>
                                    }
                                    title={
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <Text strong>{item.studentName}</Text>
                                            {getTypeTag(item.type)}
                                        </div>
                                    }
                                    description={
                                        <div className="flex justify-between items-center">
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
            {modalVisible && selectedStudent && (
                <FeeTracker
                    student={selectedStudent}
                    visible={modalVisible}
                    onCancel={() => {
                        setModalVisible(false);
                        setSelectedStudent(null);
                    }}
                />
            )}
        </Card>
    );
}

export default FeeReport;
