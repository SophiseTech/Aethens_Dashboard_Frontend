import { useState, useEffect, useCallback } from "react";
import {
    Drawer,
    Card,
    Avatar,
    Typography,
    Row,
    Col,
    Divider,
    Flex,
    Tag,
    Button,
    Modal,
    InputNumber,
} from "antd";
import {
    UserOutlined,
    MailOutlined,
    CalendarOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    FileTextOutlined,
    ClockCircleOutlined,
    CalendarFilled,
    ThunderboltOutlined,
    IdcardOutlined,
} from "@ant-design/icons";
import { formatDate } from "@utils/helper";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useStore } from "zustand";
import userStore from "@stores/UserStore";
import facultyAssignmentStore from "@stores/FacultyAssignmentStore";
import { ROLES } from "@utils/constants";


const { Title, Text } = Typography;

const StaffDetailsDrawer = ({
    user = {},
    visible = false,
    onClose = () => { },
}) => {
    return (
        <Drawer
            title="Staff Details"
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
                            style={{ backgroundColor: "#1890ff" }}
                        />
                    </Col>
                    <Col>
                        <Title level={4} style={{ marginBottom: 0 }}>
                            {user?.username}
                        </Title>
                        <Text type="secondary">{user?.email}</Text>
                    </Col>
                </Row>
            </Card>

            <Divider style={{ margin: "16px 0" }} />

            <Card
                bordered={false}
                style={{ boxShadow: "none", background: "transparent" }}
            >
                <Title level={5} style={{ marginBottom: "16px" }}>
                    Contact Information
                </Title>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Text strong>
                            <MailOutlined style={{ marginRight: "8px" }} />
                            Email:
                        </Text>
                        <Text style={{ marginLeft: "8px" }}>{user?.email || "N/A"}</Text>
                    </Col>
                    <Col span={24}>
                        <Flex align="center" gap={2} wrap="wrap">
                            <Text strong>
                                <PhoneOutlined style={{ marginRight: "8px" }} />
                                Mobile Number:
                            </Text>
                            <Flex vertical>
                                <Text style={{ marginLeft: "8px" }}>{user?.phone || "N/A"}{user?.phone_alt ? "," : ""}</Text>
                                {user?.phone_alt && (
                                    <Text style={{ marginLeft: "8px" }}>
                                        {user?.phone_alt}
                                    </Text>
                                )}
                            </Flex>
                        </Flex>
                    </Col>
                </Row>
            </Card>

            <Divider style={{ margin: "16px 0" }} />

            <Card
                bordered={false}
                style={{ boxShadow: "none", background: "transparent" }}
            >
                <Title level={5} style={{ marginBottom: "16px" }}>
                    Employment Details
                </Title>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Text strong>
                            <IdcardOutlined style={{ marginRight: "8px" }} />
                            ID Card Number:
                        </Text>
                        <Text style={{ marginLeft: "8px" }}>
                            {user?.details_id?.idCardNumber || "—"}
                        </Text>
                    </Col>
                    <Col span={24}>
                        <Text strong>Role:</Text>
                        <Tag color="blue" style={{ marginLeft: "8px" }}>
                            {user?.role || "N/A"}
                        </Tag>
                    </Col>
                    <Col span={24}>
                        <Text strong>Status:</Text>
                        <Tag color={user?.status === "active" ? "green" : "default"} style={{ marginLeft: "8px", textTransform: "capitalize" }}>
                            {user?.status || "N/A"}
                        </Tag>
                    </Col>
                    <Col span={24}>
                        <Text strong>
                            <EnvironmentOutlined style={{ marginRight: "8px" }} />
                            Center:
                        </Text>
                        <Text style={{ marginLeft: "8px" }}>
                            {user?.center_id?.center_name || user?.center_id || "—"}
                        </Text>
                    </Col>
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

            {/* Faculty Assignment Info */}
            {user?.role === ROLES.FACULTY && (
                <FacultyAssignmentSection user={user} visible={visible} />
            )}

            {/* Action Buttons */}
            <StaffDrawerActionButtons user={user} />
        </Drawer>
    );
};

