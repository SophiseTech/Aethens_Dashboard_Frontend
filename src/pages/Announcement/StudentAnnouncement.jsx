import { useEffect, useState } from "react";
import { Table, Spin, Empty, Space, Typography } from "antd";
import { listAnnouncements, listLatestAnnouncements } from "@/services/Announcement";
import { formatDate } from "@utils/helper";
import TitleLayout from "@components/layouts/Title";

const { Title } = Typography;

const columns = [
  {
    title: "Title",
    dataIndex: "title",
    key: "title",
    render: (text) => <b>{text}</b>,
  },
  {
    title: "Content",
    dataIndex: "body",
    key: "content",
    render: (text) => <span style={{ whiteSpace: "pre-line" }}>{text}</span>,
  },
  {
    title: "Published Date",
    dataIndex: "created_at",
    key: "publishedAt",
    render: (date) => (date ? formatDate(new Date(date)) : "-"),
  },
  {
    title: "Expiry Date",
    dataIndex: "expires_at",
    key: "expires_at",
    render: (date) => (date ? formatDate(new Date(date)) : "-"),
  },
];

const StudentAnnouncement = () => {
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await listLatestAnnouncements();
        setAnnouncements(data);
      } catch (e) {
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <TitleLayout title="Announcements">
      <Space direction="vertical" style={{ padding: 24, width: "100%" }}>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 200,
            }}
          >
            <Spin size="large" />
          </div>
        ) : announcements.length === 0 ? (
          <Empty
            description="No active announcements"
            style={{ margin: "32px auto" }}
          />
        ) : (
          <Table
            dataSource={announcements}
            columns={columns}
            rowKey={(record) => record.id || record._id}
            pagination={{ pageSize: 10 }}
            bordered
          />
        )}
      </Space>
    </TitleLayout>
  );
};

export default StudentAnnouncement;
