import React, { useState } from "react";
import {
    Card,
    Tag,
    Typography,
    Button,
    Divider,
    Avatar,
    Input,
    List,
    message,
    Space,
    Timeline,
    Tooltip,
    Empty,
} from "antd";
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    SendOutlined,
    UserOutlined,
    EditOutlined,
    PlusOutlined,
    CommentOutlined,
    RightOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import useManagerTaskStore from "@/stores/ManagerTaskStore";
import userStore from "@stores/UserStore";
import { useNavigate } from "react-router-dom";

dayjs.extend(relativeTime);

const { Text, Paragraph, Title } = Typography;
const { TextArea } = Input;

export default function TaskDetailCard({ task, onClose }) {
    const { user } = userStore();
    const { updateStatus, addComment, loading, setSelectedTask, setModalOpen } = useManagerTaskStore();
    const [commentText, setCommentText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const isAdmin = user?.role === "admin";
    const hasMultipleAssignees = task.assignedTo?.length > 1;

    // Get current user's completion status for multi-assignee tasks
    const getUserCompletionStatus = () => {
        if (!task.completionStatus || !user) return null;
        return task.completionStatus.find(
            cs => cs.user?._id === user._id || cs.user === user._id
        );
    };

    const userCompletionStatus = getUserCompletionStatus();
    const isUserCompleted = userCompletionStatus?.completed ?? false;

    // Get completion summary for multi-assignee tasks
    const getCompletionSummary = () => {
        if (!task.completionStatus) return { completed: 0, total: 0 };
        const completed = task.completionStatus.filter(cs => cs.completed).length;
        return { completed, total: task.completionStatus.length };
    };

    const completionSummary = getCompletionSummary();

    const handleStatusToggle = async () => {
        // For multi-assignee tasks with non-admin, toggle individual status
        let newStatus;
        if (hasMultipleAssignees && !isAdmin) {
            newStatus = isUserCompleted ? "Pending" : "Completed";
        } else {
            newStatus = task.status === "Pending" ? "Completed" : "Pending";
        }
        try {
            await updateStatus(task._id, newStatus);
            if (hasMultipleAssignees && !isAdmin) {
                message.success(`Your task marked as ${newStatus}`);
            } else {
                message.success(`Task marked as ${newStatus}`);
            }
        } catch (error) {
            message.error("Failed to update status");
        }
    };

    const handleAddComment = async () => {
        if (!commentText.trim()) return;

        setSubmitting(true);
        try {
            await addComment(task._id, commentText.trim());
            setCommentText("");
            message.success("Comment added");
        } catch (error) {
            message.error("Failed to add comment");
        }
        setSubmitting(false);
    };

    const handleEdit = () => {
        setSelectedTask(task);
        setModalOpen(true);
    };

    const getPriorityColor = (priority) => {
        return priority === "Urgent" ? "red" : "blue";
    };

    const formatFieldName = (field) => {
        const fieldNames = {
            description: "Description",
            deadline: "Deadline",
            priority: "Priority",
            status: "Status",
            assignedTo: "Assigned To",
            assignToAll: "Assign to All",
            created: "Task Created",
            comment: "Comment Added",
            title: "Title",
            individualCompletion: "Individual Completion",
        };
        return fieldNames[field] || field;
    };

    const formatValue = (field, value) => {
        if (value === null || value === undefined) return "N/A";

        if (field === "deadline") {
            return dayjs(value).format("DD MMM YYYY, hh:mm A");
        }

        if (field === "assignToAll") {
            return value ? "Yes" : "No";
        }

        if (Array.isArray(value)) {
            return value.length > 0 ? `${value.length} manager(s)` : "None";
        }

        return String(value);
    };

    const getChangeIcon = (field) => {
        if (field === "created") return <PlusOutlined style={{ color: "#52c41a" }} />;
        if (field === "status") return <CheckCircleOutlined style={{ color: "#1890ff" }} />;
        if (field === "comment") return <CommentOutlined style={{ color: "#722ed1" }} />;
        return <EditOutlined style={{ color: "#faad14" }} />;
    };

    const history = task?.editHistory || [];

    // Get task display title
    const taskTitle = task.title || `Task #${task.taskNumber}`;

    return (
        <Card className="max-h-[80vh] overflow-auto">
            {/* Header */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <Title level={4} className="!mb-0">
                        {taskTitle}
                    </Title>
                    <Space>
                        {isAdmin && (
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                size="small"
                                onClick={handleEdit}
                            >
                                Edit
                            </Button>
                        )}
                        <Tag color={getPriorityColor(task.priority)}>{task.priority}</Tag>
                        <Tag color={task.status === "Completed" ? "green" : "orange"}>
                            {task.status}
                        </Tag>
                    </Space>
                </div>

                {/* Show task number if title exists */}
                {task.title && (
                    <Text type="secondary" className="text-sm">
                        #{task.taskNumber}
                    </Text>
                )}

                <Paragraph className="text-gray-700 mb-4 mt-2">
                    {task.description}
                </Paragraph>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>
                        <ClockCircleOutlined className="mr-1" />
                        Deadline: {dayjs(task.deadline).format("DD MMM YYYY, hh:mm A")}
                    </span>
                    {task.createdBy && (
                        <span>Created by: {task.createdBy.username}</span>
                    )}
                    {task.taskType === "reminder" && (
                        <Tag color="purple">System (Reminder)</Tag>
                    )}
                </div>

                {/* Linked Enquiry Info */}
                {task.linkedEnquiry && (
                    <div
                        className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 hover:border-blue-300 transition-colors"
                        onClick={() => {
                            // Navigate to enquiry page with enquiryId to auto-open drawer
                            const basePath = '/manager/enquiries';
                            navigate(`${basePath}?enquiryId=${task.linkedEnquiry._id}`);
                            if (onClose) onClose();
                        }}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <Text strong className="text-blue-700">Linked Enquiry</Text>
                            <Tooltip title="View enquiry details">
                                <RightOutlined className="text-blue-500" />
                            </Tooltip>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm">
                            <span className="text-blue-600">
                                #{task.linkedEnquiry.enquiryNumber}
                            </span>
                            <span>
                                {task.linkedEnquiry.name}
                            </span>
                            <span className="text-gray-500">
                                📞 {task.linkedEnquiry.phoneNumber}
                            </span>
                            <Tag color={
                                task.linkedEnquiry.stage === "New" ? "blue" :
                                    task.linkedEnquiry.stage === "Demo" ? "orange" :
                                        task.linkedEnquiry.stage === "Enrolled" ? "green" : "default"
                            }>
                                {task.linkedEnquiry.stage}
                            </Tag>
                        </div>
                    </div>
                )}
            </div>

            {/* Status Update Button */}
            <div className="mb-6">
                {/* Show per-assignee completion for multi-manager tasks */}
                {hasMultipleAssignees && task.completionStatus?.length > 0 && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                            <Text strong>Assignee Completion Status</Text>
                            <Tag color={completionSummary.completed === completionSummary.total ? "green" : "orange"}>
                                {completionSummary.completed}/{completionSummary.total} Completed
                            </Tag>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {task.completionStatus.map((cs) => (
                                <Tooltip
                                    key={cs.user?._id || cs.user}
                                    title={cs.completed
                                        ? `Completed ${cs.completedAt ? dayjs(cs.completedAt).fromNow() : ''}`
                                        : 'Pending'
                                    }
                                >
                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${cs.completed
                                        ? 'bg-green-100 text-green-700 border border-green-300'
                                        : 'bg-gray-100 text-gray-600 border border-gray-300'
                                        }`}>
                                        <Avatar
                                            size="small"
                                            src={cs.user?.profile_img}
                                            icon={<UserOutlined />}
                                        >
                                            {cs.user?.username?.charAt(0)?.toUpperCase()}
                                        </Avatar>
                                        <span>{cs.user?.username || 'Unknown'}</span>
                                        {cs.completed ? (
                                            <CheckCircleOutlined className="text-green-500" />
                                        ) : (
                                            <ClockCircleOutlined className="text-gray-400" />
                                        )}
                                    </div>
                                </Tooltip>
                            ))}
                        </div>
                    </div>
                )}

                <Button
                    type={
                        hasMultipleAssignees && !isAdmin
                            ? (isUserCompleted ? "default" : "primary")
                            : (task.status === "Pending" ? "primary" : "default")
                    }
                    icon={
                        hasMultipleAssignees && !isAdmin
                            ? (isUserCompleted ? <ClockCircleOutlined /> : <CheckCircleOutlined />)
                            : (task.status === "Pending" ? <CheckCircleOutlined /> : <ClockCircleOutlined />)
                    }
                    onClick={handleStatusToggle}
                    loading={loading}
                    block
                >
                    {hasMultipleAssignees && !isAdmin
                        ? (isUserCompleted ? "Mark My Task as Pending" : "Mark My Task as Completed")
                        : (task.status === "Pending" ? "Mark as Completed" : "Mark as Pending")
                    }
                </Button>

                {task.status === "Completed" && task.completedAt && (
                    <Text type="secondary" className="block mt-2 text-center text-sm">
                        Completed on {dayjs(task.completedAt).format("DD MMM YYYY, hh:mm A")}
                        {task.completedBy && ` by ${task.completedBy.username}`}
                    </Text>
                )}
            </div>

            <Divider />

            {/* History Section - Above Comments */}
            <div className="mb-6">
                <Title level={5}>History ({history.length})</Title>

                {history.length === 0 ? (
                    <Empty description="No history available" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                    <Timeline
                        items={history
                            .slice()
                            .reverse()
                            .slice(0, 10)
                            .map((entry, index) => ({
                                dot: getChangeIcon(entry.changes?.[0]?.field),
                                children: (
                                    <div className="pb-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            {entry.changedBy && (
                                                <Tooltip title={entry.changedBy.username || entry.changedBy.email}>
                                                    <Avatar size="small" src={entry.changedBy.profile_img}>
                                                        {entry.changedBy.username?.charAt(0)?.toUpperCase()}
                                                    </Avatar>
                                                </Tooltip>
                                            )}
                                            <Text strong className="text-sm">
                                                {entry.changedBy?.username || "System"}
                                            </Text>
                                            <Text type="secondary" className="text-xs">
                                                {dayjs(entry.changedAt).fromNow()}
                                            </Text>
                                        </div>

                                        <div className="pl-8">
                                            {entry.changes?.map((change, changeIndex) => (
                                                <div
                                                    key={changeIndex}
                                                    className="bg-gray-50 rounded p-2 text-sm"
                                                >
                                                    <Text strong className="text-xs">
                                                        {formatFieldName(change.field)}
                                                    </Text>

                                                    {change.field === "created" ? (
                                                        <div className="mt-1">
                                                            <Tag color="green" size="small">Task Created</Tag>
                                                        </div>
                                                    ) : change.field === "comment" ? (
                                                        <div className="mt-1 text-xs text-gray-600 italic">
                                                            "{change.newValue}"
                                                        </div>
                                                    ) : (
                                                        <div className="mt-1 flex items-center gap-2 text-xs">
                                                            <span className="text-red-500 line-through">
                                                                {formatValue(change.field, change.oldValue)}
                                                            </span>
                                                            <span className="text-gray-400">→</span>
                                                            <span className="text-green-600 font-medium">
                                                                {formatValue(change.field, change.newValue)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ),
                            }))}
                    />
                )}

                {history.length > 10 && (
                    <Text type="secondary" className="text-xs">
                        Showing latest 10 of {history.length} entries
                    </Text>
                )}
            </div>

            <Divider />

            {/* Comments Section */}
            <div>
                <Title level={5}>Comments ({task.comments?.length || 0})</Title>

                {/* Add Comment */}
                <div className="mb-4">
                    <TextArea
                        rows={2}
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        maxLength={1000}
                    />
                    <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={handleAddComment}
                        loading={submitting}
                        disabled={!commentText.trim()}
                        className="mt-2"
                    >
                        Add Comment
                    </Button>
                </div>

                {/* Comments List */}
                {task.comments?.length > 0 ? (
                    <List
                        itemLayout="horizontal"
                        dataSource={task.comments.slice().reverse()}
                        renderItem={(comment) => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={
                                        <Avatar src={comment.user?.profile_img} icon={<UserOutlined />}>
                                            {comment.user?.username?.charAt(0)?.toUpperCase()}
                                        </Avatar>
                                    }
                                    title={
                                        <div className="flex items-center gap-2">
                                            <Text strong>{comment.user?.username || "User"}</Text>
                                            <Text type="secondary" className="text-xs">
                                                {dayjs(comment.createdAt).fromNow()}
                                            </Text>
                                        </div>
                                    }
                                    description={comment.text}
                                />
                            </List.Item>
                        )}
                    />
                ) : (
                    <Text type="secondary">No comments yet</Text>
                )}
            </div>
        </Card>
    );
}
