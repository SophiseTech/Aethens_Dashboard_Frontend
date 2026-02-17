import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Input, message, Spin, Typography, Row, Col, Divider } from "antd";
import Title from "@components/layouts/Title";
import CustomForm from "@components/form/CustomForm";
import CustomInput from "@components/form/CustomInput";
import CustomTextArea from "@components/form/CustomTextArea";
import CustomDatePicker from "@components/form/CustomDatePicker";
import CustomSelect from "@components/form/CustomSelect";
import ProfileImageUploader from "@components/ProfileImageUploader";
import usersV2Service from "@services/UsersV2";
import centersService from "@services/Centers";
import { calculateAge } from "@utils/helper";
import dayjs from "dayjs";

const { Text } = Typography;

function EditUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [centers, setCenters] = useState([]);
    const isEditing = id && id !== "new";

    const dobValue = Form.useWatch("DOB", form);

    // Fetch centers on mount
    useEffect(() => {
        centersService.getCenters({}, 0, 200).then((res) => {
            setCenters(res?.centers ?? []);
        });
    }, []);

    // Fetch user data if editing
    useEffect(() => {
        if (isEditing) {
            setLoading(true);
            usersV2Service
                .getById(id)
                .then((user) => {
                    form.setFieldsValue({
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        status: user.status,
                        center_id: user.center_id?._id ?? user.center_id,
                        phone: user.phone,
                        phone_alt: user.phone_alt,
                        address: user.address,
                        DOB: user.DOB ? dayjs(user.DOB) : null,
                        DOJ: user.DOJ ? dayjs(user.DOJ) : null,
                        school_uni_work: user.school_uni_work,
                        profile_img: user.profile_img || "https://app.schoolofathens.art/images/default.jpg",
                    });
                })
                .catch(() => {
                    message.error("Failed to load user details");
                    navigate("/admin/users");
                })
                .finally(() => setLoading(false));
        }
    }, [id, isEditing]);

    const handleSubmit = async (values) => {
        try {
            setSubmitting(true);

            // Format dates
            const formattedDOB = values.DOB?.format("YYYY-MM-DD");
            const formattedDOJ = values.DOJ?.format("YYYY-MM-DD");
            values.DOB = formattedDOB ? new Date(formattedDOB) : null;
            values.DOJ = formattedDOJ ? new Date(formattedDOJ) : null;

            // Remove empty password so backend doesn't overwrite
            if (!values.password) {
                delete values.password;
            }

            if (isEditing) {
                await usersV2Service.update(id, values);
                message.success("User updated successfully");
            } else {
                await usersV2Service.create(values);
                message.success("User created successfully");
            }
            navigate("/admin/users");
        } catch (e) {
            message.error(e?.message || "Request failed");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Title title={isEditing ? "Edit User" : "Add User"}>
                <div className="flex items-center justify-center h-64">
                    <Spin size="large" />
                </div>
            </Title>
        );
    }

    const roleOptions = [
        { value: "student", label: "Student" },
        { value: "faculty", label: "Faculty" },
        { value: "manager", label: "Manager" },
        { value: "admin", label: "Admin" },
    ];

    const statusOptions = [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
    ];

    const centerOptions =
        centers?.map((c) => ({
            value: c._id,
            label: c.center_name || c.location,
        })) ?? [];

    return (
        <Title
            title={isEditing ? "Edit User" : "Add User"}
            button={
                <Button onClick={() => navigate("/admin/users")}>Back to Users</Button>
            }
        >
            <div className="max-w-3xl">
                <CustomForm
                    form={form}
                    action={handleSubmit}
                    resetOnFinish={false}
                    initialValues={{
                        status: "active",
                        profile_img: "https://app.schoolofathens.art/images/default.jpg",
                    }}
                >
                    {/* Profile Image */}
                    <ProfileImageUploader
                        form={form}
                        name="profile_img"
                        path={`uploads/profile_img/${id || "new"}`}
                    />

                    <Divider orientation="left">Account Details</Divider>

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <CustomInput
                                name="username"
                                label="Full Name"
                                placeholder="Enter full name"
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            <CustomInput
                                name="email"
                                label="Email"
                                placeholder="Enter email address"
                                rules={[{ type: "email", message: "Please enter a valid email" }]}
                            />
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="password"
                                label="Password"
                                rules={[
                                    ...(!isEditing
                                        ? [{ required: true, message: "Please enter a password" }]
                                        : []),
                                    { min: 6, message: "Password must be at least 6 characters" },
                                ]}
                                extra={isEditing ? "Leave empty to keep current password" : null}
                            >
                                <Input.Password placeholder={isEditing ? "Enter new password" : "Enter password"} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <CustomSelect
                                name="role"
                                label="Role"
                                placeholder="Select role"
                                options={roleOptions}
                            />
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <CustomSelect
                                name="status"
                                label="Status"
                                placeholder="Select status"
                                options={statusOptions}
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            <CustomSelect
                                name="center_id"
                                label="Center"
                                placeholder="Select center"
                                options={centerOptions}
                            />
                        </Col>
                    </Row>

                    <Divider orientation="left">Personal Details</Divider>

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <CustomDatePicker
                                name="DOB"
                                label="Date of Birth"
                                placeholder="Select DOB"
                                className="w-full"
                                required={false}
                            />
                            {dobValue && (
                                <div className="px-2 py-1 mb-4 bg-stone-100 rounded">
                                    <Text type="secondary">
                                        Calculated Age: <strong>{calculateAge(dobValue.toDate())} years</strong>
                                    </Text>
                                </div>
                            )}
                        </Col>
                        <Col xs={24} md={12}>
                            <CustomDatePicker
                                name="DOJ"
                                label="Date of Joining"
                                placeholder="Select DOJ"
                                className="w-full"
                                required={false}
                            />
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <CustomInput
                                name="phone"
                                label="Mobile Number"
                                placeholder="+91 XXXXXXXXXX"
                                required={false}
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            <CustomInput
                                name="phone_alt"
                                label="Alternate Mobile Number"
                                placeholder="+91 XXXXXXXXXX"
                                required={false}
                            />
                        </Col>
                    </Row>

                    <CustomTextArea
                        name="address"
                        label="Address"
                        placeholder="Enter address"
                        required={false}
                    />

                    <CustomInput
                        name="school_uni_work"
                        label="School / University / Company Name"
                        placeholder="Enter school / university / company name"
                        required={false}
                    />

                    <div className="flex gap-3 mt-4">
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={submitting}
                        >
                            {isEditing ? "Update User" : "Create User"}
                        </Button>
                        <Button onClick={() => navigate("/admin/users")}>Cancel</Button>
                    </div>
                </CustomForm>
            </div>
        </Title>
    );
}

export default EditUser;
