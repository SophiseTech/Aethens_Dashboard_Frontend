import MasonryLayout from '@components/MasonryLayout'
import SyllabusGalleryItem from '@pages/SyllabusGallery/components/SyllabusGalleryItem'
import SyllabusGalleryForm from '@pages/SyllabusGallery/components/SyllabusGalleryForm'
import syllabusGalleryService from '@services/SyllabusGalleryService'
import { Button, Empty, Image, message, Modal, Skeleton } from 'antd'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

const { confirm } = Modal
const PAGE_LIMIT = 20

function SyllabusGalleryList({ searchQuery = '' }) {
    const [items, setItems] = useState([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(true)      // initial load
    const [loadingMore, setLoadingMore] = useState(false) // subsequent pages
    const [selectedItem, setSelectedItem] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const sentinelRef = useRef(null)   // bottom of list — triggers next page
    const searchRef = useRef(searchQuery)
    const debounceRef = useRef(null)

    // ── Fetch a single page ───────────────────────────────────
    const fetchPage = useCallback(async (pageNum, search, replace = false) => {
        try {
            const response = await syllabusGalleryService.getSyllabusGalleryImages({
                page: pageNum,
                limit: PAGE_LIMIT,
                search,
            })
            const { data, hasMore: more } = response.data

            setItems(prev => replace ? data : [...prev, ...data])
            setHasMore(more)
            setPage(pageNum)
        } catch (error) {
            message.error(error.message || 'Failed to fetch gallery images')
        }
    }, [])

    // ── Initial load / search change ─────────────────────────
    useEffect(() => {
        // Debounce search changes
        clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(async () => {
            searchRef.current = searchQuery
            setLoading(true)
            setItems([])
            setHasMore(true)
            await fetchPage(1, searchQuery, true)
            setLoading(false)
        }, searchQuery === searchRef.current ? 0 : 300)

        return () => clearTimeout(debounceRef.current)
    }, [searchQuery, fetchPage])

    // ── IntersectionObserver — sentinel at bottom of list ────
    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel) return

        const observer = new IntersectionObserver(
            async ([entry]) => {
                if (!entry.isIntersecting || !hasMore || loadingMore || loading) return
                setLoadingMore(true)
                await fetchPage(page + 1, searchRef.current)
                setLoadingMore(false)
            },
            { threshold: 0.1 }
        )

        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [hasMore, loadingMore, loading, page, fetchPage])

    // ── Delete + modal helpers ────────────────────────────────
    const showModal = (item) => { setSelectedItem(item); setIsModalOpen(true) }
    const handleModalClose = () => { setIsModalOpen(false); setSelectedItem(null) }

    const handleDelete = (item) => {
        confirm({
            title: 'Delete Gallery Image',
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure you want to delete "${item.name}"?`,
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await syllabusGalleryService.deleteSyllabusGalleryImage(item._id)
                    message.success('Gallery image deleted successfully')
                    // Reset and reload from page 1
                    setLoading(true)
                    setItems([])
                    await fetchPage(1, searchRef.current, true)
                    setLoading(false)
                    if (isModalOpen && selectedItem?._id === item._id) handleModalClose()
                } catch (error) {
                    message.error(error.message || 'Failed to delete gallery image')
                }
            },
        })
    }

    // ── Render ────────────────────────────────────────────────
    if (loading) return <Loader />

    if (!loading && items.length === 0) {
        return (
            <div className="flex justify-center items-center py-20">
                <Empty
                    description={
                        searchQuery
                            ? `No results found for "${searchQuery}"`
                            : 'No gallery images yet. Click "Add Gallery Image" to get started.'
                    }
                />
            </div>
        )
    }

    return (
        <div>
            {searchQuery && (
                <h2 className="mb-4 text-gray-500 text-lg">
                    Search results for <span className="font-bold capitalize">{searchQuery}</span>
                </h2>
            )}

            <MasonryLayout>
                {items.map((item) => (
                    <SyllabusGalleryItem
                        key={item._id}
                        item={item}
                        onClick={() => showModal(item)}
                    />
                ))}
            </MasonryLayout>

            {/* Sentinel div — IntersectionObserver watches this */}
            <div ref={sentinelRef} className="h-4" />

            {/* Bottom skeleton while loading next page */}
            {loadingMore && (
                <MasonryLayout>
                    <Skeleton.Node active className="!w-full" style={{ height: 300 }} />
                    <Skeleton.Node active className="!w-full" style={{ height: 250 }} />
                    <Skeleton.Node active className="!w-full" style={{ height: 350 }} />
                </MasonryLayout>
            )}

            {/* End of results message */}
            {!hasMore && items.length > 0 && (
                <p className="text-center text-gray-400 text-sm py-6">
                    All {items.length} images loaded
                </p>
            )}

            {/* Detail Modal */}
            <Modal
                open={isModalOpen && selectedItem}
                onCancel={handleModalClose}
                footer={null}
                width="60%"
                destroyOnClose
            >
                <div className="flex gap-6 max-lg:flex-col">
                    {/* Image */}
                    <div className="w-full lg:w-1/2">
                        <Image
                            src={selectedItem?.url}
                            alt={selectedItem?.name}
                            className="rounded-lg overflow-hidden w-full"
                        />
                    </div>

                    {/* Details */}
                    <div className="w-full lg:w-1/2 flex flex-col gap-4">
                        <div>
                            <h1 className="text-primary font-bold text-2xl mb-1">
                                {selectedItem?.name}
                            </h1>
                            <p className="text-gray-500 text-sm break-all">
                                {selectedItem?.url}
                            </p>
                        </div>

                        <div className="text-xs text-gray-400">
                            <p>Created: {new Date(selectedItem?.createdAt).toLocaleString()}</p>
                            <p>Updated: {new Date(selectedItem?.updatedAt).toLocaleString()}</p>
                        </div>

                        <div className="flex gap-2 mt-auto">
                            <SyllabusGalleryForm
                                isCreate={false}
                                item={selectedItem}
                                onSuccess={() => {
                                    setLoading(true)
                                    setItems([])
                                    fetchPage(1, searchRef.current, true).then(() => setLoading(false))
                                    handleModalClose()
                                }}
                            />
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleDelete(selectedItem)}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

const Loader = () => (
    <MasonryLayout>
        <Skeleton.Node active className="!w-full" style={{ height: 350 }} />
        <Skeleton.Node active className="!w-full" style={{ height: 450 }} />
        <Skeleton.Node active className="!w-full" style={{ height: 250 }} />
        <Skeleton.Node active className="!w-full" style={{ height: 400 }} />
        <Skeleton.Node active className="!w-full" style={{ height: 300 }} />
    </MasonryLayout>
)

export default SyllabusGalleryList
