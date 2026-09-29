import React, { useEffect } from "react";
import { Table, Button, Tag, Space, Popconfirm, List as AntList } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined } from "@ant-design/icons";
import useEnquiryDocumentSetStore from "@/stores/EnquiryDocumentSetStore";

export default function EnquiryDocumentSetList() {
  const { documentSets, loading, fetch, setModalOpen, setSelected, remove } = useEnquiryDocumentSetStore();

  useEffect(() => {
    fetch();
  }, []);

  const columns = [
    {
      title: "Matched by",
      render: (_v, record) =>
        record.courseId ? (
          <Tag color="blue">Course: {record.courseId.course_name || record.courseId}</Tag>
        ) : (
          <Tag color="purple">Age category: {record.ageCategory}</Tag>
        ),
    },
    {
      title: "Documents",
      dataIndex: "documents",
      render: (documents) => `${documents?.length || 0} document${documents?.length === 1 ? "" : "s"}`,
    },
    { title: "Active", dataIndex: "active", render: (v) => (v ? "Yes" : "No") },
    {
      title: "Actions",
      render: (_v, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setSelected(record);
              setModalOpen(true);
            }}
          />
          <Popconfirm title="Delete this document set?" onConfirm={() => remove(record._id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setSelected(null);
            setModalOpen(true);
          }}
        >
          New Document Set
        </Button>
      </div>
      <Table
        rowKey="_id"
        loading={loading}
        dataSource={documentSets}
        columns={columns}
        expandable={{
          expandedRowRender: (record) => (
            <AntList
              size="small"
              dataSource={record.documents || []}
              locale={{ emptyText: "No documents added yet" }}
              renderItem={(doc) => (
                <AntList.Item>
                  <Space>
                    <FileTextOutlined />
                    <span>{doc.name}</span>
                    <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                      {doc.fileName || "View file"}
                    </a>
                  </Space>
                </AntList.Item>
              )}
            />
          ),
        }}
      />
    </div>
  );
}
