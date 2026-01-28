import { useState } from "react";
import {
  Drawer,
  Card,
  Avatar,
  Typography,
  Row,
  Col,
  Divider,
  Button,
  Flex,
  Timeline,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  CalendarOutlined,
  EditOutlined,
  PhoneOutlined,
  SwapRightOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { formatDate, calculateAge } from "@utils/helper"; // Your date formatting utility
import EditUserModal from "./EditUserModal"; // Import the new EditUserModal component
import studentStore from "@stores/StudentStore";
import { useStore } from "zustand";
import { ROLES } from "@utils/constants";
import DrawerActionButtons from "@components/DrawerActionButtons";
import userStore from "@stores/UserStore";
import PropTypes from "prop-types";

const { Title, Text } = Typography;

const UserDetailsDrawer = ({
  user = {},
  visible = false,
  onClose = () => { },
  isStudentDetail = false,
}) => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const { editUser } = useStore(studentStore);
  const { user: loggedinUser } = useStore(userStore);
  // Open the edit modal
  const handleEditClick = () => {
    setIsEditModalVisible(true);
  };
  // Handle saving edited user details
  const handleSave = async (values) => {
    console.log("Updated Values:", values);
    // Add your API call or logic to update user details here
    await editUser(user._id, values);
    setIsEditModalVisible(false); // Close the modal
    // message.success('User details updated successfully!');
  };
  return (
    <>
      <Drawer
        title="User Details"
        placement="right"
        onClose={onClose}
        open={visible}
        width={400}
        closable={true}
        styles={{
          header: {
            background: "#f0f2f5",
            borderBottom: "1px solid #e8e8e8",
          },
          body: {
            padding: "20px"
          }
        }}
        extra={
          (!isStudentDetail || loggedinUser.role !== ROLES.FACULTY) && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEditClick}
            >
              Edit
            </Button>
          )
        }
      >
        <Card
          bordered={false}
          style={{ boxShadow: "none", background: "transparent" }}
        >
          <Row align="middle" gutter={16}>
            <Col>
              <Avatar
                size={64}
                src={user?.profile_img}
                icon={<UserOutlined />}
                style={{ backgroundColor: "#87d068" }}
              />
            </Col>
            <Col>
              <Title level={4} style={{ marginBottom: 0 }}>
                {user?.username}
              </Title>
              {(!isStudentDetail ||
                loggedinUser.role === ROLES.MANAGER ||
                loggedinUser.role === ROLES.STUDENT) && (
                  <Text type="secondary">{user?.email}</Text>
                )}
            </Col>
          </Row>
        </Card>

        <Divider style={{ margin: "16px 0" }} />

        <Card
          bordered={false}
          style={{ boxShadow: "none", background: "transparent" }}
        >
          <Title level={5} style={{ marginBottom: "16px" }}>
            Basic Information
          </Title>
          <Row gutter={[16, 16]}>
            {user?.role === ROLES.STUDENT && (
              <Col span={24}>
                <Text strong>
                  <IdcardOutlined style={{ marginRight: "8px" }} />
                  Admission Number:
                </Text>
                <Text style={{ marginLeft: "8px" }}>
                  {user?.details_id?.admissionNumber}
                </Text>
              </Col>
            )}
            {(!isStudentDetail || loggedinUser.role !== ROLES.FACULTY) && (
              <>
                <Col span={24}>
                  <Text strong>
                    <MailOutlined style={{ marginRight: "8px" }} />
                    Email:
                  </Text>
                  <Text style={{ marginLeft: "8px" }}>{user?.email}</Text>
                </Col>
                <Col span={24}>
                  <Flex align="center" gap={2} wrap="wrap">
                    <Text strong>
                      <PhoneOutlined style={{ marginRight: "8px" }} />
                      Mobile Number:
                    </Text>
                    <Flex vertical>
                      <Text style={{ marginLeft: "8px" }}>{user?.phone},</Text>
                      <Text style={{ marginLeft: "8px" }}>
                        {user?.phone_alt}
                      </Text>
                    </Flex>
                  </Flex>
                </Col>
              </>
            )}
            {user?.role === ROLES.STUDENT && (
              <>
                <Col span={24}>
                  <Text strong>
                    <CalendarOutlined style={{ marginRight: "8px" }} />
                    Date Of Birth:
                  </Text>
                  <Text style={{ marginLeft: "8px" }}>
                    {formatDate(user?.DOB) || "N/A"}
                  </Text>
                </Col>
                <Col span={24}>
                  <Text strong>Age:</Text>
                  <Text style={{ marginLeft: "8px" }}>
                    {calculateAge(user?.DOB) ?? "N/A"} years
                  </Text>
                </Col>
              </>
            )}
            <Col span={24}>
              <Text strong>
                <CalendarOutlined style={{ marginRight: "8px" }} />
                Joined Date:
              </Text>
              <Text style={{ marginLeft: "8px" }}>
                {formatDate(user?.DOJ || user?.createdAt) || "N/A"}
              </Text>
            </Col>
          </Row>
        </Card>

        <Divider style={{ margin: "16px 0" }} />

        {user?.role === ROLES.STUDENT && (
          <Card
            bordered={false}
            style={{ boxShadow: "none", background: "transparent" }}
          >
            <Title level={5} style={{ marginBottom: "16px" }}>
              Additional Information
            </Title>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Text strong>Course Enrolled:</Text>
                <Text style={{ marginLeft: "8px" }}>
                  {user?.details_id?.course?.course_name}
                </Text>
              </Col>
              <Col span={24}>
                <Text strong>
                  <CalendarOutlined style={{ marginRight: "8px" }} />
                  Course Joined Date:
                </Text>
                <Text style={{ marginLeft: "8px" }}>
                  {formatDate(user?.details_id?.enrollment_date) || "N/A"}
                </Text>
              </Col>
              {/* <Col span={24}>
              <Text strong>Role:</Text>
              <Text style={{ marginLeft: '8px' }}>{user?.role}</Text>
            </Col> */}
              <Col span={24}>
                <Text strong>Status:</Text>
                <Text
                  style={{ marginLeft: "8px", textTransform: "capitalize" }}
                >
                  {user?.status}
                </Text>
              </Col>
              {user && (
                <Col span={24}>
                  <Text strong>Attendance:</Text>
                  <Text style={{ marginLeft: 8 }}>
                    {user?.attended || 0}/{user?.details_id?.course?.total_session} (
                    {user?.attended || user?.details_id?.course?.total_session
                      ? Math.round(
                        ((user?.attended) /
                          (user?.details_id?.course?.total_session)) *
                        100
                      )
                      : 0}
                    %)
                  </Text>
                </Col>
              )}
            </Row>
          </Card>
        )}

        {isStudentDetail && (
          <Card
            bordered={false}
            style={{ boxShadow: "none", background: "transparent" }}
          >
            <DrawerActionButtons userDetails={user} />
          </Card>
        )}
        {user?.role === ROLES.STUDENT && user?.details_id?.migrated?.history && user?.details_id?.migrated?.history.length > 0 && (
          <>
            <Divider style={{ margin: "16px 0" }} />
            <Card
              bordered={false}
              style={{ boxShadow: "none", background: "transparent" }}
            >
              <Title level={5} style={{ marginBottom: "16px" }}>
                Migration History
              </Title>
              <Timeline
                mode="left"
                items={user.details_id.migrated.history.map((migration, index) => ({
                  color: index === user.details_id.migrated.history.length - 1 ? "green" : "blue",
                  dot: <EnvironmentOutlined style={{ fontSize: '16px' }} />,
                  children: (
                    <div style={{ padding: "4px 0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <Text strong style={{ color: "#1890ff" }}>{migration.fromBranchName || "N/A"}</Text>
                        <SwapRightOutlined style={{ color: "#52c41a" }} />
                        <Text strong style={{ color: "#52c41a" }}>{migration.toBranchName || "N/A"}</Text>
                      </div>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        <CalendarOutlined style={{ marginRight: "4px" }} />
                        {migration.date ? formatDate(migration.date) : "N/A"}
                      </Text>
                    </div>
                  ),
                }))}
              />
            </Card>
          </>
        )}
      </Drawer>
      {(!isStudentDetail || loggedinUser.role !== ROLES.FACULTY) && (
        <EditUserModal
          user={user}
          visible={isEditModalVisible}
          onCancel={() => setIsEditModalVisible(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
};

UserDetailsDrawer.propTypes = {
  user: PropTypes.object,
  visible: PropTypes.bool,
  onClose: PropTypes.func,
  showActions: PropTypes.bool,
  isStudentDetail: PropTypes.bool,
};

export default UserDetailsDrawer;
