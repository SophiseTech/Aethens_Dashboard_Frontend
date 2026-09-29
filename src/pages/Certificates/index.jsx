import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  DatePicker,
  Space,
  Tag,
  Avatar,
  Popconfirm,
  Tooltip,
  Row,
  Col,
  Typography,
  Dropdown,
} from "antd";
import {
  PlusOutlined,
  ExportOutlined,
  ReloadOutlined,
  DeleteOutlined,
  UserOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PrinterOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { debounce } from "lodash";
import useCertificateStore from "@stores/CertificateStore";
import courseService from "@services/Course";
import diplomaCourseService from "@services/DiplomaCourse";
import { formatDate } from "@utils/helper";
import AddCertificateModal from "./Components/AddCertificateModal";
import ExportCertificatesModal from "./Components/ExportCertificatesModal";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option, OptGroup } = Select;

const STATUS_CONFIG = {
  issued: {
    color: "blue",
    label: "Issued",
    icon: <ClockCircleOutlined />,
    bg: "#e6f4ff",
    text: "#0958d9",
    border: "#91caff",
    dot: "#1677ff",
  },
  printed: {
    color: "orange",
    label: "Printed",
    icon: <PrinterOutlined />,
    bg: "#fff7e6",
    text: "#d46b08",
    border: "#ffd591",
    dot: "#fa8c16",
  },
  delivered: {
    color: "green",
    label: "Delivered",
    icon: <CheckCircleOutlined />,
    bg: "#f6ffed",
    text: "#389e0d",
    border: "#b7eb8f",
    dot: "#52c41a",
  },
};

const STATUS_MENU_ITEMS = [
  {
    key: "issued",
    label: (
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 4px" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#1677ff", display: "inline-block" }} />
        <span style={{ fontWeight: 500 }}>Issued</span>
      </div>
    ),
  },
  {
    key: "printed",
    label: (
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 4px" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#fa8c16", display: "inline-block" }} />
        <span style={{ fontWeight: 500 }}>Printed</span>
      </div>
    ),
  },
  {
    key: "delivered",
    label: (
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 4px" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#52c41a", display: "inline-block" }} />
        <span style={{ fontWeight: 500 }}>Delivered</span>
      </div>
    ),
  },
];

