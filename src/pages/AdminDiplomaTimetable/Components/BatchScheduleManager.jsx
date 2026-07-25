import { useEffect, useState } from 'react';
import { Select, Table, Space, Tag, Empty } from 'antd';
import dayjs from 'dayjs';
import batchScheduleStore from '@stores/BatchScheduleStore';
import useDiplomaBatches from '@hooks/useDiplomaBatches';
import { weekDays } from '@utils/constants';
import AddScheduleRowModal from './AddScheduleRowModal';
import EditScheduleRowModal from './EditScheduleRowModal';
import GenerateSlotsModal from './GenerateSlotsModal';

function BatchScheduleManager() {
    const [selectedBatchId, setSelectedBatchId] = useState(null);
    const [editVisible, setEditVisible] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const { batchOptions, loading: loadingBatches } = useDiplomaBatches({ enabled: true });
    const { batchSchedules, loading, getByBatch } = batchScheduleStore();

    useEffect(() => {
        if (selectedBatchId) getByBatch(selectedBatchId);
    }, [selectedBatchId, getByBatch]);

    const handleRowClick = (record) => {
        setSelectedRow(record);
        setEditVisible(true);
    };

    const columns = [
        {
            title: 'Course',
            key: 'course',
            render: (_, record) => (
                <p className="cursor-pointer text-blue-600 hover:underline" onClick={() => handleRowClick(record)}>
                    {record.diplomaIntake_id?.courseId?.name || 'N/A'}
                </p>
            ),
        },
        {
            title: 'Intake',
            key: 'intake',
            render: (_, record) => record.diplomaIntake_id?.name || 'N/A',
        },
        {
            title: 'Subject',
            key: 'subject',
            render: (_, record) =>
                record.diplomaIntake_id?.courseId?.subjects?.find((s) => s._id === record.subject_id)?.name || 'N/A',
        },
        {
            title: 'Week Day',
            dataIndex: 'weekDay',
            key: 'weekDay',
            render: (weekDay) => <Tag>{weekDays[weekDay]}</Tag>,
        },
        {
            title: 'Time',
            key: 'time',
            render: (_, record) => record.start_time && record.end_time
                ? `${dayjs(record.start_time).format('h:mm A')} - ${dayjs(record.end_time).format('h:mm A')}`
                : 'N/A',
        },
        {
            title: 'Faculty',
            key: 'faculty',
            render: (_, record) => record.faculty_id?.username || record.faculty_id?.email || 'N/A',
        },
        {
            title: 'Center',
            key: 'center',
            render: (_, record) => record.center_id?.center_name || 'N/A',
        },
    ];

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Select
                placeholder="Select a diploma batch to manage its timetable"
                style={{ width: 360 }}
                loading={loadingBatches}
                options={batchOptions}
                value={selectedBatchId}
                onChange={setSelectedBatchId}
                showSearch
                optionFilterProp="label"
            />

            {selectedBatchId && (
                <>
                    <Space wrap>
                        <AddScheduleRowModal batchId={selectedBatchId} />
                        <GenerateSlotsModal schedules={batchSchedules} />
                    </Space>

                    {batchSchedules.length === 0 && !loading ? (
                        <Empty description="No timetable rows yet for this batch." />
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={batchSchedules}
                            loading={loading}
                            rowKey="_id"
                            pagination={false}
                        />
                    )}

                    <EditScheduleRowModal
                        schedule={selectedRow}
                        batchId={selectedBatchId}
                        visible={editVisible}
                        onCancel={() => setEditVisible(false)}
                        onSave={() => setEditVisible(false)}
                    />
                </>
            )}
        </Space>
    );
}

export default BatchScheduleManager;
