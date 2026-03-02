import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Input, Button, message, Spin, Card, Space, Divider } from "antd";
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import Title from "@components/layouts/Title";
import newsletterService from "@services/Newsletter";

const { TextArea } = Input;

function EditNewsletter() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [sections, setSections] = useState([]);
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

            // Set sections state
            setSections(newsletter.sections || []);

            // Set form values
            form.setFieldsValue({
                title: newsletter.title,
                author: newsletter.author,
                eventType: newsletter.eventType,
                bannerImageUrl: newsletter.bannerImage?.url || "",
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
            const validSections = sections.filter(s => s.content && s.content.trim());

            // Process tags and sections
            const processedValues = {
                ...values,
                tags: values.tags ? values.tags.split(",").map(tag => tag.trim()).filter(Boolean) : [],
                sections: validSections,
                bannerImage: {
                    url: values.bannerImageUrl || "",
                    caption: values.bannerImageCaption || ""
                }
            };

            // Remove the flattened fields
            delete processedValues.bannerImageUrl;
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
        setSections([...sections, { title: "", content: "", bulletPoints: [], quote: { body: "", author: "" }, image: { url: "", caption: "" } }]);
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
            [parentField]: { ...updatedSections[index][parentField], [childField]: value }
        };
        setSections(updatedSections);
    };

    const updateBulletPoints = (index, value) => {
        const updatedSections = [...sections];
        updatedSections[index] = {
            ...updatedSections[index],
            bulletPoints: value.split("\n").filter(Boolean)
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

                    <Form.Item
                        name="bannerImageUrl"
                        label="Banner Image URL"
                    >
                        <Input placeholder="https://example.com/banner.jpg" />
                    </Form.Item>

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

                                <div>
                                    <label className="block text-sm font-medium mb-1">Bullet Points</label>
                                    <TextArea
                                        placeholder="Enter each bullet point on a new line"
                                        rows={3}
                                        value={section.bulletPoints?.join("\n") || ""}
                                        onChange={(e) => updateBulletPoints(index, e.target.value)}
                                    />
                                </div>

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
