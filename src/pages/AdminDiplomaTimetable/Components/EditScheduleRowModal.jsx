import { useEffect } from 'react';
import { Modal, Form, Select, TimePicker, Typography, message } from 'antd';
import { useStore } from 'zustand';
import dayjs from 'dayjs';
import batchScheduleStore from '@stores/BatchScheduleStore';
import centersStore from '@stores/CentersStore';
import facultyStore from '@stores/FacultyStore';
import { weekDays } from '@utils/constants';

const { Text } = Typography;

function EditScheduleRowModal({ schedule, batchId, visible, onCancel, onSave }) {
    const [form] = Form.useForm();
    const { update, loading } = batchScheduleStore();
    const { centers, getCenters } = useStore(centersStore);
    const { faculties, getFacultiesByCenter } = facultyStore();

    useEffect(() => {
        if (visible) {
            getCenters(0);
            getFacultiesByCenter(100);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    useEffect(() => {
        if (visible && schedule) {
            form.setFieldsValue({
                weekDay: schedule.weekDay,
                time_range: schedule.start_time && schedule.end_time
                    ? [dayjs(schedule.start_time), dayjs(schedule.end_time)]
                    : undefined,
                facultyId: schedule.faculty_id?._id || schedule.faculty_id,
                centerId: schedule.center_id?._id || schedule.center_id,
            });
        }
    }, [visible, schedule, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            const scheduleData = {
                weekDay: values.weekDay,
                start_time: values.time_range?.[0]?.toDate(),
                end_time: values.time_range?.[1]?.toDate(),
                faculty_id: values.facultyId,
                center_id: values.centerId,
            };

            await update(schedule._id, scheduleData, batchId);
            message.success('Schedule row updated successfully');
            onSave();
            form.resetFields();
        } catch (error) {
            if (error.errorFields) {
                message.error('Please fill in all required fields');
            }
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    const courseName = schedule?.diplomaIntake_id?.courseId?.name;
    const subjectName = (schedule?.diplomaIntake_id?.courseId?.terms || [])
        .flatMap((t) => t.subjects || [])
        .find((s) => s._id === schedule?.subject_id)?.name;

    return (
        <Modal
            title="Edit Timetable Row"
            open={visible}
            onCancel={handleCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Update Row"
            width={600}
        >
            <div className="mb-4">
                <Text type="secondary">Course: <Text strong>{courseName || 'N/A'}</Text></Text><br />
                <Text type="secondary">Intake: <Text strong>{schedule?.diplomaIntake_id?.name || 'N/A'}</Text></Text><br />
                <Text type="secondary">Subject: <Text strong>{subjectName || 'N/A'}</Text></Text>
            </div>

            <Form form={form} layout="vertical">
                <Form.Item
                    name="weekDay"
                    label="Week Day"
                    rules={[{ required: true, message: 'Please select a week day' }]}
                >
                    <Select
                        placeholder="Select day"
                        options={weekDays.map((day, index) => ({ value: index, label: day }))}
                    />
                </Form.Item>

                <Form.Item
                    name="time_range"
                    label="Class Time"
                    rules={[{ required: true, message: 'Please select the class time' }]}
                >
                    <TimePicker.RangePicker use12Hours format="h:mm A" style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                    name="facultyId"
                    label="Faculty"
                    rules={[{ required: true, message: 'Please select a faculty' }]}
                >
                    <Select
                        placeholder="Select faculty"
                        showSearch
                        optionFilterProp="label"
                        options={faculties?.map((f) => ({ value: f._id, label: f.username || f.email }))}
                    />
                </Form.Item>

                <Form.Item
                    name="centerId"
                    label="Center"
                    rules={[{ required: true, message: 'Please select a center' }]}
                >
                    <Select
                        placeholder="Select center"
                        showSearch
                        optionFilterProp="label"
                        options={centers?.map((c) => ({ value: c._id, label: c.center_name }))}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default EditScheduleRowModal;
