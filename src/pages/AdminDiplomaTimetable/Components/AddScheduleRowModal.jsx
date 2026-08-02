import { useEffect, useState } from 'react';
import { Modal, Form, Select, TimePicker, DatePicker, Button, message } from 'antd';
import dayjs from 'dayjs';
import { PlusOutlined } from '@ant-design/icons';
import { useStore } from 'zustand';
import batchScheduleStore from '@stores/BatchScheduleStore';
import centersStore from '@stores/CentersStore';
import facultyStore from '@stores/FacultyStore';
import useDiplomaCourses from '@hooks/useDiplomaCourses';
import useDiplomaIntakes from '@hooks/useDiplomaIntakes';
import useDiplomaCourseSubjects from '@hooks/useDiplomaCourseSubjects';
import { weekDays } from '@utils/constants';

function AddScheduleRowModal({ batchId }) {
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    const { create, createLoading } = batchScheduleStore();
    const { centers, getCenters } = useStore(centersStore);
    const { faculties, getFacultiesByCenter } = facultyStore();
    const { courseOptions, loading: loadingCourses } = useDiplomaCourses({ enabled: visible });
    const selectedCourseId = Form.useWatch('courseId', form);
    const { intakeOptions, loading: loadingIntakes } = useDiplomaIntakes(selectedCourseId);
    const { subjectOptions, loading: loadingSubjects } = useDiplomaCourseSubjects(selectedCourseId);

    useEffect(() => {
        if (visible) {
            getCenters(0);
            getFacultiesByCenter(100);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    const showModal = () => setVisible(true);
    const handleCancel = () => {
        setVisible(false);
        form.resetFields();
    };

    const handleCourseChange = () => {
        form.setFieldValue('intakeId', undefined);
        form.setFieldValue('subjectId', undefined);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            const scheduleData = {
                diplomaBatch_id: batchId,
                diplomaIntake_id: values.intakeId,
                center_id: values.centerId,
                weekDay: values.weekDay,
                start_time: values.time_range?.[0]?.toDate(),
                end_time: values.time_range?.[1]?.toDate(),
                faculty_id: values.facultyId,
                subject_id: values.subjectId,
                termStartDate: values.termDateRange?.[0]?.toDate(),
                termEndDate: values.termDateRange?.[1]?.toDate(),
            };

            const result = await create(scheduleData);
            if (result?.reusedTermDates) {
                message.info(
                    `This term's dates are already set to ${dayjs(result.termStartDate).format('D MMM YYYY')} – ${dayjs(result.termEndDate).format('D MMM YYYY')}; using those instead.`
                );
            } else {
                message.success('Schedule row added successfully');
            }
            handleCancel();
        } catch (error) {
            if (error.errorFields) {
                message.error('Please fill in all required fields');
            }
        }
    };

    return (
        <>
            <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
                Add Schedule Row
            </Button>

            <Modal
                title="Add Timetable Row"
                open={visible}
                onCancel={handleCancel}
                onOk={handleSubmit}
                confirmLoading={createLoading}
                okText="Add Row"
                width={600}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="courseId"
                        label="Diploma Course"
                        rules={[{ required: true, message: 'Please select a diploma course' }]}
                    >
                        <Select
                            placeholder="Select course"
                            showSearch
                            optionFilterProp="label"
                            loading={loadingCourses}
                            options={courseOptions}
                            onChange={handleCourseChange}
                        />
                    </Form.Item>

                    <Form.Item
                        name="intakeId"
                        label="Intake"
                        rules={[{ required: true, message: 'Please select an intake' }]}
                    >
                        <Select
                            placeholder="Select intake"
                            loading={loadingIntakes}
                            options={intakeOptions}
                            disabled={!selectedCourseId}
                        />
                    </Form.Item>

                    <Form.Item
                        name="subjectId"
                        label="Subject"
                        rules={[{ required: true, message: 'Please select a subject' }]}
                    >
                        <Select
                            placeholder="Select subject"
                            loading={loadingSubjects}
                            options={subjectOptions}
                            disabled={!selectedCourseId}
                        />
                    </Form.Item>

                    <Form.Item
                        name="termDateRange"
                        label="Term Start / End Date"
                        tooltip="Only used if this is the first row created for this term — if the term already has rows, its existing dates are kept."
                        rules={[{ required: true, message: 'Please select the term start and end date' }]}
                    >
                        <DatePicker.RangePicker style={{ width: '100%' }} />
                    </Form.Item>

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
        </>
    );
}

export default AddScheduleRowModal;