const FacultyAssignmentSection = ({ user, visible }) => {
    const { user: loggedInUser } = useStore(userStore);
    const { facultyStats, getFacultyStats, updateFacultyCap, submitLoading } = useStore(facultyAssignmentStore);
    const [capModalOpen, setCapModalOpen] = useState(false);
    const [dailyAssignmentCap, setDailyAssignmentCap] = useState(0);

    const canEditCap = [
        ROLES.ADMIN,
        ROLES.MANAGER,
        ROLES.OPERATIONS_MANAGER,
        ROLES.ACADEMIC_MANAGER,
    ].includes(loggedInUser?.role);

    const fetchStats = useCallback(() => {
        const centerId = user?.center_id?._id || user?.center_id || "all";
        getFacultyStats(centerId);
    }, [user, getFacultyStats]);

    useEffect(() => {
        if (visible && user?._id) fetchStats();
    }, [visible, user?._id, fetchStats]);

    const stats = (facultyStats || []).find((s) => s._id === user?._id);

    const openModal = () => {
        setDailyAssignmentCap(stats?.dailyAssignmentCap ?? user?.details_id?.dailyAssignmentCap ?? 0);
        setCapModalOpen(true);
    };

    const handleCapUpdate = async () => {
        const centerId = user?.center_id?._id || user?.center_id;
        const response = await updateFacultyCap(user._id, dailyAssignmentCap, centerId);
        if (response) setCapModalOpen(false);
    };

    return (
        <>
            <Divider style={{ margin: "16px 0" }} />
            <Card bordered={false} style={{ boxShadow: "none", background: "transparent" }}>
                <Flex justify="space-between" align="center" style={{ marginBottom: "16px" }}>
                    <Typography.Title level={5} style={{ margin: 0 }}>
                        <ThunderboltOutlined style={{ marginRight: 8 }} />
                        Assignment Info
                    </Typography.Title>
                    {canEditCap && (
                        <Button size="small" onClick={openModal}>
                            Edit Cap
                        </Button>
                    )}
                </Flex>
                <Row gutter={[16, 12]}>
                    <Col span={24}>
                        <Typography.Text strong>Daily Assignment Cap: </Typography.Text>
                        <Typography.Text>{stats?.dailyAssignmentCap ?? 0}</Typography.Text>
                    </Col>
                    <Col span={24}>
                        <Typography.Text strong>This Session: </Typography.Text>
                        <Tag color="blue">{stats?.assignedCount ?? 0} students</Tag>
                    </Col>
                    <Col span={24}>
                        <Typography.Text strong>Assigned Today: </Typography.Text>
                        <Tag color="geekblue">{stats?.dailyAssignedCount ?? 0} students</Tag>
                    </Col>
                </Row>
            </Card>
            <Modal
                title={`Update Cap: ${user?.username}`}
                open={capModalOpen}
                onOk={handleCapUpdate}
                onCancel={() => setCapModalOpen(false)}
                confirmLoading={submitLoading}
            >
                <Flex vertical gap={12}>
                    <div>Set the maximum number of students this faculty can receive from attendance auto-assignment in one day.</div>
                    <InputNumber
                        min={0}
                        style={{ width: "100%" }}
                        value={dailyAssignmentCap}
                        onChange={(value) => setDailyAssignmentCap(Number(value || 0))}
                    />
                </Flex>
            </Modal>
        </>
    );
};

const StaffDrawerActionButtons = ({ user }) => {
    const { user: loggedInUser } = useStore(userStore);
    const nav = useNavigate();
    const role = loggedInUser?.role;

    // Only Admin and Operations Manager can see drawer action buttons
    if (role !== ROLES.ADMIN && role !== ROLES.OPERATIONS_MANAGER) return null;

    // "View Attendance" is only relevant if the staff being viewed is a faculty member
    const staffIsFaculty = user?.role === ROLES.FACULTY;

    // Admins navigate to /admin routes; Operations Managers use /manager routes
    const isAdmin = role === ROLES.ADMIN;

    const handleViewPayslips = () => {
        const base = isAdmin ? "/admin/payslips" : "/manager/payslips";
        nav(`${base}?user_id=${user._id}`);
    };

    const handleViewAttendance = () => {
        const base = isAdmin ? "/admin/faculty-attendance" : "/manager/staff-attendance";
        nav(`${base}?user_id=${user._id}`);
    };

    const handleViewLeaves = () => {
        const base = isAdmin ? "/admin/manage-leaves" : "/manager/staff-leaves";
        nav(`${base}?user_id=${user._id}`);
    };

    return (
        <>
            <Divider style={{ margin: "16px 0" }} />
            <Card
                bordered={false}
                style={{ boxShadow: "none", background: "transparent" }}
            >
                <Title level={5} style={{ marginBottom: "16px" }}>
                    Quick Actions
                </Title>
                <Flex wrap gap={10}>
                    <Button
                        onClick={handleViewPayslips}
                        variant="filled"
                        color="green"
                        icon={<FileTextOutlined />}
                    >
                        View Payslips
                    </Button>
                    {staffIsFaculty && (
                        <Button
                            onClick={handleViewAttendance}
                            variant="filled"
                            color="orange"
                            icon={<ClockCircleOutlined />}
                        >
                            View Attendance
                        </Button>
                    )}
                    <Button
                        onClick={handleViewLeaves}
                        variant="filled"
                        color="purple"
                        icon={<CalendarFilled />}
                    >
                        View Leaves
                    </Button>
                </Flex>
            </Card>
        </>
    );
};

StaffDetailsDrawer.propTypes = {
    user: PropTypes.object,
    visible: PropTypes.bool,
    onClose: PropTypes.func,
};

FacultyAssignmentSection.propTypes = {
    user: PropTypes.object,
    visible: PropTypes.bool,
};

StaffDrawerActionButtons.propTypes = {
    user: PropTypes.object,
};

export default StaffDetailsDrawer;
