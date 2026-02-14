import MasonryLayout from '@components/MasonryLayout'
import SyllabusGalleryItem from '@pages/SyllabusGallery/components/SyllabusGalleryItem'
import SyllabusGalleryForm from '@pages/SyllabusGallery/components/SyllabusGalleryForm'
import syllabusGalleryService from '@services/SyllabusGalleryService'
import { Button, Empty, Image, message, Modal, Skeleton } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

const { confirm } = Modal

function SyllabusGalleryList({ searchQuery = '' }) {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedItem, setSelectedItem] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Fetch items on mount
    useEffect(() => {
        fetchItems()
    }, [])

    const fetchItems = async () => {
        setLoading(true)
        try {
            const response = await syllabusGalleryService.getSyllabusGalleryImages()
            setItems(response.data || [])
        } catch (error) {
            message.error(error.message || 'Failed to fetch gallery images')
            setItems([])
        } finally {
            setLoading(false)
        }
    }

    // Filter items based on search query
    const filteredItems = useMemo(() => {
        if (!searchQuery) return items
        return items.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [items, searchQuery])

    const showModal = (item) => {
        setSelectedItem(item)
        setIsModalOpen(true)
    }

    const handleModalClose = () => {
        setIsModalOpen(false)
        setSelectedItem(null)
    }

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
                    fetchItems() // Refresh list
                    if (isModalOpen && selectedItem?._id === item._id) {
                        handleModalClose()
                    }
                } catch (error) {
                    message.error(error.message || 'Failed to delete gallery image')
                }
            },
        })
    }

    if (loading) return <Loader />

    if (filteredItems.length === 0) {
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
                {filteredItems.map((item) => (
                    <SyllabusGalleryItem
                        key={item._id}
                        item={item}
                        onClick={() => showModal(item)}
                    />
                ))}
            </MasonryLayout>

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
                            fallback="data:image/png;base64,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"
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
                                    fetchItems()
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

const Loader = () => {
    return (
        <MasonryLayout>
            <Skeleton.Node active className="!w-full" style={{ height: 350 }} />
            <Skeleton.Node active className="!w-full" style={{ height: 450 }} />
            <Skeleton.Node active className="!w-full" style={{ height: 250 }} />
            <Skeleton.Node active className="!w-full" style={{ height: 400 }} />
            <Skeleton.Node active className="!w-full" style={{ height: 300 }} />
        </MasonryLayout>
    )
}

export default SyllabusGalleryList
