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
} from "@ant-design/icons";
import { formatDate } from "@utils/helper";
import enquiryStore from "@stores/EnquiryStore";
import { useStore } from "zustand";
import EditEnquiryModal from "./EditEnquiryModal";

const { Title, Text } = Typography;
const { TextArea } = Input;

const EnquiryDetailsDrawer = ({ enquiry, visible, onClose, parentPage }) => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isBookSlotModalVisible, setIsBookSlotModalVisible] = useState(false);

  const {
    editEnquiry,
    getEnquiries,
    markDemoCompleted,
    bookDemoSlot,
    getDemoSlots,
  } = useStore(enquiryStore);
  const [form] = Form.useForm();

  const handleEditClick = () => setIsEditModalVisible(true);

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

  const handleMarkCompleted = async () => {
    await markDemoCompleted(enquiry._id, enquiry?.demoSlot?.notes || "");
    await getDemoSlots();
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
          parentPage === "enquiryList" ? (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEditClick}
            >
              Edit
            </Button>
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
              <Title level={4} style={{ marginBottom: 0 }}>
                {enquiry?.name}
              </Title>
              <Text>{enquiry?.ageCategory}</Text>
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

        {/* Demo Slot */}
        {enquiry?.demoSlot && (
          <>
            <Divider />
            <Card bordered={false}>
              <Title level={5}>Demo Slot</Title>
              <Text strong>Scheduled At:</Text>{" "}
              <Text>{formatDate(enquiry?.demoSlot?.scheduledAt)}</Text>
              <br />
              <Text strong>Status:</Text>{" "}
              <Tag color="cyan">{enquiry?.demoSlot?.status}</Tag>
              <br />
              <Text strong>Notes:</Text> <Text>{enquiry?.demoSlot?.notes}</Text>
            </Card>
          </>
        )}

        <Divider />

        {/* Action Buttons Based on Parent Page */}
        {parentPage === "enquiryList" && (
          <Button
            type="primary"
            block
            onClick={() => setIsBookSlotModalVisible(true)}
          >
            Book Demo Slot
          </Button>
        )}

        {parentPage === "slotlist" &&
          enquiry?.demoSlot?.status !== "Completed" && (
            <Button type="primary" danger block onClick={handleMarkCompleted}>
              Mark As Completed
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
    </>
  );
};

export default EnquiryDetailsDrawer;
