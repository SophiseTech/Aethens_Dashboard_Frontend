import { useState, useEffect } from "react";
import {
  Drawer,
  Card,
  Avatar,
  Typography,
  Row,
  Col,
  Divider,
  Button,
  Tag,
  Modal,
  Form,
  DatePicker,
  Input,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  EditOutlined,
  CalendarOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { formatDate } from "@utils/helper";
import enquiryStore from "@stores/EnquiryStore";
import { useStore } from "zustand";
import EditEnquiryModal from "./EditEnquiryModal";
import CloseEnquiryModal from './CloseEnquiryModal';
import { age_categories } from "@utils/constants";
import BranchTransferCard from "@pages/Enquiries/Component/BranchTranserCard";
import CustomSelect from "@components/form/CustomSelect";

const { Title, Text } = Typography;
const { TextArea } = Input;

const EnquiryDetailsDrawer = ({ enquiry, visible, onClose, parentPage }) => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isBookSlotModalVisible, setIsBookSlotModalVisible] = useState(false);
  const [isCloseModalVisible, setIsCloseModalVisible] = useState(false);
  const [isFollowUpVisible,setFollowUpVisible] = useState(false);
  const [isReschduleSlot,setReschduleSlot] = useState(false);
  const [isEnrolled,setEnrolled] = useState(false);

  const {
    editEnquiry,
    getEnquiries,
    markDemoCompleted,
    bookDemoSlot,
    addfollowUpDate,
    rescheduleSlot,
    enrollStudent
  } = useStore(enquiryStore);
  const [form] = Form.useForm();

  const isClosed = (enquiry?.stage === 'Closed' || enquiry?.state === 'Closed');

  const handleEditClick = () => setIsEditModalVisible(true);
  const handleCloseClick = () => setIsCloseModalVisible(true);

  const handleSave = async (values) => {
    const updateData = {
      ...values,
      selectedCourses: values.selectedCourses,
    };
    await editEnquiry(enquiry._id, updateData);
    await getEnquiries(10, 1);
    setIsEditModalVisible(false);
    onClose();
  };

  // Book Demo Slot Submit
  const handleBookSlot = async () => {
    form.validateFields().then(async (values) => {
      const updateData = {
        scheduledAt: values.scheduledAt.toISOString(),
        notes: values.notes,
      };
      await bookDemoSlot(enquiry._id, updateData);
      setIsBookSlotModalVisible(false);
      await getEnquiries(10, 1);
      onClose();
    });
  };

  //Change Follow Up Date
  const handleFollowUp = async () => {
    form.validateFields().then(async (values) => {
      const updatedData = {
        followUpDate : values.followUpDate.toISOString(),
        remarks : values.remarks,
        reason : values.reason
      };
      await addfollowUpDate(enquiry._id,updatedData);
      setFollowUpVisible(false);
      await getEnquiries(10, 1);
      onClose();
    })
  }

  // Reschedule Slot
  const handleRescheduleSlot = async () => {
     form.validateFields().then(async (values) => {
      const updatedData = {
        scheduledAt : values.scheduledAt.toISOString(),
        remarks : values.remarks,
        reason : values.reason
      };
      await rescheduleSlot(enquiry._id,updatedData);
      setReschduleSlot(false);
      await getEnquiries(10, 1);
      onClose();
    })
  }

  const handleEnrollSlot = async () => {
    form.validateFields().then(async (values) => {
      const updatedData = {
        enrollmentDate : values.enrollmentDate.toISOString(),
        enrollmentCourse : values.enrollmentCourse
      };
      await enrollStudent(enquiry._id,updatedData);
      setReschduleSlot(false);
      await getEnquiries(10, 1);
      onClose();
    })
  }

  const handleMarkCompleted = async () => {
    await markDemoCompleted(enquiry._id, enquiry?.demoSlot?.notes || "");
    await getEnquiries(10,1);
    onClose();
  };

  return (
    <>
      <Drawer
        title="Enquiry Details"
        placement="right"
        open={visible}
        onClose={onClose}
        width={420}
        headerStyle={{ background: "#f0f2f5" }}
        bodyStyle={{ padding: 20 }}
        extra={
          parentPage === "enquiryList" && !isClosed ? (
            <div className="flex gap-2">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEditClick}
              >
                Edit
              </Button>
              <Button
                variant="solid"
                color="danger"
                icon={<DeleteOutlined />}
                onClick={handleCloseClick}
              >
                Close
              </Button>
            </div>
          ) : null
        }
      >
        {/* Header */}
        <Card bordered={false}>
          <Row align="middle" gutter={16}>
            <Col>
              <Avatar
                size={64}
                icon={<UserOutlined />}
                style={{ backgroundColor: "#87d068" }}
              />
            </Col>
            <Col>
              <Title level={4} style={{ marginBottom: 0 }} className="flex items-center">
                {enquiry?.name}
                {enquiry?.isTransferred && (<Tag style={{ marginLeft: 8 }} color="blue">Transferred</Tag>)}
              </Title>
              <Text>Enquiry No: {enquiry?.enquiryNumber}</Text><br />
              <Text>{age_categories.find(item => item.value == enquiry?.ageCategory)?.label}</Text>
            </Col>
          </Row>
        </Card>

        <Divider />

        {/* Basic Information */}
        <Card bordered={false}>
          <Title level={5}>Basic Information</Title>
          <Row gutter={[16, 12]}>
            <Col span={24}>
              <Text strong>
                <PhoneOutlined /> Phone:
              </Text>{" "}
              <Text>{enquiry?.phoneNumber || "N/A"}</Text>
            </Col>

            <Col span={24}>
              <Text strong>Found Us By:</Text> <Text>{enquiry?.foundUsBy}</Text>
            </Col>
            <Col span={24}>
              <Text strong>Mode:</Text> <Text>{enquiry?.modeOfEnquiry}</Text>
            </Col>

            <Col span={24}>
              <Text strong>Status:</Text>{" "}
              <Tag color="blue">{enquiry?.stage}</Tag>
            </Col>

            <Col span={24}>
              <Text strong>
                <CalendarOutlined /> Created:
              </Text>{" "}
              <Text>{formatDate(enquiry?.createdAt)}</Text>
            </Col>
          </Row>
        </Card>

        <Divider />

        {/* Courses */}
        <Card bordered={false}>
          <Title level={5}>Courses Interested</Title>
          {enquiry?.selectedCourses?.map((c) => (
            <Tag key={c._id} color="purple" style={{ marginBottom: 6 }}>
              {c.course_name}
            </Tag>
          ))}
        </Card>

        <Divider />

        {/* Enrolled Student Details */}
        {enquiry?.stage === "Enrolled" && (
          <>
          <Card>
            <Title level={5}>Enrolled Details</Title>
            <Text strong>Enrolled Course : </Text>{" "} <Text>{enquiry?.enrollmentCourse}</Text>
            <br />
            <Text strong>Enrolled Date : </Text>{" "}
            <Text>{(formatDate(enquiry?.enrollmentDate))}</Text>
          </Card>
          </>
        )}

        {/* Demo Slot */}
        {enquiry?.demoSlot && enquiry?.stage === "Demo" && (
          <>
            {enquiry.demoSlotHistory?.length > 0 && (
              <Card bordered={false}>
                <Title level={5}>Demo Slot</Title>
                <Text strong>Scheduled At:</Text>{" "}
                <Text>{formatDate(enquiry?.demoSlot?.scheduledAt)}</Text>
                <br />
                <Text strong>Status:</Text>{" "}
                <Tag color="cyan">{enquiry?.demoSlot?.status}</Tag>
                <br />
                <Text strong>Notes:</Text>{" "}
                <Text>{enquiry?.demoSlot?.notes}</Text>
                <br />
                {enquiry?.demoSlotHistory.map((item, index) => (
                  <Card key={item._id || index} className="mb-2">
                    <Title level={5}>Date : {item?.scheduledAt}</Title>
                    <Text strong>Reason : </Text>{" "}
                    <Text>{item?.reason || "-"}</Text>
                    <br />
                    <Text strong>Remarks:</Text>{" "}
                    <Text>{item?.remarks || "-"}</Text>
                  </Card>
                ))}
              </Card>
            )}
          </>
        )}

        {/* Follow Up Details for new state */}
        {parentPage === "enquiryList" && enquiry?.stage === "New" && (
          <>
            {enquiry?.followUpHistory?.length > 0 && (
              <Card>
                <Title level={5}>Follow Up's</Title>

                {enquiry?.followUpDate && (
                  <>
                    <Text strong>Next Follow Up Date : </Text>
                    <Text>{formatDate(enquiry.followUpDate)}</Text>
                    <br />
                  </>
                )}

                {enquiry?.followUpRemarks && (
                  <>
                    <Text strong>Remarks:</Text>{" "}
                    <Text>{enquiry.followUpRemarks}</Text>
                    <br />
                  </>
                )}

                {enquiry?.followUpHistory.map((item, index) => (
                  <Card key={item._id || index} className="mb-2">
                    <Title level={5}>
                      Date :{" "}
                      {item?.followUpDate ? formatDate(item.followUpDate) : "-"}
                    </Title>
                    <Text strong>Remarks:</Text>{" "}
                    <Text>{item?.remarks || "-"}</Text>
                    <br />
                    <Text strong>Reason:</Text>{" "}
                    <Text>{item?.reason || "-"}</Text>
                  </Card>
                ))}
              </Card>
            )}
          </>
        )}

        <Divider />

        <BranchTransferCard
          formatDate={formatDate}
          transfers={enquiry?.centerTransfers}
        />

        <Divider />

        {/* Action Buttons Based on Parent Page */}
        {/* Case where enquiry is in new and not changed to demo */}
        {parentPage === "enquiryList" && enquiry?.stage === "New" && (
          <div className="flex gap-2 items-center">
            <Button
              type="primary"
              danger
              onClick={() => setFollowUpVisible(true)}
            >
              Change Follow Up Date
            </Button>
            <Button
              type="primary"
              onClick={() => setIsBookSlotModalVisible(true)}
            >
              Book Demo Slot
            </Button>
          </div>
        )}

        {/* case where item is in demo state */}
        {(parentPage === "slotlist" || parentPage === "enquiryList") &&
          enquiry?.stage === "Demo" &&
          enquiry?.demoSlot?.status !== "Completed" && (
            <div className="flex gap-2 items-center">
              <Button type="primary" onClick={() => setReschduleSlot(true)}>
                Reschedule Slot
              </Button>
              <Button type="primary" danger onClick={handleMarkCompleted}>
                Mark As Completed
              </Button>
            </div>
          )}

        {/* case where demo is completed */}
        {(parentPage === "slotlist" || parentPage === "enquiryList") &&
          enquiry?.stage === "Demo" &&
          enquiry?.demoSlot?.status === "Completed" && (
            <Button type="primary" block onClick={() => setEnrolled(true)}>
              Enroll Student
            </Button>
          )}
      </Drawer>

      {/* Edit Modal */}
      <EditEnquiryModal
        enquiry={enquiry}
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onSave={handleSave}
      />

      {/* Follow Up Date Modal */}
      <Modal
        title="Change Follow Up Date"
        open={isFollowUpVisible}
        onCancel={() => setFollowUpVisible(false)}
        onOk={handleFollowUp}
        okText="Confirm"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="followUpDate"
            label="Postpond Date & Time"
            rules={[{ required: true }]}
          >
            <DatePicker showTime className="w-full" />
          </Form.Item>

          <Form.Item name="reason" label="Reason" rules={[{ required: true }]}>
            <TextArea rows={3} placeholder="Reason to postpond" />
          </Form.Item>

          <Form.Item name="remarks" label="Remarks">
            <TextArea rows={3} placeholder="Extra notes if any" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Reschedule Slot Modal */}
      <Modal
        title="Reschedule Enquiry Slot"
        open={isReschduleSlot}
        onCancel={() => setReschduleSlot(false)}
        onOk={handleRescheduleSlot}
        okText="Confirm"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="scheduledAt"
            label="Reschedule Date & Time"
            rules={[{ required: true }]}
          >
            <DatePicker showTime className="w-full" />
          </Form.Item>

          <Form.Item name="reason" label="Reason" rules={[{ required: true }]}>
            <TextArea rows={3} placeholder="Reason to reschedule" />
          </Form.Item>

          <Form.Item name="remarks" label="Remarks">
            <TextArea rows={3} placeholder="Extra remarks if any" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Enroll Slot Modal */}
      <Modal
        title="Enroll Slot for Student"
        open={isEnrolled}
        onCancel={() => setEnrolled(false)}
        onOk={handleEnrollSlot}
        okText="Confirm"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="enrollmentDate"
            label="Enrollment Date"
            rules={[{ required: true }]}
          >
            <DatePicker showTime className="w-full" />
          </Form.Item>

          <Form.Item
            name="enrollmentCourse"
            label="Enrolled Course"
            rules={[{ required: true }]}
          >
            <CustomSelect
              options={enquiry?.selectedCourses?.map((c) => ({
                label: c.course_name,
                value: c.course_name,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Book Demo Slot Modal */}
      <Modal
        title="Book Demo Slot"
        open={isBookSlotModalVisible}
        onCancel={() => setIsBookSlotModalVisible(false)}
        onOk={handleBookSlot}
        okText="Confirm"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="scheduledAt"
            label="Schedule Date & Time"
            rules={[{ required: true }]}
          >
            <DatePicker showTime className="w-full" />
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <TextArea rows={3} placeholder="Extra notes if any" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Close Enquiry Modal */}
      <CloseEnquiryModal
        visible={isCloseModalVisible}
        onCancel={() => {
          setIsCloseModalVisible(false);
          onClose();
        }}
        enquiry={enquiry}
      />
    </>
  );
};

export default EnquiryDetailsDrawer;
