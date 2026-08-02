import { useEffect, useMemo, useState } from 'react';
import { Select, Table, Space, Tag, Empty, Switch, Button, Popconfirm, message } from 'antd';
import { RightCircleOutlined } from '@ant-design/icons';
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
    const [selectedTerm, setSelectedTerm] = useState(null);
    const [includeInactive, setIncludeInactive] = useState(false);
    const [advancing, setAdvancing] = useState(false);

    const { batchOptions, loading: loadingBatches } = useDiplomaBatches({ enabled: true });
    const { batchSchedules, loading, getByBatch, advanceTerm } = batchScheduleStore();

    useEffect(() => {
        if (selectedBatchId) getByBatch(selectedBatchId, { includeInactive });
    }, [selectedBatchId, includeInactive, getByBatch]);

    useEffect(() => {
        setSelectedTerm(null);
    }, [selectedBatchId]);

    const termOptions = useMemo(() => (
        [...new Set(batchSchedules.map((r) => r.term))]
            .filter((t) => t !== undefined && t !== null)
            .sort((a, b) => a - b)
            .map((t) => ({ label: `Term ${t}`, value: t }))
    ), [batchSchedules]);

    const filteredSchedules = useMemo(() => (
        selectedTerm ? batchSchedules.filter((r) => r.term === selectedTerm) : batchSchedules
    ), [batchSchedules, selectedTerm]);

    const canAdvanceTerm = selectedTerm && filteredSchedules.some((r) => r.isActive);

    const handleRowClick = (record) => {
        setSelectedRow(record);
        setEditVisible(true);
    };

    const handleAdvanceTerm = async () => {
        try {
            setAdvancing(true);
            const result = await advanceTerm({ diplomaBatch_id: selectedBatchId, term: selectedTerm });
            if (result?.nextTermConfigured) {
                message.success(`Term ${selectedTerm} deactivated — generated ${result.generatedSlots} slot(s) for Term ${selectedTerm + 1}`);
            } else {
                message.success(`Term ${selectedTerm} deactivated — Term ${selectedTerm + 1} not configured yet`);
            }
            setSelectedTerm(selectedTerm + 1);
        } catch (error) {
            // handled by store
        } finally {
            setAdvancing(false);
        }
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
            title: 'Term',
            dataIndex: 'term',
            key: 'term',
            render: (term) => term ? `Term ${term}` : 'N/A',
        },
        {
            title: 'Subject',
            key: 'subject',
            render: (_, record) =>
                record.diplomaIntake_id?.courseId?.terms
                    ?.find((t) => t.termNumber === record.term)
                    ?.subjects?.find((s) => s._id === record.subject_id)?.name || 'N/A',
        },
        {
            title: 'Active',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive) => <Tag color={isActive ? 'green' : 'default'}>{isActive ? 'Active' : 'Inactive'}</Tag>,
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
                        <GenerateSlotsModal schedules={filteredSchedules} />
                        <Select
                            placeholder="All Terms"
                            allowClear
                            style={{ width: 140 }}
                            options={termOptions}
                            value={selectedTerm}
                            onChange={setSelectedTerm}
                        />
                        <Space size="small">
                            <Switch checked={includeInactive} onChange={setIncludeInactive} />
                            <span>Show Inactive/Past Terms</span>
                        </Space>
                        {canAdvanceTerm && (
                            <Popconfirm
                                title="Advance to next term"
                                description={`This deactivates all active Term ${selectedTerm} rows for this batch.`}
                                onConfirm={handleAdvanceTerm}
                            >
                                <Button icon={<RightCircleOutlined />} loading={advancing}>
                                    Advance to Next Term
                                </Button>
                            </Popconfirm>
                        )}
                    </Space>

                    {filteredSchedules.length === 0 && !loading ? (
                        <Empty description="No timetable rows yet for this batch." />
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={filteredSchedules}
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
