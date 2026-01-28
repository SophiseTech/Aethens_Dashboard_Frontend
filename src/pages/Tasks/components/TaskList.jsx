import React, { useState, useEffect } from "react";
import { Card, Tag, Avatar, Typography, Button, Tooltip, Pagination, Row, Drawer, message } from "antd";
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    CommentOutlined,
    UserOutlined,
    ExclamationCircleOutlined,
    EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import useManagerTaskStore from "@/stores/ManagerTaskStore";
import userStore from "@stores/UserStore";
import TaskDetailCard from "./TaskDetailCard";
import { useLocation, useNavigate } from "react-router-dom";
import { getTaskById } from "@services/ManagerTask";

dayjs.extend(relativeTime);

const { Text, Paragraph } = Typography;

export default function TaskList() {
    const { user } = userStore();
    const {
        tasks,
        pagination,
        loading,
        fetch,
    } = useManagerTaskStore();

    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const taskIdFromUrl = queryParams.get("taskId");

    const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
    const [selectedDetailTask, setSelectedDetailTask] = useState(null);

    const isAdmin = user?.role === "admin";

    // Handle taskId from URL to auto-open drawer
    useEffect(() => {
        const openTaskFromUrl = async () => {
            if (taskIdFromUrl) {
                try {
                    const task = await getTaskById(taskIdFromUrl);
                    if (task) {
                        setSelectedDetailTask(task);
                        setDetailDrawerOpen(true);
                        // Clear the taskId from URL after opening
                        const newParams = new URLSearchParams(location.search);
                        newParams.delete("taskId");
                        const newSearch = newParams.toString();
                        navigate(newSearch ? `?${newSearch}` : location.pathname, { replace: true });
                    }
                } catch (error) {
                    console.error("Error fetching task:", error);
                    message.error("Failed to load task details");
                }
            }
        };
        openTaskFromUrl();
    }, [taskIdFromUrl]);

    const handlePageChange = (page) => {
        fetch(page);
    };

    const handleViewDetails = (task) => {
        setSelectedDetailTask(task);
        setDetailDrawerOpen(true);
    };

    const handleCloseDetailDrawer = () => {
        setDetailDrawerOpen(false);
        setSelectedDetailTask(null);
        // Refresh to get updated comments/status
        fetch(pagination.page);
    };

    const getPriorityColor = (priority) => {
        return priority === "Urgent" ? "red" : "blue";
    };

    const getStatusColor = (status) => {
        return status === "Completed" ? "green" : "orange";
    };

    const getDeadlineStatus = (deadline, status) => {
        if (status === "Completed") return null;
        const now = dayjs();
        const deadlineDate = dayjs(deadline);
        const hoursUntil = deadlineDate.diff(now, "hour");

        if (hoursUntil < 0) {
            return { color: "red", text: "Overdue" };
        } else if (hoursUntil <= 48) {
            return { color: "orange", text: "Due soon" };
        }
        return null;
    };

    // Get task display title
    const getTaskTitle = (task) => {
        return task.title || `Task #${task.taskNumber}`;
    };

    return (
        <div className="space-y-4">
            {tasks.map((task) => {
                const deadlineStatus = getDeadlineStatus(task.deadline, task.status);

                return (
                    <Card
                        key={task._id}
                        className="hover:shadow-md transition-shadow cursor-pointer"
                        bodyStyle={{ padding: "16px" }}
                        onClick={() => handleViewDetails(task)}
                    >
                        <Row justify="space-between" align="top">
                            <div className="flex-1">
                                {/* Task Header */}
                                <div className="flex items-center gap-2 mb-2">
                                    <Text strong className="text-lg">
                                        {getTaskTitle(task)}
                                    </Text>
                                    <Tag color={getPriorityColor(task.priority)}>{task.priority}</Tag>
                                    <Tag color={getStatusColor(task.status)}>
                                        {task.status === "Completed" ? (
                                            <><CheckCircleOutlined /> Completed</>
                                        ) : (
                                            <><ClockCircleOutlined /> Pending</>
                                        )}
                                    </Tag>
                                    {deadlineStatus && (
                                        <Tag color={deadlineStatus.color} icon={<ExclamationCircleOutlined />}>
                                            {deadlineStatus.text}
                                        </Tag>
                                    )}
                                </div>

                                {/* Show task number if title exists */}
                                {task.title && (
                                    <Text type="secondary" className="text-sm mb-2 block">
                                        #{task.taskNumber}
                                    </Text>
                                )}

                                {/* Description */}
                                <Paragraph className="mb-2 text-gray-700" ellipsis={{ rows: 2 }}>
                                    {task.description}
                                </Paragraph>

                                {/* Meta Info */}
                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                    <span>
                                        <ClockCircleOutlined className="mr-1" />
                                        Deadline: {dayjs(task.deadline).format("DD MMM YYYY, hh:mm A")}
                                        <Text type="secondary" className="ml-1">
                                            ({dayjs(task.deadline).fromNow()})
                                        </Text>
                                    </span>

                                    {task.createdBy && (
                                        <span>
                                            Created by: {task.createdBy.username}
                                        </span>
                                    )}

                                    {task.comments?.length > 0 && (
                                        <span>
                                            <CommentOutlined className="mr-1" />
                                            {task.comments.length} comments
                                        </span>
                                    )}
                                </div>

                                {/* Assigned To - Only visible to admins */}
                                {isAdmin && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <Text type="secondary" className="text-sm">Assigned to:</Text>
                                        {task.assignToAll ? (
                                            <Tag color="purple">All Managers</Tag>
                                        ) : (
                                            <Avatar.Group maxCount={3} size="small">
                                                {task.assignedTo?.map((manager) => (
                                                    <Tooltip key={manager._id} title={manager.username}>
                                                        <Avatar src={manager.profile_img} size="small">
                                                            {manager.username?.charAt(0)?.toUpperCase()}
                                                        </Avatar>
                                                    </Tooltip>
                                                ))}
                                            </Avatar.Group>
                                        )}
                                    </div>
                                )}

                                {/* Completed Info */}
                                {task.status === "Completed" && task.completedAt && (
                                    <div className="mt-2 text-sm text-green-600">
                                        <CheckCircleOutlined className="mr-1" />
                                        Completed on {dayjs(task.completedAt).format("DD MMM YYYY, hh:mm A")}
                                        {task.completedBy && ` by ${task.completedBy.username}`}
                                    </div>
                                )}
                            </div>

                            {/* Actions - Just View Details button */}
                            <div className="flex flex-col gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                                <Tooltip title="View Details">
                                    <Button
                                        icon={<EyeOutlined />}
                                        size="small"
                                        type="primary"
                                        ghost
                                        onClick={() => handleViewDetails(task)}
                                    />
                                </Tooltip>
                            </div>
                        </Row>
                    </Card>
                );
            })}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <Pagination
                        current={pagination.page}
                        total={pagination.total}
                        pageSize={pagination.limit}
                        onChange={handlePageChange}
                        showSizeChanger={false}
                        showTotal={(total) => `Total ${total} tasks`}
                    />
                </div>
            )}

            {/* Task Detail Drawer */}
            <Drawer
                title="Task Details"
                placement="right"
                width={500}
                open={detailDrawerOpen}
                onClose={handleCloseDetailDrawer}
                destroyOnClose
            >
                {selectedDetailTask && (
                    <TaskDetailCard task={selectedDetailTask} onClose={handleCloseDetailDrawer} />
                )}
            </Drawer>
        </div>
    );
}
