/* eslint-disable react-hooks/exhaustive-deps */
import { Modal, Button, Typography, Space, Card, Input, message } from "antd";
import { useState } from "react";
import PropTypes from "prop-types";
import studentService from "@/services/Student";
import { isUserActive } from "@utils/helper";

const { Title, Text } = Typography;
const { TextArea } = Input;

function AddStudentRemarks({ student }) {
  const [open, setOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  const handleClose = () => {
    setOpen(false);
    setRemarks("");
  };

  const handleSave = async () => {
    if (!remarks.trim()) {
      message.warning("Please enter remarks");
      return;
    }

    try {
      setSaving(true);
      await studentService.addRemarks(student._id, { remarks });
      message.success("Remarks added successfully");
      handleClose();
    } catch (err) {
      console.error(err);
      message.error("Failed to save remarks");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Button */}
      <Button
        variant="filled"
        color="blue"
        onClick={() => setOpen(true)}
        disabled={!isUserActive(student)}
      >
        Add Remarks
      </Button>

      {/* Modal */}
      <Modal
        title={<Title level={4}>Add Remarks</Title>}
        open={open}
        onCancel={handleClose}
        onOk={handleSave}
        okText="Save"
        confirmLoading={saving}
        destroyOnClose
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Card>
            <Text strong>Student:</Text> <Text>{student.username}</Text>
            <br />
            <Text strong>Current Course:</Text>{" "}
            <Text>{student.details_id?.course?.course_name || "N/A"}</Text>
          </Card>

          <TextArea
            rows={4}
            placeholder="Enter remarks about the student..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            maxLength={500}
            showCount
          />
        </Space>
      </Modal>
    </>
  );
}

AddStudentRemarks.propTypes = {
  student: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    username: PropTypes.string,
    details_id: PropTypes.object,
  }).isRequired,
};

export default AddStudentRemarks;
