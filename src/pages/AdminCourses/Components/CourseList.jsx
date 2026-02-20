import { useState, useEffect } from 'react';
import { Table, Input, Button, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import courseStore from '@stores/CourseStore';
import CourseDetailsDrawer from './CourseDetailsDrawer';

const { Search } = Input;

function CourseList() {
    const {
        courses,
        loading,
        total,
        searchQuery,
        searchResults,
        searchTotal,
        getCoursesForAdmin,
        searchCourses,
        clearSearch,
        resetPagination,
    } = courseStore();

    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Fetch courses for a specific page using admin pagination method
    const fetchCoursesForPage = (page) => {
        getCoursesForAdmin(pageSize, page, { populate: "defaultMaterialItems" });
    };

    useEffect(() => {
        fetchCoursesForPage(1);
    }, []);

    const handleSearch = (value) => {
        if (value.trim()) {
            searchCourses(value.trim(), pageSize, 1);
            setCurrentPage(1);
        } else {
            clearSearch();
            fetchCoursesForPage(1);
            setCurrentPage(1);
        }
    };

    const handleRowClick = (record) => {
        setSelectedCourse(record);
        setDrawerVisible(true);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        if (searchQuery) {
            searchCourses(searchQuery, pageSize, page);
        } else {
            fetchCoursesForPage(page);
        }
    };

    const displayCourses = searchQuery ? searchResults : courses;
    const displayTotal = searchQuery ? searchTotal : total;

    const columns = [
        {
            title: 'Course Name',
            dataIndex: 'course_name',
            key: 'course_name',
            render: (name, record) => (
                <p
                    className="cursor-pointer text-blue-600 hover:underline"
                    onClick={() => handleRowClick(record)}
                >
                    {name}
                </p>
            ),
        },
        {
            title: 'Duration',
            key: 'duration',
            render: (_, record) => {
                if (record.duration) {
                    return `${record.duration.count} ${record.duration.type}${record.duration.count > 1 ? 's' : ''}`;
                }
                return 'N/A';
            },
        },
        {
            title: 'Rate',
            dataIndex: 'rate',
            key: 'rate',
            render: (rate) => (rate ? `₹${rate}` : 'N/A'),
        },
        {
            title: 'Total Sessions',
            dataIndex: 'total_session',
            key: 'total_session',
            render: (sessions) => sessions || 'N/A',
        },
        {
            title: 'Syllabus Type',
            dataIndex: 'syllabusType',
            key: 'syllabusType',
            render: (type) => (
                <span className="capitalize">{type || 'general'}</span>
            ),
        },
    ];

    return (
        <>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Search
                    placeholder="Search by course name"
                    allowClear
                    enterButton={<SearchOutlined />}
                    size="large"
                    onSearch={handleSearch}
                    style={{ maxWidth: 400 }}
                />

                <div>
                    <p>
                        Total Courses: <span className="font-bold">{displayTotal}</span>
                    </p>
                </div>

                <Table
                    columns={columns}
                    dataSource={displayCourses}
                    loading={loading}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: displayTotal,
                        onChange: handlePageChange,
                        showSizeChanger: false,
                    }}
                    rowKey="_id"
                />
            </Space>

            <CourseDetailsDrawer
                course={selectedCourse}
                visible={drawerVisible}
                onClose={() => setDrawerVisible(false)}
                onRefresh={() => {
                    if (searchQuery) {
                        searchCourses(searchQuery, pageSize, currentPage);
                    } else {
                        fetchCoursesForPage(currentPage);
                    }
                }}
            />
        </>
    );
}

export default CourseList;
