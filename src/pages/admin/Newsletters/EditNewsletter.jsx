import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Input, Button, message, Spin, Card, Space, Divider, Upload, Image } from "antd";
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import Title from "@components/layouts/Title";
import newsletterService from "@services/Newsletter";
import s3Service from "@/services/S3Service";

const { TextArea } = Input;

/**
 * Helper: upload a file to S3 via base64 encoding.
 * Returns the public URL string.
 */
const uploadFileToS3 = async (file, path = "newsletter-banners") => {
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
 * Image upload field with S3 upload + thumbnail preview + URL paste fallback.
 */
function ImageUploadField({ label, value, onChange, path = "newsletter-banners" }) {
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
            <label className="block text-sm font-medium mb-2">{label}</label>
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
 * Dynamic bullet-point list: each item gets its own Input row with an add/remove button.
 */
function BulletPointsField({ value = [], onChange }) {
    const addBullet = () => onChange([...value, ""]);

    const updateBullet = (index, text) => {
        const updated = [...value];
        updated[index] = text;
        onChange(updated);
    };

    const removeBullet = (index) => onChange(value.filter((_, i) => i !== index));

    return (
        <div>
            <label className="block text-sm font-medium mb-2">Bullet Points</label>
            <div className="space-y-2">
                {value.map((point, index) => (
                    <div key={index} className="flex gap-2 items-center">
                        <span className="text-gray-400 flex-shrink-0">•</span>
                        <Input
                            placeholder={`Bullet point ${index + 1}`}
                            value={point}
                            onChange={(e) => updateBullet(index, e.target.value)}
                            className="flex-1"
                        />
                        <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => removeBullet(index)}
                        />
                    </div>
                ))}
                <Button
                    type="dashed"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={addBullet}
                >
                    Add Bullet Point
                </Button>
            </div>
        </div>
    );
}

function EditNewsletter() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [sections, setSections] = useState([]);
    const [bannerImageUrl, setBannerImageUrl] = useState("");
    const isEditMode = !!id;

    useEffect(() => {
        if (isEditMode) {
            fetchNewsletter();
        }
    }, [id]);

    const fetchNewsletter = async () => {
        try {
            setLoading(true);
            const res = await newsletterService.getById(id);
            const newsletter = res?.data ?? res;

            // Set sections state (ensure bulletPoints is always an array)
            setSections(
                (newsletter.sections || []).map((s) => ({
                    ...s,
                    bulletPoints: Array.isArray(s.bulletPoints) ? s.bulletPoints : [],
                }))
            );

            // Set banner image state
            setBannerImageUrl(newsletter.bannerImage?.url || "");

            // Set form values
            form.setFieldsValue({
                title: newsletter.title,
                author: newsletter.author,
                eventType: newsletter.eventType,
                bannerImageCaption: newsletter.bannerImage?.caption || "",
                tags: newsletter.tags?.join(", ") || "",
            });
        } catch (e) {
            message.error("Failed to load newsletter");
            navigate("/admin/newsletters");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);

            // Validate sections - each must have content
            const validSections = sections.filter((s) => s.content && s.content.trim());

            const processedValues = {
                ...values,
                tags: values.tags ? values.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
                sections: validSections,
                bannerImage: {
                    url: bannerImageUrl || "",
                    caption: values.bannerImageCaption || "",
                },
            };

            // Remove the flattened caption field (already nested above)
            delete processedValues.bannerImageCaption;

            if (isEditMode) {
                await newsletterService.update(id, processedValues);
                message.success("Newsletter updated successfully");
            } else {
                await newsletterService.create(processedValues);
                message.success("Newsletter created successfully");
            }

            navigate("/admin/newsletters");
        } catch (e) {
            if (e.errorFields) return; // Validation error
            message.error(e?.message || "Failed to save newsletter");
        } finally {
            setSaving(false);
        }
    };

    const addSection = () => {
        setSections([
            ...sections,
            { title: "", content: "", bulletPoints: [], quote: { body: "", author: "" }, image: { url: "", caption: "" } },
        ]);
    };

    const removeSection = (index) => {
        setSections(sections.filter((_, i) => i !== index));
    };

    const updateSection = (index, field, value) => {
        const updatedSections = [...sections];
        updatedSections[index] = { ...updatedSections[index], [field]: value };
        setSections(updatedSections);
    };

    const updateSectionNested = (index, parentField, childField, value) => {
        const updatedSections = [...sections];
        updatedSections[index] = {
            ...updatedSections[index],
            [parentField]: { ...updatedSections[index][parentField], [childField]: value },
        };
        setSections(updatedSections);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate("/admin/newsletters")}
                    className="mb-4"
                >
                    Back to Newsletters
                </Button>
                <h1 className="text-2xl font-bold">
                    {isEditMode ? "Edit Newsletter" : "Create Newsletter"}
                </h1>
            </div>

            <Card>
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: "Please enter a title" }]}
                    >
                        <Input placeholder="Enter newsletter title" />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="author"
                            label="Author"
                            rules={[{ required: true, message: "Please enter author name" }]}
                        >
                            <Input placeholder="Author name" />
                        </Form.Item>

                        <Form.Item
                            name="eventType"
                            label="Event Type"
                        >
                            <Input placeholder="Event type (optional)" />
                        </Form.Item>
                    </div>

                    {/* Banner Image */}
                    <Divider>Banner Image</Divider>
                    <ImageUploadField
                        label="Banner Image"
                        value={bannerImageUrl}
                        onChange={setBannerImageUrl}
                        path="newsletter-banners"
                    />

                    <Form.Item
                        name="bannerImageCaption"
                        label="Banner Image Caption"
                    >
                        <Input placeholder="Caption for banner image" />
                    </Form.Item>

                    <Form.Item
                        name="tags"
                        label="Tags"
                        extra="Comma-separated tags (e.g., event, announcement, news)"
                    >
                        <Input placeholder="event, announcement, news" />
                    </Form.Item>

                    {/* Sections */}
                    <Divider>Sections</Divider>

                    {sections.map((section, index) => (
                        <Card
                            key={index}
                            className="mb-4"
                            title={`Section ${index + 1}`}
                            extra={
                                <Button
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={() => removeSection(index)}
                                >
                                    Remove
                                </Button>
                            }
                        >
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Section Title</label>
                                    <Input
                                        placeholder="Section title (optional)"
                                        value={section.title}
                                        onChange={(e) => updateSection(index, "title", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Content <span className="text-red-500">*</span></label>
                                    <TextArea
                                        placeholder="Section content"
                                        rows={4}
                                        value={section.content}
                                        onChange={(e) => updateSection(index, "content", e.target.value)}
                                    />
                                </div>

                                {/* Bullet Points - dynamic array */}
                                <BulletPointsField
                                    value={section.bulletPoints || []}
                                    onChange={(updated) => updateSection(index, "bulletPoints", updated)}
                                />

                                <Divider orientation="left" plain>Quote (Optional)</Divider>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Quote Body</label>
                                    <TextArea
                                        placeholder="Quote text"
                                        rows={2}
                                        value={section.quote?.body || ""}
                                        onChange={(e) => updateSectionNested(index, "quote", "body", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Quote Author</label>
                                    <Input
                                        placeholder="Author of the quote"
                                        value={section.quote?.author || ""}
                                        onChange={(e) => updateSectionNested(index, "quote", "author", e.target.value)}
                                    />
                                </div>

                                <Divider orientation="left" plain>Image (Optional)</Divider>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Image URL</label>
                                    <Input
                                        placeholder="https://example.com/section-image.jpg"
                                        value={section.image?.url || ""}
                                        onChange={(e) => updateSectionNested(index, "image", "url", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Image Caption</label>
                                    <Input
                                        placeholder="Caption for the image"
                                        value={section.image?.caption || ""}
                                        onChange={(e) => updateSectionNested(index, "image", "caption", e.target.value)}
                                    />
                                </div>
                            </div>
                        </Card>
                    ))}

                    <Button
                        type="dashed"
                        onClick={addSection}
                        icon={<PlusOutlined />}
                        className="w-full mb-6"
                    >
                        Add Section
                    </Button>

                    {/* Action Buttons */}
                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                onClick={handleSubmit}
                                loading={saving}
                            >
                                {isEditMode ? "Update" : "Create"}
                            </Button>
                            <Button onClick={() => navigate("/admin/newsletters")}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}

export default EditNewsletter;
