import { useState, useEffect } from 'react';
import { Table, Space } from 'antd';
import diplomaCourseStore from '@stores/DiplomaCourseStore';
import EditDiplomaCourseModal from './EditDiplomaCourseModal';

function DiplomaCourseList() {
    const { courses, loading, total, getCoursesForAdmin } = diplomaCourseStore();

    const [editVisible, setEditVisible] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        getCoursesForAdmin(pageSize, 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRowClick = (record) => {
        setSelectedCourse(record);
        setEditVisible(true);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        getCoursesForAdmin(pageSize, page);
    };

    const columns = [
        {
            title: 'Diploma Name',
            dataIndex: 'name',
            key: 'name',
            render: (name, record) => (
                <p className="cursor-pointer text-blue-600 hover:underline" onClick={() => handleRowClick(record)}>
                    {name}
                </p>
            ),
        },
        {
            title: 'Duration',
            key: 'duration',
            render: (_, record) => record.duration
                ? `${record.duration.count} ${record.duration.type}${record.duration.count > 1 ? 's' : ''}`
                : 'N/A',
        },
        {
            title: 'Terms',
            dataIndex: 'numberOfTerms',
            key: 'numberOfTerms',
        },
        {
            title: 'Subjects',
            key: 'subjects',
            render: (_, record) => record.subjects?.length || 0,
        },
    ];

    return (
        <>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                    <p>Total Diploma Courses: <span className="font-bold">{total}</span></p>
                </div>

                <Table
                    columns={columns}
                    dataSource={courses}
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

            <EditDiplomaCourseModal
                course={selectedCourse}
                visible={editVisible}
                onCancel={() => setEditVisible(false)}
                onSave={() => {
                    setEditVisible(false);
                    getCoursesForAdmin(pageSize, currentPage);
                }}
            />
        </>
    );
}

export default DiplomaCourseList;
