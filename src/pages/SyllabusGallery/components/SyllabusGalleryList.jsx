import MasonryLayout from '@components/MasonryLayout'
import SyllabusGalleryItem from '@pages/SyllabusGallery/components/SyllabusGalleryItem'
import SyllabusGalleryForm from '@pages/SyllabusGallery/components/SyllabusGalleryForm'
import AssignCustomSyllabusModal from '@pages/SyllabusGallery/components/AssignCustomSyllabusModal'
import syllabusGalleryService from '@services/SyllabusGalleryService'
import activitiesStore from '@stores/ActivitiesStore'
import studentStore from '@stores/StudentStore'
import { Avatar, Button, Empty, Input, message, Modal, Skeleton, Spin, Carousel, Image, Select } from 'antd'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { DeleteOutlined, ExclamationCircleOutlined, PlusCircleOutlined, BookOutlined, PrinterOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import { useStore } from 'zustand'
import userStore from '@stores/UserStore'
import courseService from '@services/Course'

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

    // Filters
    const [courseFilter, setCourseFilter] = useState('all')
    const [typeFilter, setTypeFilter] = useState('all')
    const [courses, setCourses] = useState([])

    // Assign-to-Activity state
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
    const [activityStudent, setActivityStudent] = useState(null)
    const [activitySearchQuery, setActivitySearchQuery] = useState('')
    const [activityAssigning, setActivityAssigning] = useState(false)

    const { createActivity } = useStore(activitiesStore)
    const { searchResults, loading: studentLoading } = useStore(studentStore)
    const { user } = useStore(userStore)

    const carouselRef = useRef(null)
    const sentinelRef = useRef(null)
    const searchRef = useRef(searchQuery)
    const debounceRef = useRef(null)
    const activityDebounceRef = useRef(null)

    // Fetch courses for filter dropdown
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await courseService.getCourses({}, 0, 1000)
                if (data && data.courses) {
                    setCourses(data.courses)
                } else if (Array.isArray(data)) {
                    setCourses(data)
                }
            } catch (error) {
                console.error("Failed to fetch courses:", error)
            }
        }
        fetchCourses()
    }, [])

    // ── Fetch a single page ───────────────────────────────────
    const fetchPage = useCallback(async (pageNum, search, course, type, replace = false) => {
        try {
            const response = await syllabusGalleryService.getSyllabusGalleryImages({
                page: pageNum,
                limit: PAGE_LIMIT,
                search,
                course,
                type,
            })
            const { data, hasMore: more } = response.data

            setItems(prev => replace ? data : [...prev, ...data])
            setHasMore(more)
            setPage(pageNum)
        } catch (error) {
            message.error(error.message || 'Failed to fetch gallery images')
        }
    }, [])

    // ── Initial load / search change / filter change ─────────────────────────
    useEffect(() => {
        // Debounce search changes
        clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(async () => {
            searchRef.current = searchQuery
            setLoading(true)
            setItems([])
            setHasMore(true)
            await fetchPage(1, searchQuery, courseFilter, typeFilter, true)
            setLoading(false)
        }, 300) // Always apply a slight debounce to prevent race conditions on quick filter taps

        return () => clearTimeout(debounceRef.current)
    }, [searchQuery, courseFilter, typeFilter, fetchPage])

    // ── IntersectionObserver — sentinel at bottom of list ────
    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel) return

        const observer = new IntersectionObserver(
            async ([entry]) => {
                if (!entry.isIntersecting || !hasMore || loadingMore || loading) return
                setLoadingMore(true)
                await fetchPage(page + 1, searchRef.current, courseFilter, typeFilter)
                setLoadingMore(false)
            },
            { threshold: 0.1 }
        )

        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [hasMore, loadingMore, loading, page, courseFilter, typeFilter, fetchPage])

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

        const resourcePayload = {
            fileName: selectedItem.name,
            fileType: 'image',
            fileSize: '0',
        };

        if (selectedItem.images && selectedItem.images.length > 0) {
            resourcePayload.images = selectedItem.images;
        } else {
            resourcePayload.url = selectedItem.url;
        }

        try {
            await createActivity({
                faculty_id: user._id,
                student_id: activityStudent._id,
                title: selectedItem.name,
                type: 'image',
                resource: resourcePayload,
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
                    await fetchPage(1, searchRef.current, courseFilter, typeFilter, true)
                    setLoading(false)
                    if (isModalOpen && selectedItem?._id === item._id) handleModalClose()
                } catch (error) {
                    message.error(error.message || 'Failed to delete gallery image')
                }
            },
        })
    }

    // ── Render ────────────────────────────────────────────────
    if (loading && items.length === 0) return <Loader />

    return (
        <div>
            {/* Context Header & Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                {searchQuery ? (
                    <h2 className="text-gray-500 text-lg flex-1">
                        Search results for <span className="font-bold capitalize">{searchQuery}</span>
                    </h2>
                ) : (
                    <div className="flex-1" />
                )}

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <Select
                        showSearch
                        placeholder="Filter by Course"
                        optionFilterProp="children"
                        className="w-48"
                        value={courseFilter}
                        onChange={setCourseFilter}
                        filterOption={(input, option) =>
                            (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                    >
                        <Select.Option value="all">All Courses</Select.Option>
                        {courses.map(c => (
                            <Select.Option key={c._id} value={c._id}>
                                {c.course_name}
                            </Select.Option>
                        ))}
                    </Select>

                    <Select
                        placeholder="Image Type"
                        className="w-36"
                        value={typeFilter}
                        onChange={setTypeFilter}
                    >
                        <Select.Option value="all">All Types</Select.Option>
                        <Select.Option value="single">Single Images</Select.Option>
                        <Select.Option value="set">Image Sets</Select.Option>
                    </Select>
                </div>
            </div>

            {!loading && items.length === 0 && (
                <div className="flex justify-center items-center py-20">
                    <Empty
                        description={
                            searchQuery || courseFilter !== 'all' || typeFilter !== 'all'
                                ? `No results found for applied filters`
                                : 'No gallery images yet. Click "Add Gallery Image" to get started.'
                        }
                    />
                </div>
            )}

            {items.length > 0 && (
                <MasonryLayout customBreakPoiints={{ 350: 1, 600: 2, 750: 3, 900: 4 }}>
                    {items.map((item) => (
                        <SyllabusGalleryItem
                            key={item._id}
                            item={item}
                            onClick={() => showModal(item)}
                        />
                    ))}
                </MasonryLayout>
            )}

            {/* Sentinel div — IntersectionObserver watches this */}
            <div ref={sentinelRef} className="h-4" />

            {/* Bottom skeleton while loading next page */}
            {
                loadingMore && (
                    <MasonryLayout>
                        <Skeleton.Node active className="!w-full" style={{ height: 300 }} />
                        <Skeleton.Node active className="!w-full" style={{ height: 250 }} />
                        <Skeleton.Node active className="!w-full" style={{ height: 350 }} />
                    </MasonryLayout>
                )
            }

            {/* End of results message */}
            {
                !hasMore && items.length > 0 && (
                    <p className="text-center text-gray-400 text-sm py-6">
                        All {items.length} images loaded
                    </p>
                )
            }

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
                        {selectedItem?.images && selectedItem.images.length > 1 ? (
                            <div className="bg-gray-100 rounded-lg overflow-hidden relative" style={{ height: '60vh' }}>
                                <Carousel ref={carouselRef} dots style={{ height: '100%' }}>
                                    {selectedItem.images.map((imgUrl, i) => (
                                        <div key={i} style={{ height: '60vh' }}>
                                            <img
                                                src={imgUrl}
                                                alt={`${selectedItem?.name} - part ${i + 1}`}
                                                style={{
                                                    width: '100%',
                                                    height: '60vh',
                                                    objectFit: 'contain',
                                                    display: 'block',
                                                    background: '#f5f5f5',
                                                }}
                                            />
                                        </div>
                                    ))}
                                </Carousel>
                                {/* Custom overlay arrows — no CSS class guessing */}
                                <button onClick={() => carouselRef.current?.prev()} style={{
                                    position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                                    zIndex: 10, width: 36, height: 36, borderRadius: '50%',
                                    background: 'rgba(0,0,0,0.45)', border: 'none', cursor: 'pointer',
                                    color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}><LeftOutlined /></button>
                                <button onClick={() => carouselRef.current?.next()} style={{
                                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                                    zIndex: 10, width: 36, height: 36, borderRadius: '50%',
                                    background: 'rgba(0,0,0,0.45)', border: 'none', cursor: 'pointer',
                                    color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}><RightOutlined /></button>
                            </div>
                        ) : (
                            <Image
                                src={selectedItem?.images && selectedItem.images.length > 0 ? selectedItem.images[0] : selectedItem?.url}
                                alt={selectedItem?.name}
                                style={{ width: '100%', maxHeight: '60vh', objectFit: 'contain', display: 'block', background: '#f5f5f5', borderRadius: 8 }}
                                preview={{ src: selectedItem?.images && selectedItem.images.length > 0 ? selectedItem.images[0] : selectedItem?.url }}
                            />
                        )}
                    </div>

                    {/* Details */}
                    <div className="w-full lg:w-1/2 flex flex-col gap-4">
                        <div>
                            <h1 className="text-primary font-bold text-2xl mb-1">
                                {selectedItem?.name}
                            </h1>
                        </div>

                        <div className="text-xs text-gray-400">
                            <p>Created: {new Date(selectedItem?.createdAt).toLocaleString()}</p>
                            <p>Updated: {new Date(selectedItem?.updatedAt).toLocaleString()}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-auto">
                            {user?.role === 'admin' && (
                                <SyllabusGalleryForm
                                    isCreate={false}
                                    item={selectedItem}
                                    onSuccess={() => {
                                        setLoading(true)
                                        setItems([])
                                        fetchPage(1, searchRef.current, courseFilter, typeFilter, true).then(() => setLoading(false))
                                        handleModalClose()
                                    }}
                                />
                            )}
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
                                icon={<PrinterOutlined />}
                                onClick={() => {
                                    const urls = (selectedItem?.images && selectedItem.images.length > 0)
                                        ? selectedItem.images
                                        : [selectedItem?.url];

                                    const printWindow = window.open('', '_blank');
                                    if (!printWindow) return;

                                    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Print Image</title>
  <style>
    @page { margin: 0; size: auto; }
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: white; }
    img { 
      width: 100%; 
      height: 100%; 
      object-fit: contain; 
      display: block; 
      page-break-after: always; 
      break-after: page; 
      margin: 0; 
      page-break-inside: avoid; 
      break-inside: avoid; 
    }
    img:last-child { page-break-after: auto; break-after: auto; }
  </style>
</head>
<body>
  ${urls.map(url => `<img src="${url}" />`).join('')}
</body>
</html>`);
                                    printWindow.document.close();

                                    // Wait for ALL images to load before printing
                                    const imgs = Array.from(printWindow.document.images);
                                    const imageLoadPromises = imgs.map(img =>
                                        new Promise(resolve => {
                                            if (img.complete) { resolve(); return; }
                                            img.onload = resolve;
                                            img.onerror = resolve; // resolve on error too so we don't hang
                                        })
                                    );

                                    Promise.all(imageLoadPromises).then(() => {
                                        printWindow.focus();

                                        // On iPads/iOS Safari, a synchronous .close() instantly kills the tab
                                        // before the native print dialog can properly appear.
                                        // We use onafterprint to ensure it closes only when the user is done.
                                        printWindow.onafterprint = () => {
                                            printWindow.close();
                                        };

                                        printWindow.print();
                                    });
                                }}
                            >
                                Print
                            </Button>
                            {user?.role === 'admin' && (
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDelete(selectedItem)}
                                >
                                    Delete
                                </Button>
                            )}
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
                    <img src={selectedItem?.images && selectedItem.images.length > 0 ? selectedItem.images[0] : selectedItem?.url} alt={selectedItem?.name} className="w-12 h-12 object-cover rounded" />
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
            {
                selectedItem && (
                    <AssignCustomSyllabusModal
                        open={isSyllabusModalOpen}
                        onClose={() => setIsSyllabusModalOpen(false)}
                        galleryImage={selectedItem}
                    />
                )
            }
        </div >
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
