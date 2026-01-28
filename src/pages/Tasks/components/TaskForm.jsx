import React, { useEffect, useState } from "react";
import {
    Modal,
    Form,
    Input,
    DatePicker,
    Select,
    Switch,
    Button,
    message,
    Spin,
} from "antd";
import dayjs from "dayjs";
import useManagerTaskStore from "@/stores/ManagerTaskStore";
import userStore from "@stores/UserStore";
import centersStore from "@stores/CentersStore";
import { useStore } from "zustand";
import userService from "@/services/User";
import { TASK_PRIORITY } from "@utils/constants";

const { TextArea } = Input;

export default function TaskForm() {
    const [form] = Form.useForm();
    const { user } = userStore();
    const { selectedCenter } = useStore(centersStore);
    const {
        modalOpen,
        selectedTask,
        loading,
        setModalOpen,
        create,
        update,
    } = useManagerTaskStore();

    const [managers, setManagers] = useState([]);
    const [loadingManagers, setLoadingManagers] = useState(false);
    const [assignToAll, setAssignToAll] = useState(false);

    const isEditing = !!selectedTask;

    useEffect(() => {
        if (modalOpen) {
            fetchManagers();
            if (selectedTask) {
                form.setFieldsValue({
                    title: selectedTask.title,
                    description: selectedTask.description,
                    deadline: dayjs(selectedTask.deadline),
                    priority: selectedTask.priority,
                    assignToAll: selectedTask.assignToAll,
                    assignedTo: selectedTask.assignedTo?.map((m) => m._id),
                });
                setAssignToAll(selectedTask.assignToAll);
            } else {
                form.resetFields();
                setAssignToAll(false);
            }
        }
    }, [modalOpen, selectedTask]);

    const fetchManagers = async () => {
        setLoadingManagers(true);
        try {
            const centerId = user.role === "admin" ? selectedCenter : user.center_id;
            const response = await userService.getUsers({ role: "manager", center_id: centerId });
            setManagers(response || []);
        } catch (error) {
            console.error("Error fetching managers:", error);
        }
        setLoadingManagers(false);
    };

    const handleSubmit = async (values) => {
        try {
            const payload = {
                title: values.title,
                description: values.description,
                deadline: values.deadline.toISOString(),
                priority: values.priority,
                assignToAll: values.assignToAll,
                assignedTo: values.assignToAll ? [] : values.assignedTo,
                center_id: user.role === "admin" ? selectedCenter : user.center_id,
            };

            if (isEditing) {
                await update(selectedTask._id, payload);
                message.success("Task updated successfully");
            } else {
                await create(payload);
                message.success("Task created successfully");
            }
        } catch (error) {
            message.error(error.message || "Failed to save task");
        }
    };

    const handleCancel = () => {
        setModalOpen(false);
        form.resetFields();
    };

    const handleAssignToAllChange = (checked) => {
        setAssignToAll(checked);
        if (checked) {
            form.setFieldValue("assignedTo", []);
        }
    };

    return (
        <Modal
            title={isEditing ? "Edit Task" : "Create Task"}
            open={modalOpen}
            onCancel={handleCancel}
            footer={null}
            width={600}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    priority: "Normal",
                    assignToAll: false,
                }}
            >
                <Form.Item
                    name="title"
                    label="Task Title"
                    rules={[
                        { max: 200, message: "Title cannot exceed 200 characters" },
                    ]}
                >
                    <Input
                        placeholder="Enter task title (optional)..."
                        maxLength={200}
                    />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Task Description"
                    rules={[
                        { required: true, message: "Please enter task description" },
                        { min: 3, message: "Description must be at least 3 characters" },
                    ]}
                >
                    <TextArea
                        rows={4}
                        placeholder="Enter task description..."
                        maxLength={2000}
                        showCount
                    />
                </Form.Item>

                <Form.Item
                    name="deadline"
                    label="Deadline"
                    rules={[{ required: true, message: "Please select deadline" }]}
                >
                    <DatePicker
                        showTime
                        format="DD MMM YYYY, hh:mm A"
                        className="w-full"
                        disabledDate={(current) => current && current < dayjs().startOf("day")}
                    />
                </Form.Item>

                <Form.Item
                    name="priority"
                    label="Priority"
                    rules={[{ required: true, message: "Please select priority" }]}
                >
                    <Select options={TASK_PRIORITY} />
                </Form.Item>

                <Form.Item
                    name="assignToAll"
                    label="Assign to All Managers"
                    valuePropName="checked"
                >
                    <Switch onChange={handleAssignToAllChange} />
                </Form.Item>

                {!assignToAll && (
                    <Form.Item
                        name="assignedTo"
                        label="Assign to Managers"
                        rules={[
                            {
                                required: !assignToAll,
                                message: "Please select at least one manager",
                            },
                        ]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="Select managers..."
                            loading={loadingManagers}
                            optionFilterProp="label"
                            options={managers.map((m) => ({
                                value: m._id,
                                label: m.username,
                            }))}
                        />
                    </Form.Item>
                )}

                <div className="flex justify-end gap-2 mt-6">
                    <Button onClick={handleCancel}>Cancel</Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        {isEditing ? "Update Task" : "Create Task"}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}
