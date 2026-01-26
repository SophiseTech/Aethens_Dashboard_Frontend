import React from "react";
import { Modal, Timeline, Typography, Tag, Empty, Avatar, Tooltip } from "antd";
import { EditOutlined, PlusOutlined, CheckCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import useManagerTaskStore from "@/stores/ManagerTaskStore";

const { Text, Title } = Typography;

export default function TaskHistoryModal() {
    const { historyModalOpen, selectedTask, setHistoryModalOpen } = useManagerTaskStore();

    const handleClose = () => {
        setHistoryModalOpen(false);
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
        return <EditOutlined style={{ color: "#faad14" }} />;
    };

    const history = selectedTask?.editHistory || [];

    return (
        <Modal
            title={
                <div>
                    <Title level={4} className="!mb-0">
                        Task History
                    </Title>
                    {selectedTask && (
                        <Text type="secondary">Task #{selectedTask.taskNumber}</Text>
                    )}
                </div>
            }
            open={historyModalOpen}
            onCancel={handleClose}
            footer={null}
            width={600}
        >
            {history.length === 0 ? (
                <Empty description="No history available" />
            ) : (
                <Timeline
                    mode="left"
                    items={history
                        .slice()
                        .reverse()
                        .map((entry, index) => ({
                            dot: getChangeIcon(entry.changes?.[0]?.field),
                            children: (
                                <div className="pb-4">
                                    {/* Header */}
                                    <div className="flex items-center gap-2 mb-2">
                                        {entry.changedBy && (
                                            <Tooltip title={entry.changedBy.username || entry.changedBy.email}>
                                                <Avatar size="small" src={entry.changedBy.profile_img}>
                                                    {entry.changedBy.username?.charAt(0)?.toUpperCase()}
                                                </Avatar>
                                            </Tooltip>
                                        )}
                                        <Text strong>
                                            {entry.changedBy?.username || "System"}
                                        </Text>
                                        <Text type="secondary" className="text-sm">
                                            {dayjs(entry.changedAt).format("DD MMM YYYY, hh:mm A")}
                                        </Text>
                                    </div>

                                    {/* Changes */}
                                    <div className="pl-8 space-y-2">
                                        {entry.changes?.map((change, changeIndex) => (
                                            <div
                                                key={changeIndex}
                                                className="bg-gray-50 rounded-lg p-3"
                                            >
                                                <Text strong className="text-sm">
                                                    {formatFieldName(change.field)}
                                                </Text>

                                                {change.field === "created" ? (
                                                    <div className="mt-1">
                                                        <Tag color="green">Task Created</Tag>
                                                    </div>
                                                ) : (
                                                    <div className="mt-1 flex items-center gap-2 text-sm">
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
        </Modal>
    );
}
