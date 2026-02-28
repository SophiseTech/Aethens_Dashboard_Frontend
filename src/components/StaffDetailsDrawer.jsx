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
} from "@ant-design/icons";
import { formatDate } from "@utils/helper";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useStore } from "zustand";
import userStore from "@stores/UserStore";
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

            {/* Action Buttons */}
            <StaffDrawerActionButtons user={user} />
        </Drawer>
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

StaffDrawerActionButtons.propTypes = {
    user: PropTypes.object,
};

export default StaffDetailsDrawer;
