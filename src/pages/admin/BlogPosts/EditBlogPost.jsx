import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Input, InputNumber, Switch, Button, message, Spin, Card, Space, Divider, Upload, Image } from "antd";
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import Title from "@components/layouts/Title";
import blogService from "@services/Blog";
import s3Service from "@/services/S3Service";

const { TextArea } = Input;

/**
 * Helper: upload a file to S3 via base64 encoding.
 * Returns the public URL string.
 */
const uploadFileToS3 = async (file, path = "blog-images") => {
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
function ImageUploadField({ label, value, onChange, path = "blog-images" }) {
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

function EditBlogPost() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [sections, setSections] = useState([]);
    const [featuredImage, setFeaturedImage] = useState("");
    const isEditMode = !!id;

    useEffect(() => {
        if (isEditMode) {
            fetchBlogPost();
        }
    }, [id]);

    const fetchBlogPost = async () => {
        try {
            setLoading(true);
            const res = await blogService.getById(id);
            const blog = res?.data ?? res;

            // Set sections state
            setSections(blog.sections || []);

            // Set featured image state
            setFeaturedImage(blog.image || "");

            // Set form values
            form.setFieldsValue({
                title: blog.title,
                author: blog.author,
                authorImage: blog.authorImage,
                slug: blog.slug,
                readTime: blog.readTime,
                is_published: blog.is_published,
                tags: blog.tags?.join(", ") || "",
            });
        } catch (e) {
            message.error("Failed to load blog post");
            navigate("/admin/blog-posts");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);

            // Validate sections - each must have content
            const validSections = sections.filter(s => s.content && s.content.trim());

            // Process tags, sections, and featured image
            const processedValues = {
                ...values,
                image: featuredImage,
                tags: values.tags ? values.tags.split(",").map(tag => tag.trim()).filter(Boolean) : [],
                sections: validSections,
            };

            if (isEditMode) {
                await blogService.update(id, processedValues);
                message.success("Blog post updated successfully");
            } else {
                await blogService.create(processedValues);
                message.success("Blog post created successfully");
            }

            navigate("/admin/blog-posts");
        } catch (e) {
            if (e.errorFields) return; // Validation error
            message.error(e?.message || "Failed to save blog post");
        } finally {
            setSaving(false);
        }
    };

    const addSection = () => {
        setSections([...sections, { title: "", content: "", image: "" }]);
    };

    const removeSection = (index) => {
        setSections(sections.filter((_, i) => i !== index));
    };

    const updateSection = (index, field, value) => {
        const updatedSections = [...sections];
        updatedSections[index] = { ...updatedSections[index], [field]: value };
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
                    onClick={() => navigate("/admin/blog-posts")}
                    className="mb-4"
                >
                    Back to Blog Posts
                </Button>
                <h1 className="text-2xl font-bold">
                    {isEditMode ? "Edit Blog Post" : "Create Blog Post"}
                </h1>
            </div>

            <Card>
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: "Please enter a title" }]}
                    >
                        <Input placeholder="Enter blog title" />
                    </Form.Item>

                    <Form.Item
                        name="slug"
                        label="Slug"
                        rules={[{ required: true, message: "Please enter a slug" }]}
                        extra="URL-friendly version of the title (e.g., my-blog-post)"
                    >
                        <Input placeholder="my-blog-post" />
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
                            name="authorImage"
                            label="Author Image URL"
                        >
                            <Input placeholder="https://example.com/author.jpg" />
                        </Form.Item>
                    </div>

                    <Divider>Featured Image</Divider>
                    <ImageUploadField
                        label="Featured Image"
                        value={featuredImage}
                        onChange={setFeaturedImage}
                        path="blog-images"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="readTime"
                            label="Read Time (minutes)"
                            rules={[{ required: true, message: "Please enter read time" }]}
                        >
                            <InputNumber min={1} className="w-full" placeholder="5" />
                        </Form.Item>

                        <Form.Item
                            name="is_published"
                            label="Published"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="tags"
                        label="Tags"
                        extra="Comma-separated tags (e.g., technology, tutorial, news)"
                    >
                        <Input placeholder="technology, tutorial, news" />
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

                                <div>
                                    <label className="block text-sm font-medium mb-1">Image URL</label>
                                    <Input
                                        placeholder="https://example.com/section-image.jpg"
                                        value={section.image}
                                        onChange={(e) => updateSection(index, "image", e.target.value)}
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
                            <Button onClick={() => navigate("/admin/blog-posts")}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}

export default EditBlogPost;
