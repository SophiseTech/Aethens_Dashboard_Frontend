import MasonryLayout from '@components/MasonryLayout'
import SyllabusGalleryItem from '@pages/SyllabusGallery/components/SyllabusGalleryItem'
import SyllabusGalleryForm from '@pages/SyllabusGallery/components/SyllabusGalleryForm'
import AssignCustomSyllabusModal from '@pages/SyllabusGallery/components/AssignCustomSyllabusModal'
import syllabusGalleryService from '@services/SyllabusGalleryService'
import activitiesStore from '@stores/ActivitiesStore'
import studentStore from '@stores/StudentStore'
import { Avatar, Button, Empty, Input, message, Modal, Select, Skeleton, Spin } from 'antd'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { DeleteOutlined, ExclamationCircleOutlined, PlusCircleOutlined, BookOutlined } from '@ant-design/icons'
import { useStore } from 'zustand'
import userStore from '@stores/UserStore'

const { confirm } = Modal
const PAGE_LIMIT = 20

function SyllabusGalleryList({ searchQuery = '' }) {
    const [items, setItems] = useState([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false)
    // Assign-to-Activity state
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
    const [activityStudent, setActivityStudent] = useState(null)
    const [activitySearchQuery, setActivitySearchQuery] = useState('')
    const [activityAssigning, setActivityAssigning] = useState(false)

    const { createActivity } = useStore(activitiesStore)
    const { searchResults, loading: studentLoading } = useStore(studentStore)
    const { user } = useStore(userStore)

    const sentinelRef = useRef(null)
    const searchRef = useRef(searchQuery)
    const debounceRef = useRef(null)
    const activityDebounceRef = useRef(null)

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

    const showModal = (item) => { setSelectedItem(item); setIsModalOpen(true) }
    const handleModalClose = () => { setIsModalOpen(false); setSelectedItem(null) }

    // Assign image to student activity
    const handleActivitySearch = (q) => {
        setActivitySearchQuery(q)
        clearTimeout(activityDebounceRef.current)
        if (q.trim()) {
            activityDebounceRef.current = setTimeout(() => {
                studentStore.getState().search(20, { searchQuery: q, role: 'student' })
            }, 300)
        }
    }

    const handleAssignToActivity = async () => {
        if (!activityStudent || !selectedItem) return
        setActivityAssigning(true)
        try {
            await createActivity({
                faculty_id: user._id,
                student_id: activityStudent._id,
                title: selectedItem.name,
                type: 'image',
                resource: {
                    url: selectedItem.url,
                    fileName: selectedItem.name,
                    fileType: 'image',
                    fileSize: '0',
                },
            })
            setIsActivityModalOpen(false)
            setActivityStudent(null)
            setActivitySearchQuery('')
        } finally {
            setActivityAssigning(false)
        }
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
                        <img
                            src={selectedItem?.url}
                            alt={selectedItem?.name}
                            className="rounded-lg overflow-hidden w-full object-contain"
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

                        <div className="flex flex-wrap gap-2 mt-auto">
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
                            {/* Assign to Student Activity */}
                            <Button
                                icon={<PlusCircleOutlined />}
                                onClick={() => setIsActivityModalOpen(true)}
                            >
                                Assign to Activity
                            </Button>
                            {/* Add to Student Syllabus */}
                            <Button
                                icon={<BookOutlined />}
                                onClick={() => setIsSyllabusModalOpen(true)}
                            >
                                Add to Syllabus
                            </Button>
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

            {/* Assign to Activity modal */}
            <Modal
                title="Assign to Student Activity"
                open={isActivityModalOpen}
                onCancel={() => { setIsActivityModalOpen(false); setActivityStudent(null); setActivitySearchQuery('') }}
                footer={null}
                width={440}
                destroyOnClose
            >
                <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <img src={selectedItem?.url} alt={selectedItem?.name} className="w-12 h-12 object-cover rounded" />
                    <p className="font-semibold text-sm truncate">{selectedItem?.name}</p>
                </div>
                <Input
                    placeholder="Search student by name..."
                    value={activitySearchQuery}
                    onChange={(e) => handleActivitySearch(e.target.value)}
                    allowClear
                    className="mb-3"
                />
                {!activityStudent && (
                    <div className="max-h-52 overflow-y-auto border border-gray-100 rounded-lg mb-4">
                        {studentLoading ? (
                            <div className="flex justify-center py-6"><Spin /></div>
                        ) : searchResults.length === 0 ? (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={activitySearchQuery ? 'No students found' : 'Type to search'} className="py-6" />
                        ) : (
                            searchResults.map(student => (
                                <div
                                    key={student._id}
                                    onClick={() => setActivityStudent(student)}
                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                                >
                                    <Avatar src={student.profile_img} size="small">{student.username?.charAt(0)}</Avatar>
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm">{student.username}</p>
                                        <p className="text-xs text-gray-400 truncate">{student.email}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
                {activityStudent && (
                    <div className="mb-4 flex items-center gap-2">
                        <span className="text-xs text-gray-500">Assigning to:</span>
                        <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                            {activityStudent.username}
                        </span>
                        <button onClick={() => setActivityStudent(null)} className="text-gray-400 hover:text-gray-600 text-xs ml-auto">change</button>
                    </div>
                )}
                <div className="flex justify-end gap-2">
                    <Button onClick={() => { setIsActivityModalOpen(false); setActivityStudent(null); setActivitySearchQuery('') }}>Cancel</Button>
                    <Button
                        type="primary"
                        className="bg-primary"
                        loading={activityAssigning}
                        disabled={!activityStudent}
                        onClick={handleAssignToActivity}
                    >
                        Assign
                    </Button>
                </div>
            </Modal>

            {/* Add to Student Syllabus modal */}
            {selectedItem && (
                <AssignCustomSyllabusModal
                    open={isSyllabusModalOpen}
                    onClose={() => setIsSyllabusModalOpen(false)}
                    galleryImage={selectedItem}
                />
            )}
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
