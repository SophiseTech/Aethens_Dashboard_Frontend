import React, { useEffect, useState } from "react";
import { Input, Select, Row, Col } from "antd";
import { useStore } from "zustand";
import notificationStore from "@stores/notificationStore";
import userStore from "@stores/UserStore";
import userService from "@services/User";
import NotificationList from "./components/NotificationList";
import Title from "@components/layouts/Title";

const { Search } = Input;
const { Option } = Select;

export default function Notifications() {
  const {
    allNotifications,
    totalNotifications,
    loadingAll,
    fetchAllNotifications,
    toggleReadStatus
  } = notificationStore();

  const { user } = useStore(userStore);
  const isAdmin = user?.role === "admin";

  const [managers, setManagers] = useState([]);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    type: "all",
    managerId: null,
  });

  useEffect(() => {
    fetchAllNotifications(filters);
  }, [filters, fetchAllNotifications]);

  useEffect(() => {
    // Only fetch managers list if user is admin
    if (!isAdmin) return;

    async function fetchManagers() {
      try {
        const response = await userService.getByRoleByCenter('manager', 'all', 0, 100);
        if (response && response.users) {
          setManagers(response.users);
        }
      } catch (error) {
        console.error("Failed to fetch managers", error);
      }
    }
    fetchManagers();
  }, [isAdmin]);

  const handleTableChange = (pagination) => {
    setFilters((prev) => ({
      ...prev,
      page: pagination.current,
      limit: pagination.pageSize,
    }));
  };

  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleTypeChange = (value) => {
    setFilters((prev) => ({ ...prev, type: value, page: 1 }));
  };

  const handleManagerChange = (value) => {
    setFilters((prev) => ({ ...prev, managerId: value, page: 1 }));
  };

  return (
    <div className="mx-auto p-4">
      <Title title="Notifications" />
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          <div className="flex gap-2">
            {/* Only show manager filter for admins */}
            {isAdmin && (
              <Select
                placeholder="Filter by Manager"
                style={{ width: 200 }}
                allowClear
                onChange={handleManagerChange}
              >
                {managers.map((manager) => (
                  <Option key={manager._id} value={manager._id}>
                    {manager.username}
                  </Option>
                ))}
              </Select>
            )}
            <Select
              defaultValue="all"
              style={{ width: 150 }}
              onChange={handleTypeChange}
            >
              <Option value="all">All Types</Option>
              <Option value="fee_payment">Fee Payment</Option>
              <Option value="slot_request">Slot Request</Option>
              <Option value="enquiry">Enquiry</Option>
            </Select>
            <Search
              placeholder="Search message..."
              onSearch={handleSearch}
              style={{ width: 250 }}
              allowClear
            />
          </div>
        </Col>
      </Row>

      <NotificationList
        notifications={allNotifications}
        loading={loadingAll}
        pagination={{
          current: filters.page,
          pageSize: filters.limit,
          total: totalNotifications,
          showSizeChanger: true,
        }}
        handleTableChange={handleTableChange}
        onToggleReadStatus={toggleReadStatus}
      />
    </div>
  );
}
