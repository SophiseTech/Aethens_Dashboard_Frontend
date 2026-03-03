import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Input, Button, message, Spin, Card, Space, DatePicker, Upload, Image, Select } from "antd";
import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import debounce from "lodash/debounce";
import Title from "@components/layouts/Title";
import studentOfTheWeekService from "@services/StudentOfTheWeek";
import userService from "@services/User";
import s3Service from "@/services/S3Service";

const { TextArea } = Input;

/**
 * Helper: upload a file to S3 via base64 encoding.
 */
const uploadFileToS3 = async (file, path = "student-of-the-week") => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const fileUrls = await s3Service.uploadFiles({
                    files: [{
                        data: reader.result,
                        fileName: file.name,
                        fileType: file.type,
                        path,
                    }],
                });
                if (!fileUrls || fileUrls.length === 0) throw new Error("Upload failed");
                resolve(fileUrls[0]);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Image upload field with thumbnail preview.
 */
function ImageUploadField({ label, value, onChange, path = "student-of-the-week" }) {
    const [uploading, setUploading] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);

    const handleUpload = async (options) => {
        const { file, onSuccess, onError } = options;
        setUploading(true);
        try {
            const url = await uploadFileToS3(file, path);
            onChange(url);
            onSuccess(url);
            message.success(`${label} uploaded successfully`);
        } catch (err) {
            onError(err);
            message.error(`${label} upload failed`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
                {label} <span className="text-red-500">*</span>
            </label>
            <div className="flex items-start gap-4">
                {value && (
                    <div className="flex-shrink-0">
                        <Image
                            src={value}
                            alt={label}
                            width={100}
                            height={100}
                            style={{ objectFit: "cover", borderRadius: 8, border: "1px solid #d9d9d9" }}
                            preview={{
                                visible: previewOpen,
                                onVisibleChange: setPreviewOpen,
                            }}
                            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwAJhAPkEl0jSAAAAABJRU5ErkJggg=="
                        />
                    </div>
                )}
                <div className="flex flex-col gap-2 flex-1">
                    <Upload
                        accept="image/*"
                        showUploadList={false}
                        customRequest={handleUpload}
                        maxCount={1}
                    >
                        <Button icon={<UploadOutlined />} loading={uploading}>
                            {value ? "Replace Image" : "Upload Image"}
                        </Button>
                    </Upload>
                    <Input
                        placeholder="Or paste image URL"
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                        size="small"
                    />
                </div>
            </div>
        </div>
    );
}

/**
 * Debounce Select for User Search
 */
function DebounceSelect({ fetchOptions, debounceTimeout = 800, ...props }) {
    const [fetching, setFetching] = useState(false);
    const [options, setOptions] = useState([]);
    const fetchRef = useRef(0);

    const loadOptions = useMemo(() => {
        const load = (value) => {
            fetchRef.current += 1;
            const fetchId = fetchRef.current;
            setOptions([]);
            setFetching(true);

            fetchOptions(value).then((newOptions) => {
                if (fetchId !== fetchRef.current) {
                    // for fetch callback order
                    return;
                }
                setOptions(newOptions);
                setFetching(false);
            });
        };

        return debounce(load, debounceTimeout);
    }, [fetchOptions, debounceTimeout]);

    return (
        <Select
            labelInValue
            filterOption={false}
            onSearch={loadOptions}
            showSearch
            notFoundContent={fetching ? <Spin size="small" /> : null}
            {...props}
            options={options}
        />
    );
}

function EditStudentOfTheWeek() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const isEditMode = !!id;

    const [image, setImage] = useState("");
    const [initialUser, setInitialUser] = useState(null);

    useEffect(() => {
        if (isEditMode) {
            fetchEntry();
        }
    }, [id]);

    const fetchEntry = async () => {
        try {
            setLoading(true);
            const res = await studentOfTheWeekService.getById(id);
            const entry = res?.data ?? res;

            setImage(entry.image || "");

            // Pre-fill user data if populated
            const student = entry.student_id;
            let studentValue = null;
            if (student && typeof student === 'object') {
                studentValue = {
                    label: `${student.username || student.name || 'Unknown'} (${student.email || 'No Email'})`,
                    value: student._id
                };
                setInitialUser(studentValue);
            } else if (student) {
                // student_id is a raw string ID (not populated) — show it as fallback
                studentValue = {
                    label: student,
                    value: student
                };
            }

            form.setFieldsValue({
                body: entry.body,
                student_id: studentValue,
                awarded_at: entry.awarded_at ? dayjs(entry.awarded_at) : null,
            });
        } catch (e) {
            message.error("Failed to load entry");
            navigate("/admin/student-of-the-week");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);

            const payload = {
                body: values.body,
                student_id: values.student_id.value, // Extract ID from Select value object
                image,
                awarded_at: values.awarded_at ? values.awarded_at.toISOString() : undefined,
            };

            if (isEditMode) {
                await studentOfTheWeekService.update(id, payload);
                message.success("Updated successfully");
            } else {
                await studentOfTheWeekService.create(payload);
                message.success("Created successfully");
            }

            navigate("/admin/student-of-the-week");
        } catch (e) {
            if (e.errorFields) return;
            message.error(e?.message || "Failed to save");
        } finally {
            setSaving(false);
        }
    };

    // Fetch users for dropdown
    const fetchUserOptions = async (username) => {
        if (!username) return [];
        const users = await userService.searchUsersV2(username, 10);
        return users.map((user) => ({
            label: `${user.username || user.name} (${user.email})`,
            value: user._id,
        }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <div className="mb-6">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate("/admin/student-of-the-week")}
                    className="mb-4"
                >
                    Back to Student of the Week
                </Button>
                <h1 className="text-2xl font-bold">
                    {isEditMode ? "Edit Student of the Week" : "Add Student of the Week"}
                </h1>
            </div>

            <Card>
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="student_id"
                        label="Student"
                        rules={[{ required: true, message: "Please select a student" }]}
                    >
                        <DebounceSelect
                            placeholder="Select a student"
                            fetchOptions={fetchUserOptions}
                            style={{ width: "100%" }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="body"
                        label="Body"
                        rules={[{ required: true, message: "Please enter the body text" }]}
                    >
                        <TextArea rows={4} placeholder="Description or achievement of the student" />
                    </Form.Item>

                    <Form.Item
                        name="awarded_at"
                        label="Awarded At"
                    >
                        <DatePicker className="w-full" />
                    </Form.Item>

                    {/* Student Image */}
                    <ImageUploadField
                        label="Student Image"
                        value={image}
                        onChange={setImage}
                        path="student-of-the-week/images"
                    />

                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                onClick={handleSubmit}
                                loading={saving}
                            >
                                {isEditMode ? "Update" : "Create"}
                            </Button>
                            <Button onClick={() => navigate("/admin/student-of-the-week")}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}

export default EditStudentOfTheWeek;
