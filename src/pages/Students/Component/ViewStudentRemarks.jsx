/* eslint-disable react-hooks/exhaustive-deps */
import { Modal, Button, Typography, Space, Card, List, Empty } from "antd";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import studentService from "@/services/Student";
import { formatDate } from "@utils/helper";

const { Title, Text } = Typography;

function ViewStudentRemarks({ student }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState([]);

  const handleOpen = async () => {
    setOpen(true);
    setLoading(true);

    try {
      // 🔹 Preferred: fetch from backend
      if (studentService.getRemarks) {
        const res = await studentService.getRemarks(student._id);
        setRemarks(res || []);
      } 
      // 🔹 Fallback: read from student object
      else {
        setRemarks(student?.remarks || []);
      }
    } catch (err) {
      console.error(err);
      setRemarks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setRemarks([]);
  };

  return (
    <>
      {/* Button */}
      <Button variant="filled" color="cyan" onClick={handleOpen}>
        View Remarks
      </Button>

      {/* Modal */}
      <Modal
        title={<Title level={4}>Student Remarks</Title>}
        open={open}
        onCancel={handleClose}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Student Info */}
          <Card>
            <Text strong>Student:</Text> <Text>{student.username}</Text>
            <br />
            <Text strong>Course:</Text>{" "}
            <Text>{student.details_id?.course?.course_name || "N/A"}</Text>
          </Card>

          {/* Remarks List */}
          {remarks.length === 0 ? (
            <Empty description="No remarks available" />
          ) : (
            <List
              loading={loading}
              dataSource={remarks}
              itemLayout="vertical"
              renderItem={(item) => (
                <List.Item>
                  <Card>
                    <Text>{item.text || item.remarks}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatDate(item.createdAt)}{" "}
                      {item.createdBy && `• ${item.createdBy.name}`}
                    </Text>
                  </Card>
                </List.Item>
              )}
            />
          )}
        </Space>
      </Modal>
    </>
  );
}

ViewStudentRemarks.propTypes = {
  student: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    username: PropTypes.string,
    remarks: PropTypes.array,
    details_id: PropTypes.object,
  }).isRequired,
};

export default ViewStudentRemarks;
