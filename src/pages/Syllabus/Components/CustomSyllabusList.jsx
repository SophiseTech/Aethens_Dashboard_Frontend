import userStore from '@stores/UserStore';
import { ROLES } from '@utils/constants';
import { Image, Table, Tag, Select, Input, Space } from 'antd';
import React from 'react';
import { useStore } from 'zustand';

const { Search } = Input;

function CustomSyllabusList({ images, loading, statusFilter, setStatusFilter, searchText, setSearchText }) {
    const { user } = useStore(userStore);

    // Define table columns
    const columns = [
        {
            title: 'Image',
            dataIndex: 'url',
            key: 'url',
            width: 100,
            render: (url, record) => (
                <Image
                    src={url}
                    alt={record.name}
                    width={80}
                    height={80}
                    className="object-cover rounded"
                />
            ),
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
    ];

    // Add Sessions and Status columns only for students
    if (user.role === ROLES.STUDENT) {
        columns.push(
            {
                title: 'Sessions',
                dataIndex: 'sessionCount',
                key: 'sessionCount',
                render: (sessionCount, record) => {
                    const totalSessions = record.sessionsRequired || 10;
                    return (
                        <span className="text-sm">
                            <span className="font-semibold">{sessionCount}</span>
                            <span className="text-gray-500">/{totalSessions}</span>
                        </span>
                    );
                },
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (_, record) => {
                    const { completed, sessionCount } = record;

                    if (completed) {
                        return <Tag color="success">Completed</Tag>;
                    } else if (sessionCount >= 1) {
                        return <Tag color="processing">Ongoing</Tag>;
                    } else {
                        return <Tag color="default">Not Started</Tag>;
                    }
                },
            }
        );
    }

    // Transform images into table data - NO MORE FILTERING
    const tableData = (images || []).map((image, index) => ({
        key: image._id || index,
        ...image,
    }));

    return (
        <div>
            {/* Filters - Only show for students */}
            {user.role === ROLES.STUDENT && (
                <Space className="mb-4" wrap>
                    <Select
                        style={{ width: 160 }}
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={[
                            { label: 'All Status', value: 'all' },
                            { label: 'Completed', value: 'completed' },
                            { label: 'Ongoing', value: 'ongoing' },
                            { label: 'Not Started', value: 'notStarted' },
                        ]}
                    />
                    <Search
                        placeholder="Search by image name"
                        allowClear
                        style={{ width: 250 }}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onSearch={setSearchText}
                    />
                </Space>
            )}

            {/* Table */}
            <Table
                columns={columns}
                dataSource={tableData}
                pagination={false}
                className="flex-1"
                loading={loading}
            />
        </div>
    );
}

export default CustomSyllabusList;
