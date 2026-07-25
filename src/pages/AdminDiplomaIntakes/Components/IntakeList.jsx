import { useState, useEffect } from 'react';
import { Table, Space } from 'antd';
import dayjs from 'dayjs';
import diplomaIntakeStore from '@stores/DiplomaIntakeStore';
import EditIntakeModal from './EditIntakeModal';

function IntakeList() {
    const { intakes, loading, total, getIntakesForAdmin } = diplomaIntakeStore();

    const [editVisible, setEditVisible] = useState(false);
    const [selectedIntake, setSelectedIntake] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        getIntakesForAdmin(pageSize, 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRowClick = (record) => {
        setSelectedIntake(record);
        setEditVisible(true);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        getIntakesForAdmin(pageSize, page);
    };

    const columns = [
        {
            title: 'Intake Name',
            dataIndex: 'name',
            key: 'name',
            render: (name, record) => (
                <p className="cursor-pointer text-blue-600 hover:underline" onClick={() => handleRowClick(record)}>
                    {name}
                </p>
            ),
        },
        {
            title: 'Diploma Course',
            key: 'course',
            render: (_, record) => record.courseId?.name || 'N/A',
        },
        {
            title: 'Start Date',
            dataIndex: 'startDate',
            key: 'startDate',
            render: (date) => date ? dayjs(date).format('DD MMM, YYYY') : 'N/A',
        },
        {
            title: 'End Date',
            dataIndex: 'endDate',
            key: 'endDate',
            render: (date) => date ? dayjs(date).format('DD MMM, YYYY') : 'N/A',
        },
    ];

    return (
        <>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                    <p>Total Diploma Intakes: <span className="font-bold">{total}</span></p>
                </div>

                <Table
                    columns={columns}
                    dataSource={intakes}
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

            <EditIntakeModal
                intake={selectedIntake}
                visible={editVisible}
                onCancel={() => setEditVisible(false)}
                onSave={() => {
                    setEditVisible(false);
                    getIntakesForAdmin(pageSize, currentPage);
                }}
            />
        </>
    );
}

export default IntakeList;
