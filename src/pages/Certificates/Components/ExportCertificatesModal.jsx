import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Modal,
  DatePicker,
  Select,
  Checkbox,
  Button,
  Space,
  message,
  Tag,
  Row,
  Col,
  Avatar,
  Spin,
  Empty,
} from "antd";
import {
  ExportOutlined,
  FileExcelOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { debounce } from "lodash";
import * as XLSX from "xlsx";
import certificateService from "@services/Certificate";
import userService from "@services/User";
import courseService from "@services/Course";
import diplomaCourseService from "@services/DiplomaCourse";
import { formatDate } from "@utils/helper";

const { RangePicker } = DatePicker;
const { Option, OptGroup } = Select;

const EXPORT_FIELDS = [
  { key: "student_name", label: "Student Name", group: "Student" },
  { key: "admission_number", label: "Admission No.", group: "Student" },
  { key: "student_email", label: "Student Email", group: "Student" },
  { key: "student_phone", label: "Student Phone", group: "Student" },
  { key: "course_name", label: "Course Name", group: "Certificate" },
  { key: "course_type", label: "Program Type", group: "Certificate" },
  { key: "issue_date", label: "Issue Date", group: "Certificate" },
  { key: "status", label: "Status", group: "Certificate" },
  { key: "remarks", label: "Remarks", group: "Certificate" },
  { key: "center_name", label: "Center", group: "Center" },
  { key: "issued_by_name", label: "Issued By", group: "Staff" },
];

const DEFAULT_FIELDS = [
  "student_name",
  "admission_number",
  "course_name",
  "course_type",
  "issue_date",
  "status",
  "remarks",
];

function flattenCertificate(cert, selectedFields) {
  const row = {};
  const fieldSet = new Set(selectedFields);

  if (fieldSet.has("student_name")) {
    row["Student Name"] = cert.student_id?.username || "N/A";
  }
  if (fieldSet.has("admission_number")) {
    row["Admission No."] = cert.student_id?.details_id?.admissionNumber || "N/A";
  }
  if (fieldSet.has("student_email")) {
    row["Student Email"] = cert.student_id?.email || "N/A";
  }
  if (fieldSet.has("student_phone")) {
    row["Student Phone"] = cert.student_id?.phone || "N/A";
  }
  if (fieldSet.has("course_name")) {
    row["Course Name"] = cert.course_name || "N/A";
  }
  if (fieldSet.has("course_type")) {
    row["Program Type"] = cert.course_type === "diploma" ? "Diploma" : "Short-Term";
  }
  if (fieldSet.has("issue_date")) {
    row["Issue Date"] = cert.issue_date ? formatDate(cert.issue_date) : "N/A";
  }
  if (fieldSet.has("status")) {
    row["Status"] = cert.status ? cert.status.toUpperCase() : "N/A";
  }
  if (fieldSet.has("remarks")) {
    row["Remarks"] = cert.remarks || "";
  }
  if (fieldSet.has("center_name")) {
    row["Center"] = cert.center_id?.center_name || "N/A";
  }
  if (fieldSet.has("issued_by_name")) {
    row["Issued By"] = cert.issued_by?.username || "N/A";
  }

  return row;
}

function ExportCertificatesModal({
  visible,
  onCancel,
  shortTermCourses = [],
  diplomaCourses = [],
}) {
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);
  const [selectedStudentId, setSelectedStudentId] = useState("all");
  const [studentOptions, setStudentOptions] = useState([]);
  const [studentLoading, setStudentLoading] = useState(false);

  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedFields, setSelectedFields] = useState(DEFAULT_FIELDS);
  const [loading, setLoading] = useState(false);

  const [shortCourses, setShortCourses] = useState(shortTermCourses);
  const [diplomaList, setDiplomaList] = useState(diplomaCourses);

  const fetchStudents = useCallback(async (queryText = "") => {
    try {
      setStudentLoading(true);
      const searchQuery = (queryText || "").trim() || "A";
      const res = await userService.search(0, 10, { searchQuery });
      const users = res?.users || res?.data?.users || res?.data || [];
      const list = Array.isArray(users) ? users : [];
      setStudentOptions(list);
    } catch {
      setStudentOptions([]);
    } finally {
      setStudentLoading(false);
    }
  }, []);

  const handleDebouncedStudentSearch = useMemo(
    () =>
      debounce((searchQuery) => {
        fetchStudents(searchQuery);
      }, 300),
    [fetchStudents]
  );

  useEffect(() => {
    if (shortTermCourses.length > 0) setShortCourses(shortTermCourses);
    if (diplomaCourses.length > 0) setDiplomaList(diplomaCourses);
  }, [shortTermCourses, diplomaCourses]);

  useEffect(() => {
    if (visible && shortCourses.length === 0 && diplomaList.length === 0) {
      Promise.all([
        courseService.getAllCourses(),
        diplomaCourseService.getAllCourses(),
      ])
        .then(([sc, dc]) => {
          setShortCourses(sc?.data || sc || []);
          setDiplomaList(dc?.data || dc || []);
        })
        .catch(() => {});
    }
  }, [visible, shortCourses.length, diplomaList.length]);

  useEffect(() => {
    if (visible) {
      setSelectedStudentId("all");
      setCourseFilter("all");
      setStatusFilter("all");
      setDateRange([dayjs().startOf("month"), dayjs().endOf("month")]);
      fetchStudents("");
    }
  }, [visible, fetchStudents]);

  const toggleField = (key) => {
    setSelectedFields((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      message.warning("Please select at least one field to export");
      return;
    }

    setLoading(true);
    try {
      const payloadFilters = {
        status: statusFilter,
        course_id: courseFilter,
        student_id: selectedStudentId || "all",
      };

      if (dateRange && dateRange[0] && dateRange[1]) {
        payloadFilters.dateRange = {
          from: dateRange[0].toISOString(),
          to: dateRange[1].toISOString(),
        };
      }

      const response = await certificateService.exportCertificates(payloadFilters);

      const certificates = response?.certificates || [];

      if (certificates.length === 0) {
        message.info("No certificates found for the selected filters");
        setLoading(false);
        return;
      }

      const rows = certificates.map((cert) => flattenCertificate(cert, selectedFields));

      const worksheet = XLSX.utils.json_to_sheet(rows);

      const colWidths = Object.keys(rows[0] || {}).map((key) => ({
        wch: Math.max(key.length, ...rows.map((r) => String(r[key] || "").length).slice(0, 100)) + 2,
      }));
      worksheet["!cols"] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Certificates");

      const fromDate = dateRange?.[0] ? dateRange[0].format("DD-MMM-YYYY") : "All";
      const toDate = dateRange?.[1] ? dateRange[1].format("DD-MMM-YYYY") : "Dates";
      const fileName = `Certificates_Export_${fromDate}_to_${toDate}.xlsx`;

      XLSX.writeFile(workbook, fileName);

      message.success(`Exported ${certificates.length} certificates successfully`);
      onCancel();
    } catch {
      message.error("Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <FileExcelOutlined style={{ color: "#52c41a" }} />
          <span>Export Certificates</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="export"
          type="primary"
          icon={<ExportOutlined />}
          loading={loading}
          onClick={handleExport}
        >
          {loading ? "Exporting..." : "Export"}
        </Button>,
      ]}
      width={600}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
              Student Name
            </label>
            <Select
              className="w-full"
              showSearch
              placeholder="Search student or select All"
              value={selectedStudentId}
              onChange={(val) => setSelectedStudentId(val || "all")}
              filterOption={false}
              onSearch={handleDebouncedStudentSearch}
              loading={studentLoading}
              optionLabelProp="label"
              allowClear
              notFoundContent={
                studentLoading ? (
                  <Spin size="small" />
                ) : (
                  <Empty
                    description="No students found"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )
              }
            >
              <Option value="all" label="All Students">
                <span style={{ fontWeight: 500 }}>All Students</span>
              </Option>
              {studentOptions.map((student) => (
                <Option
                  key={student._id}
                  value={student._id}
                  label={student.username}
                >
                  <Space size={6}>
                    <Avatar size="small" src={student.profile_img} icon={<UserOutlined />} />
                    <span>{student.username}</span>
                    {student.details_id?.admissionNumber && (
                      <span style={{ color: "#8c8c8c", fontSize: 12 }}>
                        ({student.details_id.admissionNumber})
                      </span>
                    )}
                  </Space>
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={12}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
              Course
            </label>
            <Select
              className="w-full"
              placeholder="Filter by course"
              value={courseFilter}
              onChange={setCourseFilter}
              showSearch
              optionFilterProp="children"
            >
              <Option value="all">All Courses</Option>
              <OptGroup label="Short-Term Courses">
                {shortCourses.map((c) => (
                  <Option key={c._id} value={c._id}>
                    {c.course_name}
                  </Option>
                ))}
              </OptGroup>
              <OptGroup label="Diploma Courses">
                {diplomaList.map((c) => (
                  <Option key={c._id} value={c._id}>
                    {c.name}
                  </Option>
                ))}
              </OptGroup>
            </Select>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
              Date Range
            </label>
            <RangePicker
              className="w-full"
              value={dateRange}
              onChange={setDateRange}
              format="DD-MMM-YYYY"
              allowClear
            />
          </Col>
          <Col span={12}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
              Status
            </label>
            <Select
              className="w-full"
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
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
        </Row>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontWeight: 500 }}>Fields to Export</span>
            <Space size="small">
              <Button type="link" size="small" onClick={() => setSelectedFields(EXPORT_FIELDS.map((f) => f.key))}>
                Select All
              </Button>
              <Button type="link" size="small" onClick={() => setSelectedFields(DEFAULT_FIELDS)}>
                Reset
              </Button>
            </Space>
          </div>
          <div
            style={{
              maxHeight: 180,
              overflowY: "auto",
              border: "1px solid #f0f0f0",
              borderRadius: 6,
              padding: 12,
            }}
          >
            {EXPORT_FIELDS.map((field) => (
              <div key={field.key} style={{ marginBottom: 6 }}>
                <Checkbox
                  checked={selectedFields.includes(field.key)}
                  onChange={() => toggleField(field.key)}
                >
                  {field.label}
                  <Tag style={{ marginLeft: 8, fontSize: 11 }}>{field.group}</Tag>
                </Checkbox>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ExportCertificatesModal;
