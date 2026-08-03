import { useEffect, useState } from "react";
import { Segmented, Table, Tag } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import diplomaStudentStore from "@stores/DiplomaStudentStore";
import UserDetailsDrawer from "@components/UserDetailsDrawer";

const VIEW_LABEL_TO_PARAM = {
  "Current Batch": "current",
  "Active Students": "active",
  "All Students": "all",
};

const STATUS_COLORS = {
  active: "green",
  completed: "blue",
  migrated: "orange",
  cancelled: "red",
};

function DiplomaStudentList() {
  const { students, loading, total, searchQuery, getStudents } = diplomaStudentStore();

  const nav = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const initialView = queryParams.get("view") || "Current Batch";
  const initialPage = parseInt(queryParams.get("page")) || 1;

  const [selectedView, setSelectedView] = useState(initialView);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    getStudents({
      view: VIEW_LABEL_TO_PARAM[selectedView],
      page: currentPage,
      search: searchQuery,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedView, currentPage, searchQuery]);

  const updateURL = (view, page) => {
    nav(`?view=${view}&page=${page}`, { replace: true });
  };

  const handleSegmentChange = (view) => {
    setSelectedView(view);
    setCurrentPage(1);
    updateURL(view, 1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateURL(selectedView, page);
  };

  const handleNameClick = (record) => {
    setSelectedUser(record);
    setDrawerVisible(true);
  };

  const columns = [
    {
      title: "Adm No",
      dataIndex: ["details_id", "admissionNumber"],
    },
    {
      title: "Name",
      dataIndex: "username",
      key: "username",
      render: (name, record) => (
        <div
          className="flex gap-3 items-center"
          onClick={() => handleNameClick(record)}
          style={{ cursor: "pointer" }}
        >
          <img
            className="w-8 rounded-full border aspect-square 2xl:w-10 border-border"
            src={record?.profile_img || "/images/default.jpg"}
            alt="Profile"
          />
          <p className="max-2xl:text-xs">{name}</p>
        </div>
      ),
    },
    {
      title: "ID Card No",
      dataIndex: ["details_id", "idCardNumber"],
      render: (value) => value || <Tag color="warning">Unassigned</Tag>,
    },
    {
      title: "Diploma Course",
      dataIndex: ["enrollment", "courseName"],
    },
    {
      title: "Batch",
      dataIndex: ["enrollment", "batchName"],
    },
    {
      title: "Intake",
      dataIndex: ["enrollment", "intakeName"],
    },
    {
      title: "Enrollment Date",
      dataIndex: ["enrollment", "start_date"],
      render: (date) => (date ? new Date(date).toDateString() : "-"),
    },
    {
      title: "Attendance",
      key: "attendance",
      render: (_, record) => `${record?.attendance?.attended || 0}/${record?.attendance?.total || 0}`,
    },
    {
      title: "Status",
      dataIndex: ["enrollment", "status"],
      render: (status) => (
        <Tag color={STATUS_COLORS[status] || "default"} style={{ textTransform: "capitalize" }}>
          {status || "-"}
        </Tag>
      ),
    },
  ];

  return (
    <>
      <Segmented
        options={["Current Batch", "Active Students", "All Students"]}
        className="mb-3 w-fit"
        value={selectedView}
        onChange={handleSegmentChange}
      />

      <div className="mb-2 text-xs text-gray-400">
        Showing <span className="font-semibold text-gray-600">{total}</span> student{total !== 1 && "s"}
      </div>

      <Table
        columns={columns}
        dataSource={students}
        loading={loading}
        rowKey="_id"
        pagination={{
          current: currentPage,
          onChange: handlePageChange,
          total,
          pageSize: 10,
          showSizeChanger: false,
        }}
      />

      <UserDetailsDrawer
        user={selectedUser}
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        showActions
        isStudentDetail
        isDiploma
      />
    </>
  );
}

export default DiplomaStudentList;
