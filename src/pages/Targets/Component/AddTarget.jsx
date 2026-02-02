import { PlusCircleFilled } from '@ant-design/icons';
import CustomForm from '@components/form/CustomForm';
import CustomInput from '@components/form/CustomInput';
import CustomSelect from '@components/form/CustomSelect';
import CustomSubmit from '@components/form/CustomSubmit';
import CustomDatePicker from '@components/form/CustomDatePicker';
import { Form, Modal, InputNumber, Row, Col } from 'antd';
import { useState, useMemo } from 'react';
import { useStore } from 'zustand';
import centersStore from '@stores/CentersStore';
import useTargetStore from '@stores/TargetStore';

function AddTarget() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { loading, createTarget } = useTargetStore();
    const [form] = Form.useForm();
    const { centers } = useStore(centersStore);

    const initialValues = {
        title: "",
        description: "",
        targetType: "",
        targetValue: 0,
        center: "",
        startDate: null,
        endDate: null,
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = async () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        form.resetFields();
        setIsModalOpen(false);
    };

    const onSubmit = async (values) => {
        // Transform to match backend expected field names
        const targetData = {
            title: values.title,
            description: values.description,
            center_id: values.center,
            start_date: values.startDate?.toISOString(),
            end_date: values.endDate?.toISOString(),
            metrics: {
                [values.targetType]: values.targetValue
            }
        };

        const created = await createTarget(targetData);
        if (created) {
            handleOk();
            return { reset: true, created };
        }
        return { reset: false };
    };

    const centerOptions = useMemo(
        () => centers?.map(center => ({ label: center.center_name, value: center._id })),
        [centers]
    );

    const targetTypeOptions = [
        { label: 'Enrollments', value: 'enrollments' },
        { label: 'Revenue', value: 'revenue' },
        { label: 'Enquiries', value: 'enquiries' },
        { label: 'Demos', value: 'demos' },
    ];

    return (
        <>
            <PlusCircleFilled className='text-3xl text-primary' onClick={showModal} />
            <Modal
                title={"Create a Target"}
                open={isModalOpen}
                footer={null}
                onCancel={handleCancel}
            >
                <CustomForm
                    form={form}
                    initialValues={initialValues}
                    action={onSubmit}
                    resetOnFinish={(result) => Boolean(result && result.reset === true)}
                >
                    <CustomInput
                        label={"Target Title"}
                        name={"title"}
                        placeholder={"e.g., Q1 Enrollment Target"}
                    />
                    <CustomInput
                        label={"Description"}
                        name={"description"}
                        placeholder={"Describe the target"}
                        required={false}
                    />
                    <CustomSelect
                        label={"Target Type"}
                        name={"targetType"}
                        options={targetTypeOptions}
                    />
                    <Form.Item
                        label="Target Value"
                        name="targetValue"
                        rules={[{ required: true, message: 'Please enter target value' }]}
                    >
                        <InputNumber
                            className="w-full"
                            min={0}
                            placeholder="Enter target value"
                        />
                    </Form.Item>
                    <CustomSelect
                        label={"Center"}
                        name={"center"}
                        options={centerOptions}
                    />
                    <Row gutter={16}>
                        <Col span={12}>
                            <CustomDatePicker
                                label={"Start Date"}
                                name={"startDate"}
                                className="w-full"
                            />
                        </Col>
                        <Col span={12}>
                            <CustomDatePicker
                                label={"End Date"}
                                name={"endDate"}
                                className="w-full"
                            />
                        </Col>
                    </Row>
                    <CustomSubmit className='bg-primary' label={'Create Target'} loading={loading} />
                </CustomForm>
            </Modal>
        </>
    );
}

export default AddTarget;