function Certificates() {
  const {
    certificates,
    loading,
    total,
    page,
    limit,
    filters,
    fetchCertificates,
    setFilters,
    updateCertificateStatus,
    deleteCertificate,
  } = useCertificateStore();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);

  const [shortTermCourses, setShortTermCourses] = useState([]);
  const [diplomaCourses, setDiplomaCourses] = useState([]);
  const [courseLoading, setCourseLoading] = useState(false);

  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [dateRange, setDateRange] = useState(null);

  const loadCourses = useCallback(async () => {
    try {
      setCourseLoading(true);
      const [shortRes, diplomaRes] = await Promise.all([
        courseService.getCourses({}, 0, 100).catch(() => ({ courses: [] })),
        diplomaCourseService.listCourses({ limit: 100 }).catch(() => ({ courses: [] })),
      ]);
      setShortTermCourses(shortRes?.courses || []);
      setDiplomaCourses(diplomaRes?.courses || diplomaRes?.data || []);
    } catch {
      setShortTermCourses([]);
      setDiplomaCourses([]);
    } finally {
      setCourseLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCertificates(1);
    loadCourses();
  }, [fetchCertificates, loadCourses]);

  const debouncedSearch = useMemo(
    () =>
      debounce((val) => {
        setFilters({ search: val });
        fetchCertificates(1, { ...filters, search: val });
      }, 400),
    [filters, setFilters, fetchCertificates]
  );

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    debouncedSearch(val);
  };

  const handleCourseChange = (courseId) => {
    const nextFilters = { ...filters, course_id: courseId };
    setFilters({ course_id: courseId });
    fetchCertificates(1, nextFilters);
  };

  const handleStatusChange = (status) => {
    const nextFilters = { ...filters, status };
    setFilters({ status });
    fetchCertificates(1, nextFilters);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    const rangePayload =
      dates && dates[0] && dates[1]
        ? { from: dates[0].toISOString(), to: dates[1].toISOString() }
        : null;

    const nextFilters = { ...filters, dateRange: rangePayload };
    setFilters({ dateRange: rangePayload });
    fetchCertificates(1, nextFilters);
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setDateRange(null);
    const reset = { search: "", course_id: "all", dateRange: null, status: "all" };
    setFilters(reset);
    fetchCertificates(1, reset);
  };

  const columns = [
    {
      title: "Student",
      key: "student",
      render: (_, record) => {
        const student = record.student_id;
        const admissionNo = student?.details_id?.admissionNumber;
        return (
          <Space>
            <Avatar src={student?.profile_img} icon={<UserOutlined />} />
            <div>
              <div style={{ fontWeight: 500 }}>{student?.username || "N/A"}</div>
              {admissionNo && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {admissionNo}
                </Text>
              )}
            </div>
          </Space>
        );
      },
    },
    {
      title: "Course",
      key: "course",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.course_name}</div>
          <Tag color={record.course_type === "diploma" ? "purple" : "blue"} style={{ fontSize: 10 }}>
            {record.course_type === "diploma" ? "Diploma" : "Short-Term"}
          </Tag>
        </div>
      ),
    },
    {
      title: "Issue Date",
      dataIndex: "issue_date",
      key: "issue_date",
      render: (date) => (date ? formatDate(date) : "N/A"),
    },
    {
      title: "Status",
      key: "status",
      width: 140,
      render: (_, record) => {
        const currentStatus = record.status || "issued";
        const cfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.issued;
        return (
          <Dropdown
            menu={{
              items: STATUS_MENU_ITEMS,
              selectedKeys: [currentStatus],
              onClick: ({ key }) => {
                if (key !== currentStatus) {
                  updateCertificateStatus(record._id, key);
                }
              },
            }}
            trigger={["click"]}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "3px 10px",
                borderRadius: 16,
                backgroundColor: cfg.bg,
                border: `1px solid ${cfg.border}`,
                color: cfg.text,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                userSelect: "none",
                width: "fit-content",
                transition: "all 0.2s ease",
              }}
              title="Click to change status"
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: cfg.dot,
                  display: "inline-block",
                }}
              />
              <span>{cfg.label}</span>
              <DownOutlined style={{ fontSize: 9, opacity: 0.65, marginLeft: 2 }} />
            </div>
          </Dropdown>
        );
      },
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
      ellipsis: true,
      render: (text) =>
        text ? (
          <Tooltip title={text}>
            <span>{text}</span>
          </Tooltip>
        ) : (
          <span style={{ color: "#bfbfbf" }}>—</span>
        ),
    },
    {
      title: "Issued By",
      key: "issued_by",
      render: (_, record) => record.issued_by?.username || "Admin",
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      width: 80,
      render: (_, record) => (
        <Popconfirm
          title="Delete this certificate record?"
          description="This action cannot be undone."
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
          onConfirm={() => deleteCertificate(record._id)}
        >
          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Certificates
          </Title>
          <Text type="secondary">Manage, issue, and export student course certificates</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => fetchCertificates(page)} loading={loading}>
            Refresh
          </Button>
          <Button icon={<ExportOutlined />} onClick={() => setExportModalVisible(true)}>
            Export
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalVisible(true)}>
            Issue Certificate
          </Button>
        </Space>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search student or admission no."
              value={searchInput}
              onChange={handleSearchChange}
              allowClear
            />
          </Col>

          <Col xs={24} sm={12} md={5}>
            <Select
              className="w-full"
              placeholder="Filter by course"
              value={filters.course_id || "all"}
              onChange={handleCourseChange}
              loading={courseLoading}
              showSearch
              optionFilterProp="children"
            >
              <Option value="all">All Courses</Option>
              <OptGroup label="Short-Term Courses">
                {shortTermCourses.map((c) => (
                  <Option key={c._id} value={c._id}>
                    {c.course_name}
                  </Option>
                ))}
              </OptGroup>
              <OptGroup label="Diploma Courses">
                {diplomaCourses.map((c) => (
                  <Option key={c._id} value={c._id}>
                    {c.name}
                  </Option>
                ))}
              </OptGroup>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={4}>
            <Select
              className="w-full"
              placeholder="Status"
              value={filters.status || "all"}
              onChange={handleStatusChange}
            >
              <Option value="all">All Statuses</Option>
              <Option value="issued">
                <Space size={6}>
                  <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", backgroundColor: "#1677ff" }} />
                  <span>Issued</span>
                </Space>
              </Option>
              <Option value="printed">
                <Space size={6}>
                  <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", backgroundColor: "#fa8c16" }} />
                  <span>Printed</span>
                </Space>
              </Option>
              <Option value="delivered">
                <Space size={6}>
                  <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", backgroundColor: "#52c41a" }} />
                  <span>Delivered</span>
                </Space>
              </Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <RangePicker
              className="w-full"
              value={dateRange}
              onChange={handleDateRangeChange}
              format="DD-MMM-YYYY"
            />
          </Col>

          <Col xs={24} sm={12} md={3} style={{ textAlign: "right" }}>
            <Button onClick={handleResetFilters}>Reset</Button>
          </Col>
        </Row>
      </Card>

      <Card bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={certificates}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 800 }}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showTotal: (t) => `Total ${t} certificates`,
            onChange: (p) => fetchCertificates(p),
          }}
        />
      </Card>

      <AddCertificateModal
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
      />

      <ExportCertificatesModal
        visible={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        shortTermCourses={shortTermCourses}
        diplomaCourses={diplomaCourses}
      />
    </div>
  );
}

export default Certificates;
