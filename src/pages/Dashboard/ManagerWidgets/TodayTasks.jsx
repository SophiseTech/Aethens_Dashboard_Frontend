import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Button, Typography, Empty, Spin, message, Tooltip } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, RightOutlined } from '@ant-design/icons';
import { getDashboardTodayTasks, updateTaskStatus } from '@services/ManagerTask';
import { Link, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Text } = Typography;

function TodayTasks() {
    const [tasks, setTasks] = useState([]);
    const [overdueTasks, setOverdueTasks] = useState([]);
    const [todayCount, setTodayCount] = useState(0);
    const [overdueCount, setOverdueCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [updatingTaskId, setUpdatingTaskId] = useState(null);
    const navigate = useNavigate();

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await getDashboardTodayTasks();
            setTasks(response.tasks || []);
            setOverdueTasks(response.overdueTasks || []);
            setTodayCount(response.todayCount ?? response.tasks?.length ?? 0);
            setOverdueCount(response.overdueCount ?? 0);
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

    const handleToggleStatus = async (e, task) => {
        e.stopPropagation(); // Prevent navigation when clicking the button
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

    const handleTaskClick = (task) => {
        // Navigate to tasks page with taskId to auto-open drawer
        navigate(`/manager/tasks?taskId=${task._id}`);
    };

    const getPriorityColor = (priority) => {
        return priority === 'Urgent' ? 'red' : 'blue';
    };

    const getTaskTitle = (task) => {
        if (task.title) return task.title;
        if (task.taskNumber) return `Task #${task.taskNumber}`;
        return 'Task';
    };

    const renderTask = (task, isOverdue) => (
        <List.Item
            key={task._id}
            className="hover:bg-gray-50 transition-colors rounded-lg px-2 cursor-pointer"
            onClick={() => handleTaskClick(task)}
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
                        onClick={(e) => handleToggleStatus(e, task)}
                    >
                        {task.status === 'Completed' ? 'Pending' : 'Complete'}
                    </Button>
                </Tooltip>,
                <RightOutlined key="view" className="text-gray-400" />
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
                        {/* CSS clamp instead of antd's JS-measured ellipsis, which is costly per row */}
                        <div className="line-clamp-2 text-gray-600 mb-1">
                            {task.description}
                        </div>
                        <Text type={isOverdue ? 'danger' : 'secondary'} className="text-xs">
                            Due: {dayjs(task.deadline).format(isOverdue ? 'D MMM YYYY, h:mm A' : 'h:mm A')}
                        </Text>
                    </div>
                }
            />
        </List.Item>
    );

    const hiddenCount = (todayCount - tasks.length) + (overdueCount - overdueTasks.length);

    return (
        <Card
            className='border border-border w-full'
            styles={{ body: { maxHeight: '400px', overflowY: 'auto' } }}
            title={
                <div className="flex items-center gap-2">
                    <ClockCircleOutlined />
                    <span>Today's Tasks</span>
                    {todayCount > 0 && (
                        <Tag color="blue">{todayCount}</Tag>
                    )}
                    {overdueCount > 0 && (
                        <Tag color="red">{overdueCount} overdue</Tag>
                    )}
                </div>
            }
            extra={<Link to="/manager/tasks" className="text-primary text-sm">View all</Link>}
        >
            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <Spin size="large" />
                </div>
            ) : tasks.length === 0 && overdueTasks.length === 0 ? (
                <Empty
                    description="No tasks scheduled for today"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            ) : (
                <>
                    {tasks.length > 0 && (
                        <List dataSource={tasks} renderItem={(task) => renderTask(task, false)} />
                    )}
                    {overdueTasks.length > 0 && (
                        <>
                            <Text type="danger" strong className="block mt-3 mb-1">Overdue</Text>
                            <List dataSource={overdueTasks} renderItem={(task) => renderTask(task, true)} />
                        </>
                    )}
                    {hiddenCount > 0 && (
                        <div className="text-center mt-3">
                            <Link to="/manager/tasks" className="text-primary text-sm">
                                +{hiddenCount} more — view all tasks
                            </Link>
                        </div>
                    )}
                </>
            )}
        </Card>
    );
}

export default TodayTasks;

