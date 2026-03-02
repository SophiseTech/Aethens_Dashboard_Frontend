import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Input, InputNumber, Button, message, Spin, Card, Space, Divider, Upload, Image } from "antd";
import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import Title from "@components/layouts/Title";
import shopItemService from "@services/ShopItem";
import s3Service from "@/services/S3Service";

const { TextArea } = Input;

/**
 * Helper: upload a file to S3 via base64 encoding.
 * Returns the public URL string.
 */
const uploadFileToS3 = async (file, path = "shop-items") => {
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
function ImageUploadField({ label, value, onChange, path = "shop-items" }) {
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


function EditShopItem() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const isEditMode = !!id;

    const [artImage, setArtImage] = useState("");

    useEffect(() => {
        if (isEditMode) {
            fetchShopItem();
        }
    }, [id]);

    const fetchShopItem = async () => {
        try {
            setLoading(true);
            const res = await shopItemService.getById(id);
            const item = res?.data ?? res;

            setArtImage(item.artImage || "");

            form.setFieldsValue({
                title: item.title,
                slug: item.slug,
                artist: item.artist,
                price: item.price,
                yearPublished: item.yearPublished,
                size: item.size,
                subject: item.subject,
                description: item.description,
                tags: item.tags?.join(", ") || "",
            });
        } catch (e) {
            message.error("Failed to load shop item");
            navigate("/admin/shop-items");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);

            const payload = {
                title: values.title,
                slug: values.slug,
                artist: values.artist,
                price: values.price,
                yearPublished: values.yearPublished,
                size: values.size,
                subject: values.subject,
                description: values.description,
                tags: values.tags ? values.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
                artImage,
            };

            if (isEditMode) {
                await shopItemService.update(id, payload);
                message.success("Shop item updated successfully");
            } else {
                await shopItemService.create(payload);
                message.success("Shop item created successfully");
            }

            navigate("/admin/shop-items");
        } catch (e) {
            if (e.errorFields) return;
            message.error(e?.message || "Failed to save shop item");
        } finally {
            setSaving(false);
        }
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
                    onClick={() => navigate("/admin/shop-items")}
                    className="mb-4"
                >
                    Back to Shop Items
                </Button>
                <h1 className="text-2xl font-bold">
                    {isEditMode ? "Edit Shop Item" : "Create Shop Item"}
                </h1>
            </div>

            <Card>
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: "Please enter a title" }]}
                    >
                        <Input placeholder="Enter shop item title" />
                    </Form.Item>

                    <Form.Item
                        name="slug"
                        label="Slug"
                        rules={[{ required: true, message: "Please enter a slug" }]}
                        extra="URL-friendly identifier (e.g., my-shop-item)"
                    >
                        <Input placeholder="my-shop-item" />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="artist"
                            label="Artist"
                            rules={[{ required: true, message: "Please enter artist name" }]}
                        >
                            <Input placeholder="Artist name" />
                        </Form.Item>

                        <Form.Item
                            name="subject"
                            label="Subject"
                            rules={[{ required: true, message: "Please enter a subject" }]}
                        >
                            <Input placeholder="e.g., Landscape, Portrait" />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <Form.Item
                            name="price"
                            label="Price (₹)"
                            rules={[{ required: true, message: "Please enter a price" }]}
                        >
                            <InputNumber min={0} className="w-full" placeholder="0" />
                        </Form.Item>

                        <Form.Item
                            name="yearPublished"
                            label="Year Published"
                            rules={[{ required: true, message: "Please enter year" }]}
                        >
                            <InputNumber min={1900} max={2100} className="w-full" placeholder="2024" />
                        </Form.Item>

                        <Form.Item
                            name="size"
                            label="Size"
                            rules={[{ required: true, message: "Please enter size" }]}
                        >
                            <Input placeholder='e.g., 24" x 36"' />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <TextArea rows={3} placeholder="Description of the shop item" />
                    </Form.Item>

                    <Form.Item
                        name="tags"
                        label="Tags"
                        extra="Comma-separated tags (e.g., painting, oil, landscape)"
                    >
                        <Input placeholder="painting, oil, landscape" />
                    </Form.Item>

                    {/* Art Image */}
                    <Divider>Image</Divider>
                    <ImageUploadField
                        label="Art Image"
                        value={artImage}
                        onChange={setArtImage}
                        path="shop-items/images"
                    />

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
                            <Button onClick={() => navigate("/admin/shop-items")}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}

export default EditShopItem;
