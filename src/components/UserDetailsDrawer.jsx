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
  Flex,
  Timeline,
  InputNumber,
  Switch,
  Tag,
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
  LoadingOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { formatDate, calculateAge } from "@utils/helper"; // Your date formatting utility
import CustomImageUploadWithCrop from "@components/form/CustomImageUploadWithCrop"; // Added import
import EditUserModal from "./EditUserModal"; // Import the new EditUserModal component
import studentStore from "@stores/StudentStore";
import { useStore } from "zustand";
import { ROLES } from "@utils/constants";
import DrawerActionButtons from "@components/DrawerActionButtons";
import userStore from "@stores/UserStore";
import PropTypes from "prop-types";
import permissions from "@utils/permissions";

const { Title, Text } = Typography;

const UserDetailsDrawer = ({
  user = {},
  visible = false,
  onClose = () => { },
  isStudentDetail = false,
}) => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { editUser } = useStore(studentStore);
  const { user: loggedinUser } = useStore(userStore);
  const [profileImageLoading, setProfileImageLoading] = useState(false);

  const [limits, setLimits] = useState({
    rescheduleLimit: user?.details_id?.rescheduleLimit ?? 4,
    additionalLimit: user?.details_id?.additionalLimit ?? 2,
  });

  useEffect(() => {
    setLimits({
      rescheduleLimit: user?.details_id?.rescheduleLimit ?? 4,
      additionalLimit: user?.details_id?.additionalLimit ?? 2,
    });
  }, [user]);

  const handleLimitChange = (field, value) => {
    setLimits(prev => ({ ...prev, [field]: value }));
  };

  const handleLimitBlur = async (field) => {
    if (limits[field] !== user?.details_id?.[field]) {
      await editUser(user._id, { [field]: limits[field] });
    }
  };

  const handleAllowAdditionalChange = async (checked) => {
    await editUser(user._id, { allow_additional_session_request: checked });
  };

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

  const handleProfileImageUpload = async (newImageUrl) => {
    if (newImageUrl && user?._id) {
      await editUser(user._id, { profile_img: newImageUrl });
      window.location.reload();
    }
  };
  return (
    <>
      <Drawer
        title="User Details"
        placement="right"
        onClose={onClose}
        open={visible}
        width={isStudentDetail && [ROLES.MANAGER, ROLES.ADMIN].includes(loggedinUser.role) ? 750 : 400}
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
          <Flex gap={8}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => setRefreshKey((k) => k + 1)}
            />
            {(!isStudentDetail || loggedinUser.role !== ROLES.FACULTY) &&
              permissions.student.edit.includes(loggedinUser.role) && (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={handleEditClick}
                >
                  Edit
                </Button>
              )}
          </Flex>
        }
      >
        <Row gutter={24}>
          {isStudentDetail && [ROLES.MANAGER, ROLES.ACADEMIC_MANAGER, ROLES.OPERATIONS_MANAGER, ROLES.ADMIN].includes(loggedinUser.role) && (
            <Col span={10}>
              <Card bordered={false} style={{ boxShadow: "none", background: "transparent" }}>
                <Title level={5} style={{ marginBottom: "16px" }}>Limits</Title>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Flex justify="space-between" align="center">
                      <Text strong>Reschedule Limit (Monthly):</Text>
                      <InputNumber
                        min={0}
                        value={limits.rescheduleLimit}
                        onChange={(val) => handleLimitChange('rescheduleLimit', val)}
                        onBlur={() => handleLimitBlur('rescheduleLimit')}
                        onPressEnter={() => handleLimitBlur('rescheduleLimit')}
                      />
                    </Flex>
                  </Col>
                  <Col span={24}>
                    <Flex justify="space-between" align="center">
                      <Text strong>Additional Limit (Weekly):</Text>
                      <InputNumber
                        min={0}
                        value={limits.additionalLimit}
                        onChange={(val) => handleLimitChange('additionalLimit', val)}
                        onBlur={() => handleLimitBlur('additionalLimit')}
                        onPressEnter={() => handleLimitBlur('additionalLimit')}
                      />
                    </Flex>
                  </Col>
                  <Col span={24}>
                    <Flex justify="space-between" align="center">
                      <Text strong>Allow Additional Sessions:</Text>
                      <Switch
                        checked={user?.allow_additional_session_request !== false}
                        onChange={handleAllowAdditionalChange}
                      />
                    </Flex>
                  </Col>
                </Row>
              </Card>
            </Col>
          )}
          <Col span={isStudentDetail && [ROLES.MANAGER, ROLES.ADMIN, ROLES.FACULTY, ROLES.ACADEMIC_MANAGER, ROLES.OPERATIONS_MANAGER].includes(loggedinUser.role) ? 14 : 24}>
            <div key={refreshKey}>
              <Card
                bordered={false}
                style={{ boxShadow: "none", background: "transparent" }}
              >
                <Row align="middle" gutter={16}>
                  <Col>
                    {user?._id === loggedinUser?._id ? (
                      <div className='relative w-fit group'>
                        <CustomImageUploadWithCrop
                          name="profile_img"
                          customUploadButton={<EditOutlined className='group-hover:text-white transition-all text-xl' />}
                          showUploadList={false}
                          listType='text'
                          cropImage
                          squareCrop
                          className="absolute inset-0 z-10 flex items-center justify-center hover:bg-black/50 transition-colors rounded-full hover:text-white cursor-pointer opacity-0 group-hover:opacity-100"
                          path={`uploads/profile_img/${user?._id}`}
                          form={{ setFieldValue: (name, value) => handleProfileImageUpload(value) }}
                          loading={profileImageLoading}
                          setLoading={setProfileImageLoading}
                        />
                        <Avatar
                          size={64}
                          src={user?.profile_img}
                          icon={profileImageLoading ? <LoadingOutlined /> : <UserOutlined />}
                          style={{ backgroundColor: "#87d068" }}
                        />
                      </div>
                    ) : (
                      <Avatar
                        size={64}
                        src={user?.profile_img}
                        icon={<UserOutlined />}
                        style={{ backgroundColor: "#87d068" }}
                      />
                    )}
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
                    <>
                      {[ROLES.MANAGER, ROLES.ADMIN, ROLES.FACULTY, ROLES.ACADEMIC_MANAGER, ROLES.OPERATIONS_MANAGER].includes(loggedinUser.role) && (
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
                      <Col span={24}>
                        <Text strong>
                          <IdcardOutlined style={{ marginRight: "8px" }} />
                          ID Card Number:
                        </Text>
                        <Text style={{ marginLeft: "8px" }}>
                          {user?.details_id?.idCardNumber}
                          {user?.details_id?.idCardStatus === false && <Tag color="error" className="ml-2">Deactivated</Tag>}
                        </Text>
                      </Col>
                    </>
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
            </div>
          </Col>
        </Row>
      </Drawer>
      {(!isStudentDetail || loggedinUser.role !== ROLES.FACULTY) && (
        <EditUserModal
          user={user}
          visible={isEditModalVisible}
          onCancel={() => setIsEditModalVisible(false)}
          onSave={handleSave}
          isStudentDetail={isStudentDetail}
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
