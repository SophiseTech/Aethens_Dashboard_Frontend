import React, { useEffect, useState } from "react";
import { Card, List, Tag, Typography, Empty, Spin } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useStore } from "zustand";
import userStore from "@stores/UserStore";
import centerStore from "@stores/CentersStore";
import studentService from "@services/Student";

const { Text } = Typography;

function OverDurationStudents() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useStore(userStore);
  const { selectedCenter } = useStore(centerStore);

  const fetchOverDuration = async () => {
    try {
      setLoading(true);
      const centerId = user?.role === "admin" ? selectedCenter : user?.center_id;
      const response = await studentService.getOverDurationStudents({
        center_id: centerId,
        limit: 20,
        skip: 0,
      });
      const data = response?.data || response || [];
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching over-duration students:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverDuration();
  }, [user?.role, user?.center_id, selectedCenter]);

  const formatDate = (value) => {
    if (!value) return "-";
    return dayjs(value).format("YYYY-MM-DD");
  };

  return (
    <Card
      className="border border-border w-full"
      title={
        <div className="flex items-center gap-2">
          <ClockCircleOutlined />
          <span>Over-Duration Students</span>
          {items.length > 0 && <Tag color="red">{items.length}</Tag>}
        </div>
      }
    >
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Spin size="large" />
        </div>
      ) : items.length === 0 ? (
        <Empty
          description="No over-duration students found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <div className="max-h-[400px] overflow-y-auto">
          <List
            dataSource={items}
            renderItem={(item) => (
              <List.Item
                key={`${item._id}`}
                className="hover:bg-gray-50 transition-colors rounded-lg px-2"
              >
                <List.Item.Meta
                  avatar={
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <ClockCircleOutlined className="text-orange-500" />
                    </div>
                  }
                  title={
                    <div className="flex items-center gap-2 flex-wrap">
                      <Text strong>{item?.user?.username || "Student"}</Text>
                      {item?.student?.admissionNumber && (
                        <Tag color="blue">{item.student.admissionNumber}</Tag>
                      )}
                    </div>
                  }
                  description={
                    <div className="flex flex-col gap-1">
                      <Text type="secondary" className="text-xs">
                        Course: {item?.course_name || "Not Specified"}
                      </Text>
                      <div className="flex items-center justify-between">
                        <Text type="secondary" className="text-xs">
                          Over since: {formatDate(item?.overDurationDate)}
                        </Text>
                        <Tag color="red">{item?.daysOver || 0} days</Tag>
                      </div>
                      <Text type="secondary" className="text-xs">
                        Active slots: {item?.activeSlotsCount || 0}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      )}
    </Card>
  );
}

export default OverDurationStudents;
