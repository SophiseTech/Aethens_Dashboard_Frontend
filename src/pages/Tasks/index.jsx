import React, { useEffect } from "react";
import { Row, Col, Card, Button, Spin, Empty, Typography, Select, Input, DatePicker } from "antd";
import { PlusOutlined, ReloadOutlined, CalendarOutlined } from "@ant-design/icons";
import useManagerTaskStore from "@/stores/ManagerTaskStore";
import userStore from "@stores/UserStore";
import centersStore from "@stores/CentersStore";
import { useStore } from "zustand";
import AdminCenterSelector from "@components/AdminCenterSelector";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import ManagersPendingList from "./components/ManagersPendingList";
import { TASK_PRIORITY, TASK_STATUS } from "@utils/constants";
import Title from "@components/layouts/Title";

const { Search } = Input;
const { RangePicker } = DatePicker;

export default function TasksPage() {
    const { user } = userStore();
    const { selectedCenter } = useStore(centersStore);
    const {
        tasks,
        loading,
        pagination,
        filters,
        modalOpen,
        fetch,
        setFilters,
        resetFilters,
        setModalOpen,
        setSelectedTask,
    } = useManagerTaskStore();

    const isAdmin = user?.role === "admin";
    const isManager = user?.role === "manager";

    useEffect(() => {
        // Set center filter for admin
        if (isAdmin && selectedCenter) {
            setFilters({ centerId: selectedCenter });
        }
    }, [selectedCenter, isAdmin]);

    useEffect(() => {
        fetch(1);
    }, [filters]);

    const handleCreateTask = () => {
        setSelectedTask(null);
        setModalOpen(true);
    };

    const handleRefresh = () => {
        fetch(pagination.page);
    };

    const handleSearch = (value) => {
        setFilters({ search: value });
    };

    const handlePriorityFilter = (value) => {
        setFilters({ priority: value || null });
    };

    const handleStatusFilter = (value) => {
        setFilters({ status: value || null });
    };

    const handleDateRangeChange = (dates) => {
        if (dates && dates.length === 2) {
            setFilters({
                deadlineFrom: dates[0].format("YYYY-MM-DD"),
                deadlineTo: dates[1].format("YYYY-MM-DD"),
                dueToday: false,
            });
        } else {
            setFilters({ deadlineFrom: null, deadlineTo: null });
        }
    };

    const handleDueTodayToggle = () => {
        const newValue = !filters.dueToday;
        setFilters({
            dueToday: newValue,
            // Clear date range when using Due Today filter
            deadlineFrom: null,
            deadlineTo: null,
        });
    };

    const handleResetFilters = () => {
        resetFilters();
        if (isAdmin && selectedCenter) {
            setFilters({ centerId: selectedCenter });
        }
    };

    return (
        <div className="p-4 md:p-6">
            {/* Header */}
            <Title title="Tasks" 
                level={1}
                button={
                    (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleCreateTask}
                        >
                            Create Task
                        </Button>
                    )
                }
            />

            {/* Filters */}
            <Card className="mb-4">
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={6}>
                        <Search
                            placeholder="Search tasks..."
                            allowClear
                            onSearch={handleSearch}
                            defaultValue={filters.search}
                        />
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                        <Select
                            placeholder="Priority"
                            allowClear
                            className="w-full"
                            value={filters.priority}
                            onChange={handlePriorityFilter}
                            options={TASK_PRIORITY}
                        />
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                        <Select
                            placeholder="Status"
                            allowClear
                            className="w-full"
                            value={filters.status}
                            onChange={handleStatusFilter}
                            options={TASK_STATUS}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <RangePicker
                            className="w-full"
                            placeholder={["Deadline From", "Deadline To"]}
                            onChange={handleDateRangeChange}
                            disabled={filters.dueToday}
                        />
                    </Col>
                    {/* Due Today filter - available for all users but especially useful for managers */}
                    <Col>
                        <Button
                            icon={<CalendarOutlined />}
                            type={filters.dueToday ? "primary" : "default"}
                            onClick={handleDueTodayToggle}
                        >
                            Due Today
                        </Button>
                    </Col>
                    <Col>
                        <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                            Refresh
                        </Button>
                    </Col>
                    <Col>
                        <Button onClick={handleResetFilters}>Reset Filters</Button>
                    </Col>
                </Row>
            </Card>

            {/* Main Content */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={isAdmin ? 16 : 24}>
                    {loading && tasks.length === 0 ? (
                        <div className="flex justify-center items-center h-64">
                            <Spin size="large" />
                        </div>
                    ) : tasks.length === 0 ? (
                        <Card>
                            <Empty description="No tasks found" />
                        </Card>
                    ) : (
                        <TaskList />
                    )}
                </Col>

                {/* Managers with Pending Tasks (Admin only) */}
                {isAdmin && (
                    <Col xs={24} lg={8}>
                        <ManagersPendingList />
                    </Col>
                )}
            </Row>

            {/* Modals */}
            <TaskForm />
        </div>
    );
}
