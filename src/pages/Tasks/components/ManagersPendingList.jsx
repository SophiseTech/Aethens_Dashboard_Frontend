import React, { useEffect } from "react";
import { Card, List, Avatar, Typography, Badge, Spin, Empty } from "antd";
import { UserOutlined } from "@ant-design/icons";
import useManagerTaskStore from "@/stores/ManagerTaskStore";
import centersStore from "@stores/CentersStore";
import { useStore } from "zustand";

const { Title, Text } = Typography;

export default function ManagersPendingList() {
    const { selectedCenter } = useStore(centersStore);
    const {
        managersWithPending,
        fetchManagersWithPending,
        loading,
        selectedManagerFilter,
        toggleManagerFilter,
    } = useManagerTaskStore();

    useEffect(() => {
        if (selectedCenter) {
            fetchManagersWithPending(selectedCenter);
        }
    }, [selectedCenter]);

    const handleManagerClick = (managerId) => {
        toggleManagerFilter(managerId);
    };

    return (
        <Card
            title={
                <Title level={5} className="!mb-0">
                    Managers - Pending Tasks
                </Title>
            }
            className="sticky top-4"
            extra={
                selectedManagerFilter && (
                    <Text
                        type="secondary"
                        className="text-xs cursor-pointer hover:text-blue-500"
                        onClick={() => toggleManagerFilter(selectedManagerFilter)}
                    >
                        Clear filter
                    </Text>
                )
            }
        >
            {loading ? (
                <div className="flex justify-center py-8">
                    <Spin />
                </div>
            ) : managersWithPending.length === 0 ? (
                <Empty description="No pending tasks" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
                <List
                    itemLayout="horizontal"
                    dataSource={managersWithPending}
                    renderItem={(item) => {
                        const isSelected = selectedManagerFilter === item._id;

                        return (
                            <List.Item
                                className={`cursor-pointer transition-all rounded-lg px-2 ${isSelected
                                        ? "bg-green-50 border-l-4 border-[#4f651e]"
                                        : "hover:bg-gray-50"
                                    }`}
                                onClick={() => handleManagerClick(item._id)}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <Avatar src={item.manager?.profile_img} icon={<UserOutlined />}>
                                            {item.manager?.username?.charAt(0)?.toUpperCase()}
                                        </Avatar>
                                    }
                                    title={
                                        <div className="flex items-center justify-between">
                                            <Text strong className={isSelected ? "text-[#4f651e]" : ""}>
                                                {item.manager?.username}
                                            </Text>
                                            <Badge
                                                count={item.pendingCount}
                                                style={{
                                                    backgroundColor: item.pendingCount > 5 ? "#ff4d4f" : "#faad14",
                                                }}
                                            />
                                        </div>
                                    }
                                    description={
                                        <Text type="secondary" className="text-xs">
                                            {item.manager?.email}
                                            {isSelected && (
                                                <span className="ml-2 text-[#4f651e]">(Filtering)</span>
                                            )}
                                        </Text>
                                    }
                                />
                            </List.Item>
                        );
                    }}
                />
            )}
        </Card>
    );
}
