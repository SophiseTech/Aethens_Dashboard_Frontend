import { useCallback, useEffect, useRef, useState } from 'react';
import { Select, Card, InputNumber, Space, Spin, Typography, Empty, Image } from 'antd';
import syllabusGalleryService from '@services/SyllabusGalleryService';

const { Text } = Typography;
const { Option } = Select;

const PAGE_LIMIT = 20;

/**
 * Component for selecting images from syllabus gallery
 * Returns array of {_id, name, url, sessionsRequired}
 * Uses server-side pagination + search to avoid loading all images at once.
 */
function ImagesSelector({ value = [], onChange }) {
    const [galleryImages, setGalleryImages] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [fetching, setFetching] = useState(false);
    const [search, setSearch] = useState('');

    const searchRef = useRef('');
    const debounceRef = useRef(null);

    // ── Fetch a page of gallery images ────────────────────────
    const fetchPage = useCallback(async (pageNum, searchQuery, replace = false) => {
        if (fetching) return;
        setFetching(true);
        try {
            const response = await syllabusGalleryService.getSyllabusGalleryImages({
                page: pageNum,
                limit: PAGE_LIMIT,
                search: searchQuery,
            });
            const { data, hasMore: more } = response?.data ?? {};
            setGalleryImages(prev => replace ? (data ?? []) : [...prev, ...(data ?? [])]);
            setHasMore(!!more);
            setPage(pageNum);
        } catch (error) {
            console.error('Error fetching syllabus gallery images:', error);
        } finally {
            setFetching(false);
        }
    }, [fetching]);

    // Initial load
    useEffect(() => {
        fetchPage(1, '', true);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Server-side search (debounced 300ms) ──────────────────
    const handleSearch = (val) => {
        setSearch(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            searchRef.current = val;
            setGalleryImages([]);
            setHasMore(true);
            fetchPage(1, val, true);
        }, 300);
    };

    // ── Infinite scroll inside dropdown ───────────────────────
    const handlePopupScroll = (e) => {
        const { target } = e;
        const nearBottom = target.scrollTop + target.offsetHeight >= target.scrollHeight - 40;
        if (nearBottom && hasMore && !fetching) {
            fetchPage(page + 1, searchRef.current);
        }
    };

    // ── Selection handlers ────────────────────────────────────
    const handleImageSelect = (selectedItems) => {
        const newImages = selectedItems.map(({ value: id, label: name }) => {
            const existing = value.find(img => img._id === id);
            if (existing) return existing;
            const galleryImage = galleryImages.find(img => img._id === id);
            return {
                _id: id,
                name: galleryImage?.name ?? name,
                url: galleryImage?.url ?? '',
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

    return (
        <div>
            <Text strong className="mb-2 block">Syllabus Images</Text>
            <Select
                mode="multiple"
                labelInValue
                showSearch
                filterOption={false}          // server-side search
                onSearch={handleSearch}
                onPopupScroll={handlePopupScroll}
                placeholder="Search and select images"
                style={{ width: '100%' }}
                value={value.map(img => ({ value: img._id, label: img.name }))}
                onChange={handleImageSelect}
                notFoundContent={
                    fetching
                        ? <div className="flex justify-center py-3"><Spin size="small" /></div>
                        : <Empty description="No images found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                }
                dropdownRender={(menu) => (
                    <>
                        {menu}
                        {fetching && galleryImages.length > 0 && (
                            <div className="flex justify-center py-2">
                                <Spin size="small" />
                            </div>
                        )}
                    </>
                )}
            >
                {galleryImages.map((image) => (
                    <Option key={image._id} value={image._id} label={image.name}>
                        <div className="flex items-center gap-2">
                            <img
                                src={image.url}
                                alt={image.name}
                                width={32}
                                height={32}
                                style={{ objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
                            />
                            <span>{image.name}</span>
                        </div>
                    </Option>
                ))}
            </Select>

            {value.length > 0 && (
                <div className="mt-3">
                    <Text strong className="mb-2 block">Sessions Required for Each Image</Text>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        {value.map((image, index) => (
                            <Card key={image._id || index} size="small">
                                <div className="flex items-center gap-3">
                                    <Image
                                        src={image.url}
                                        alt={image.name}
                                        width={52}
                                        height={52}
                                        style={{ objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                                        preview={{ mask: false }}
                                    />
                                    <div className="flex flex-1 justify-between items-center gap-2">
                                        <Text className="truncate">{image.name}</Text>
                                        <div className="flex items-center gap-2 shrink-0">
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
