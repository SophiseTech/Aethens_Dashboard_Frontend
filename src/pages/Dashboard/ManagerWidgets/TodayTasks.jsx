import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Button, Typography, Empty, Spin, message, Tooltip } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { getDashboardTodayTasks, updateTaskStatus } from '@services/ManagerTask';
import dayjs from 'dayjs';

const { Text, Paragraph } = Typography;

function TodayTasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingTaskId, setUpdatingTaskId] = useState(null);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await getDashboardTodayTasks();
            setTasks(response.tasks || []);
        } catch (error) {
            console.error("Error fetching today's tasks:", error);
            message.error("Failed to load today's tasks");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleToggleStatus = async (task) => {
        const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
        try {
            setUpdatingTaskId(task._id);
            await updateTaskStatus(task._id, newStatus);
            message.success(`Task marked as ${newStatus}`);
            // Refresh task list
            fetchTasks();
        } catch (error) {
            console.error("Error updating task status:", error);
            message.error("Failed to update task status");
        } finally {
            setUpdatingTaskId(null);
        }
    };

    const getPriorityColor = (priority) => {
        return priority === 'Urgent' ? 'red' : 'blue';
    };

    const getTaskTitle = (task) => {
        if (task.title) return task.title;
        if (task.taskNumber) return `Task #${task.taskNumber}`;
        return 'Task';
    };

    return (
        <Card
            className='border border-border w-full'
            title={
                <div className="flex items-center gap-2">
                    <ClockCircleOutlined />
                    <span>Today's Tasks</span>
                    {tasks.length > 0 && (
                        <Tag color="blue">{tasks.length}</Tag>
                    )}
                </div>
            }
        >
            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <Spin size="large" />
                </div>
            ) : tasks.length === 0 ? (
                <Empty
                    description="No tasks scheduled for today"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            ) : (
                <List
                    dataSource={tasks}
                    renderItem={(task) => (
                        <List.Item
                            key={task._id}
                            className="hover:bg-gray-50 transition-colors rounded-lg px-2"
                            actions={[
                                <Tooltip
                                    key="toggle"
                                    title={task.status === 'Completed' ? 'Mark as Pending' : 'Mark as Complete'}
                                >
                                    <Button
                                        type={task.status === 'Completed' ? 'default' : 'primary'}
                                        size="small"
                                        icon={task.status === 'Completed' ? <ClockCircleOutlined /> : <CheckCircleOutlined />}
                                        loading={updatingTaskId === task._id}
                                        onClick={() => handleToggleStatus(task)}
                                    >
                                        {task.status === 'Completed' ? 'Pending' : 'Complete'}
                                    </Button>
                                </Tooltip>
                            ]}
                        >
                            <List.Item.Meta
                                title={
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Text strong>{getTaskTitle(task)}</Text>
                                        <Tag color={getPriorityColor(task.priority)}>
                                            {task.priority === 'Urgent' && <ExclamationCircleOutlined className="mr-1" />}
                                            {task.priority}
                                        </Tag>
                                        <Tag color={task.status === 'Completed' ? 'green' : 'orange'}>
                                            {task.status}
                                        </Tag>
                                    </div>
                                }
                                description={
                                    <div>
                                        <Paragraph
                                            ellipsis={{ rows: 2 }}
                                            className="text-gray-600 mb-1"
                                        >
                                            {task.description}
                                        </Paragraph>
                                        <Text type="secondary" className="text-xs">
                                            Due: {dayjs(task.deadline).format('h:mm A')}
                                        </Text>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            )}
        </Card>
    );
}

export default TodayTasks;
