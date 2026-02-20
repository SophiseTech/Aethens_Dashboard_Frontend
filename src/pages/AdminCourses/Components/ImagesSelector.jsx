import { useEffect, useState } from 'react';
import { Select, Card, InputNumber, Space, Spin, Typography, Empty } from 'antd';
import syllabusGalleryService from '@services/SyllabusGalleryService';

const { Text } = Typography;
const { Option } = Select;

/**
 * Component for selecting images from syllabus gallery
 * Returns array of {name, url, sessionsRequired}
 */
function ImagesSelector({ value = [], onChange }) {
    const [galleryImages, setGalleryImages] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchGalleryImages();
    }, []);

    const fetchGalleryImages = async () => {
        try {
            setLoading(true);
            const response = await syllabusGalleryService.getSyllabusGalleryImages();
            if (response?.data) {
                setGalleryImages(response.data);
            }
        } catch (error) {
            console.error('Error fetching syllabus gallery images:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageSelect = (selectedIds) => {
        // Create new array with selected images
        const newImages = selectedIds.map((id) => {
            // Check if image already exists in value
            const existingImage = value.find((img) => img._id === id || img.url === galleryImages.find(g => g._id === id)?.url);
            if (existingImage) {
                return existingImage;
            }
            // Otherwise create new entry
            const galleryImage = galleryImages.find((img) => img._id === id);
            return {
                _id: galleryImage._id,
                name: galleryImage.name,
                url: galleryImage.url,
                sessionsRequired: 0,
            };
        });
        onChange(newImages);
    };

    const handleSessionsChange = (index, sessions) => {
        const newImages = [...value];
        newImages[index].sessionsRequired = sessions;
        onChange(newImages);
    };

    if (loading) {
        return (
            <div className="flex justify-center py-4">
                <Spin tip="Loading syllabus gallery..." />
            </div>
        );
    }

    return (
        <div>
            <Text strong className="mb-2 block">Syllabus Images</Text>
            <Select
                mode="multiple"
                placeholder="Select images from syllabus gallery"
                style={{ width: '100%' }}
                value={value.map((img) => img._id)}
                onChange={handleImageSelect}
                filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                notFoundContent={galleryImages.length === 0 ? <Empty description="No images in gallery" /> : null}
            >
                {galleryImages.map((image) => (
                    <Option key={image._id} value={image._id}>
                        {image.name}
                    </Option>
                ))}
            </Select>

            {value.length > 0 && (
                <div className="mt-3">
                    <Text strong className="mb-2 block">Sessions Required for Each Image</Text>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        {value.map((image, index) => (
                            <Card key={image._id || index} size="small">
                                <div className="flex justify-between items-center">
                                    <Text>{image.name}</Text>
                                    <div className="flex items-center gap-2">
                                        <Text type="secondary">Sessions:</Text>
                                        <InputNumber
                                            min={0}
                                            value={image.sessionsRequired}
                                            onChange={(val) => handleSessionsChange(index, val)}
                                            placeholder="0"
                                            style={{ width: 80 }}
                                        />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </Space>
                </div>
            )}
        </div>
    );
}

export default ImagesSelector;
