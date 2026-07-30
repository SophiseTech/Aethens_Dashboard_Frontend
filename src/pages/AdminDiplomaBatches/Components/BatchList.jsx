import { useState, useEffect } from 'react';
import { Table, Space, Tag } from 'antd';
import dayjs from 'dayjs';
import diplomaBatchStore from '@stores/DiplomaBatchStore';
import EditBatchModal from './EditBatchModal';

const STATUS_COLOR = {
    upcoming: 'blue',
    active: 'green',
    full: 'orange',
    inactive: 'default',
};

function BatchList() {
    const { batches, loading, total, getBatchesForAdmin } = diplomaBatchStore();

    const [editVisible, setEditVisible] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        getBatchesForAdmin(pageSize, 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRowClick = (record) => {
        setSelectedBatch(record);
        setEditVisible(true);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        getBatchesForAdmin(pageSize, page);
    };

    const columns = [
        {
            title: 'Batch Name',
            dataIndex: 'name',
            key: 'name',
            render: (name, record) => (
                <p className="cursor-pointer text-blue-600 hover:underline" onClick={() => handleRowClick(record)}>
                    {name}
                </p>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <Tag color={STATUS_COLOR[status] || 'default'}>{status}</Tag>,
        },
        {
            title: 'Capacity',
            dataIndex: 'capacity',
            key: 'capacity',
        },
        {
            title: 'Class Time',
            key: 'time',
            render: (_, record) => record.start_time && record.end_time
                ? `${dayjs(record.start_time).format('h:mm A')} - ${dayjs(record.end_time).format('h:mm A')}`
                : 'N/A',
        },
        {
            title: 'Week Days',
            dataIndex: 'weekDays',
            key: 'weekDays',
            render: (weekDays) => weekDays?.join(', ') || 'N/A',
        },
    ];

    return (
        <>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                    <p>Total Diploma Batches: <span className="font-bold">{total}</span></p>
                </div>

                <Table
                    columns={columns}
                    dataSource={batches}
                    loading={loading}
                    pagination={{
                        current: currentPage,
                        pageSize,
                        total,
                        onChange: handlePageChange,
                        showSizeChanger: false,
                    }}
                    rowKey="_id"
                />
            </Space>

            <EditBatchModal
                batch={selectedBatch}
                visible={editVisible}
                onCancel={() => setEditVisible(false)}
                onSave={() => {
                    setEditVisible(false);
                    getBatchesForAdmin(pageSize, currentPage);
                }}
            />
        </>
    );
}

export default BatchList;
