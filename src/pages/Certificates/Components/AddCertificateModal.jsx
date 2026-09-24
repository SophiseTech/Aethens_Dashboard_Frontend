import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Modal, Form, Select, DatePicker, Input, Space, Avatar, Spin, Empty, Row, Col } from "antd";
import { UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { debounce } from "lodash";
import userService from "@services/User";
import courseService from "@services/Course";
import diplomaCourseService from "@services/DiplomaCourse";
import useCertificateStore from "@stores/CertificateStore";
import { formatDate } from "@utils/helper";

const { Option, OptGroup } = Select;

function AddCertificateModal({ visible, onCancel }) {
  const [form] = Form.useForm();
  const { createCertificate, checkDuplicate, actionLoading } = useCertificateStore();

  const [studentOptions, setStudentOptions] = useState([]);
  const [studentMap, setStudentMap] = useState(new Map());
  const [studentLoading, setStudentLoading] = useState(false);

  const [shortTermCourses, setShortTermCourses] = useState([]);
  const [diplomaCourses, setDiplomaCourses] = useState([]);
  const [courseLoading, setCourseLoading] = useState(false);

  const fetchStudents = useCallback(async (queryText = "") => {
    try {
      setStudentLoading(true);
      const searchQuery = (queryText || "").trim() || "A";
      const res = await userService.search(0, 10, { searchQuery });
      const users = res?.users || [];
      setStudentOptions(users);
      setStudentMap((prev) => {
        const next = new Map(prev);
        users.forEach((u) => next.set(u._id, u));
        return next;
      });
    } catch {
      setStudentOptions([]);
    } finally {
      setStudentLoading(false);
    }
  }, []);

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
    if (visible) {
      form.resetFields();
      form.setFieldsValue({
        issue_date: dayjs(),
        status: "issued",
      });
      fetchStudents("");
      loadCourses();
    }
  }, [visible, form, fetchStudents, loadCourses]);

  const handleDebouncedStudentSearch = useMemo(
    () =>
      debounce((searchQuery) => {
        fetchStudents(searchQuery);
      }, 300),
    [fetchStudents]
  );

  const handleStudentSelect = (studentId) => {
    const student = studentMap.get(studentId);
    if (!student) return;

    const assignedCourseId =
      student.details_id?.course_id?._id ||
      student.details_id?.course_id ||
      student.details_id?.course?._id ||
      student.details_id?.course;

    if (assignedCourseId) {
      const matchShort = shortTermCourses.find((c) => c._id === assignedCourseId);
      const matchDiploma = diplomaCourses.find((c) => c._id === assignedCourseId);

      if (matchShort) {
        form.setFieldsValue({ course_id: matchShort._id });
      } else if (matchDiploma) {
        form.setFieldsValue({ course_id: matchDiploma._id });
      }
    }
  };

  const allCourseMap = useMemo(() => {
    const map = new Map();
    shortTermCourses.forEach((c) => {
      map.set(c._id, { id: c._id, name: c.course_name, type: "short_term" });
    });
    diplomaCourses.forEach((c) => {
      map.set(c._id, { id: c._id, name: c.name, type: "diploma" });
    });
    return map;
  }, [shortTermCourses, diplomaCourses]);

  const handleSubmit = async (forceIssue = false) => {
    try {
      const values = await form.validateFields();
      const courseInfo = allCourseMap.get(values.course_id);

      const payload = {
        student_id: values.student_id,
        course_id: values.course_id,
        course_type: courseInfo?.type || "short_term",
        course_name: courseInfo?.name || "N/A",
        issue_date: values.issue_date?.toISOString() || new Date().toISOString(),
        status: values.status || "issued",
        remarks: values.remarks || "",
        forceIssue,
      };

      if (!forceIssue) {
        const dupCheck = await checkDuplicate(payload.student_id, payload.course_id);
        if (dupCheck?.exists) {
          const prev = dupCheck.certificate;
          Modal.confirm({
            title: "Duplicate Certificate Warning",
            content: `A certificate for "${prev?.course_name}" was already issued to this student on ${formatDate(prev?.issue_date)} (Status: ${prev?.status}). Do you want to issue another certificate anyway?`,
            okText: "Yes, Issue Again",
            cancelText: "Cancel",
            okButtonProps: { danger: true },
            onOk: async () => {
              await createCertificate({ ...payload, forceIssue: true });
              onCancel();
            },
          });
          return;
        }
      }

      await createCertificate(payload);
      onCancel();
    } catch {
      // Form validation failure or handled error
    }
  };

  return (
    <Modal
      title="Issue Certificate"
      open={visible}
      onCancel={onCancel}
      onOk={() => handleSubmit(false)}
      okText="Issue Certificate"
      confirmLoading={actionLoading}
      destroyOnClose
      width={560}
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          name="student_id"
          label="Select Student"
          rules={[{ required: true, message: "Please select a student" }]}
        >
          <Select
            showSearch
            placeholder="Type name, admission no., or phone"
            filterOption={false}
            onSearch={handleDebouncedStudentSearch}
            onSelect={handleStudentSelect}
            loading={studentLoading}
            optionLabelProp="label"
            notFoundContent={studentLoading ? <Spin size="small" /> : <Empty />}
          >
            {studentOptions.map((student) => (
              <Option key={student._id} value={student._id} label={student.username}>
                <Space>
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
        </Form.Item>

        <Form.Item
          name="course_id"
          label="Course"
          rules={[{ required: true, message: "Please select a course" }]}
        >
          <Select
            placeholder="Select course"
            loading={courseLoading}
            showSearch
            optionFilterProp="children"
          >
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
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="issue_date"
              label="Issue Date"
              rules={[{ required: true, message: "Please select an issue date" }]}
            >
              <DatePicker className="w-full" format="DD-MMM-YYYY" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: "Please select status" }]}
            >
              <Select placeholder="Select status">
                <Option value="issued">
                  <Space size={8}>
                    <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: "#1677ff" }} />
                    <span>Issued</span>
                  </Space>
                </Option>
                <Option value="printed">
                  <Space size={8}>
                    <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: "#fa8c16" }} />
                    <span>Printed</span>
                  </Space>
                </Option>
                <Option value="delivered">
                  <Space size={8}>
                    <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: "#52c41a" }} />
                    <span>Delivered</span>
                  </Space>
                </Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="remarks" label="Remarks (Optional)">
          <Input.TextArea rows={3} placeholder="Add any optional notes or remarks" maxLength={300} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default AddCertificateModal;
