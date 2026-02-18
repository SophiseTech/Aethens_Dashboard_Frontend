import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Input, InputNumber, Button, message, Spin, Card, Space, Divider, Upload, Image } from "antd";
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import Title from "@components/layouts/Title";
import artWorkService from "@services/ArtWork";
import s3Service from "@/services/S3Service";

const { TextArea } = Input;

/**
 * Helper: given a file chosen in <Upload>, read it as base64 and upload to S3.
 * Returns the public URL string.
 */
const uploadFileToS3 = async (file, path = "artworks") => {
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
 * A reusable image upload field with thumbnail preview.
 * Shows existing image as a thumbnail and allows replacing via file upload.
 */
function ImageUploadField({ label, value, onChange, path = "artworks" }) {
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
                {/* Thumbnail preview */}
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

                {/* Upload button */}
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

                    {/* URL input fallback */}
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


function EditArtWork() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const isEditMode = !!id;

    // Image state managed outside the form (since Upload doesn't play nicely with Form)
    const [artImage, setArtImage] = useState("");
    const [artistImage, setArtistImage] = useState("");
    const [gallery1, setGallery1] = useState("");
    const [gallery2, setGallery2] = useState("");
    const [gallery3, setGallery3] = useState("");

    useEffect(() => {
        if (isEditMode) {
            fetchArtWork();
        }
    }, [id]);

    const fetchArtWork = async () => {
        try {
            setLoading(true);
            const res = await artWorkService.getById(id);
            const artWork = res?.data ?? res;

            // Set images
            setArtImage(artWork.artImage || "");
            setArtistImage(artWork.artist?.image || "");
            setGallery1(artWork.gallery1 || "");
            setGallery2(artWork.gallery2 || "");
            setGallery3(artWork.gallery3 || "");

            // Set form values
            form.setFieldsValue({
                subtitle: artWork.subtitle,
                slug: artWork.slug,
                shortDescription: artWork.shortDescription,
                longDescription: artWork.longDescription,
                tags: artWork.tags?.join(", ") || "",
                sections: artWork.sections?.join("\n") || "",
                artistName: artWork.artist?.name,
                artistAge: artWork.artist?.age,
                artistCourse: artWork.artist?.course,
            });
        } catch (e) {
            message.error("Failed to load art work");
            navigate("/admin/art-works");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);

            const payload = {
                subtitle: values.subtitle,
                slug: values.slug,
                shortDescription: values.shortDescription,
                longDescription: values.longDescription,
                tags: values.tags ? values.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
                sections: values.sections ? values.sections.split("\n").filter(Boolean) : [],
                artImage,
                gallery1,
                gallery2,
                gallery3,
                artist: {
                    name: values.artistName,
                    age: values.artistAge,
                    course: values.artistCourse,
                    image: artistImage,
                },
            };

            if (isEditMode) {
                await artWorkService.update(id, payload);
                message.success("Art work updated successfully");
            } else {
                await artWorkService.create(payload);
                message.success("Art work created successfully");
            }

            navigate("/admin/art-works");
        } catch (e) {
            if (e.errorFields) return;
            message.error(e?.message || "Failed to save art work");
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
                    onClick={() => navigate("/admin/art-works")}
                    className="mb-4"
                >
                    Back to Art Works
                </Button>
                <h1 className="text-2xl font-bold">
                    {isEditMode ? "Edit Art Work" : "Create Art Work"}
                </h1>
            </div>

            <Card>
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="subtitle"
                        label="Subtitle"
                    >
                        <Input placeholder="Enter subtitle" />
                    </Form.Item>

                    <Form.Item
                        name="slug"
                        label="Slug"
                        rules={[{ required: true, message: "Please enter a slug" }]}
                        extra="URL-friendly identifier (e.g., my-art-work)"
                    >
                        <Input placeholder="my-art-work" />
                    </Form.Item>

                    <Form.Item
                        name="shortDescription"
                        label="Short Description"
                        rules={[{ required: true, message: "Please enter a short description" }]}
                    >
                        <TextArea rows={2} placeholder="Brief summary of the art work" />
                    </Form.Item>

                    <Form.Item
                        name="longDescription"
                        label="Long Description"
                        rules={[{ required: true, message: "Please enter a long description" }]}
                    >
                        <TextArea rows={4} placeholder="Detailed description" />
                    </Form.Item>

                    <Form.Item
                        name="tags"
                        label="Tags"
                        extra="Comma-separated tags (e.g., painting, abstract, oil)"
                    >
                        <Input placeholder="painting, abstract, oil" />
                    </Form.Item>

                    <Form.Item
                        name="sections"
                        label="Sections"
                        extra="One section per line"
                    >
                        <TextArea rows={3} placeholder="Enter each section on a new line" />
                    </Form.Item>

                    {/* Art Image */}
                    <Divider>Art Image</Divider>
                    <ImageUploadField
                        label="Art Image"
                        value={artImage}
                        onChange={setArtImage}
                        path="artworks/art-images"
                    />

                    {/* Gallery Images */}
                    <Divider>Gallery</Divider>
                    <ImageUploadField
                        label="Gallery Image 1 (Required)"
                        value={gallery1}
                        onChange={setGallery1}
                        path="artworks/gallery"
                    />
                    <ImageUploadField
                        label="Gallery Image 2"
                        value={gallery2}
                        onChange={setGallery2}
                        path="artworks/gallery"
                    />
                    <ImageUploadField
                        label="Gallery Image 3"
                        value={gallery3}
                        onChange={setGallery3}
                        path="artworks/gallery"
                    />

                    {/* Artist Info */}
                    <Divider>Artist Info</Divider>
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="artistName"
                            label="Artist Name"
                            rules={[{ required: true, message: "Please enter the artist name" }]}
                        >
                            <Input placeholder="Artist name" />
                        </Form.Item>

                        <Form.Item
                            name="artistAge"
                            label="Artist Age"
                        >
                            <InputNumber min={1} className="w-full" placeholder="Age" />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="artistCourse"
                        label="Artist Course"
                    >
                        <Input placeholder="e.g. Oil Painting, Watercolour" />
                    </Form.Item>

                    <ImageUploadField
                        label="Artist Image"
                        value={artistImage}
                        onChange={setArtistImage}
                        path="artworks/artist-images"
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
                            <Button onClick={() => navigate("/admin/art-works")}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}

export default EditArtWork;
