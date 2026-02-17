import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Input, InputNumber, Switch, Button, message, Spin, Card, Space, Divider } from "antd";
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import Title from "@components/layouts/Title";
import blogService from "@services/Blog";

const { TextArea } = Input;

function EditBlogPost() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [sections, setSections] = useState([]);
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

            // Set form values
            form.setFieldsValue({
                title: blog.title,
                author: blog.author,
                authorImage: blog.authorImage,
                slug: blog.slug,
                readTime: blog.readTime,
                image: blog.image,
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

            // Process tags and sections
            const processedValues = {
                ...values,
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

                    <Form.Item
                        name="image"
                        label="Featured Image URL"
                    >
                        <Input placeholder="https://example.com/image.jpg" />
                    </Form.Item>

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
