import React, { useCallback, useEffect, useState } from 'react';
import { Avatar, Button, Empty, Input, Modal, Spin, Tag, Tooltip } from 'antd';
import { CloseOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import studentStore from '@stores/StudentStore';
import studentSyllabusStore from '@stores/StudentSyllabusStore';
import { useStore } from 'zustand';
import debounce from 'lodash/debounce';

/**
 * Modal to add a SyllabusGallery image to a specific student's custom syllabus.
 * @param {boolean}  open          - whether the modal is visible
 * @param {Function} onClose       - close handler
 * @param {Object}   galleryImage  - { _id, name, url } from SyllabusGallery
 */
function AssignCustomSyllabusModal({ open, onClose, galleryImage }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);

    const { searchResults, loading: searchLoading } = useStore(studentStore);
    const { syllabus, loading: syllabusLoading, saving, fetchSyllabus, addImage, reset } = useStore(studentSyllabusStore);

    // Debounced student search
    const doSearch = useCallback(
        debounce((q) => {
            studentStore.getState().search(20, { searchQuery: q, role: 'student' });
        }, 300),
        []
    );

    useEffect(() => {
        if (searchQuery.trim()) doSearch(searchQuery);
    }, [searchQuery, doSearch]);

    // Load the student's existing syllabus whenever a student is selected
    useEffect(() => {
        if (selectedStudent) {
            const courseId = selectedStudent?.details_id?.course_id;
            if (courseId) {
                fetchSyllabus(selectedStudent._id, courseId);
            }
        } else {
            reset();
        }
    }, [selectedStudent, fetchSyllabus, reset]);

    const handleClose = () => {
        setSearchQuery('');
        setSelectedStudent(null);
        reset();
        onClose();
    };

    const alreadyAssigned = syllabus?.images?.some(
        (img) => img.galleryImageId?.toString() === galleryImage?._id?.toString()
    );

    const handleAssign = async () => {
        if (!selectedStudent || !galleryImage) return;
        const courseId = selectedStudent?.details_id?.course_id;
        if (!courseId) return;

        await addImage(selectedStudent._id, courseId, {
            galleryImageId: galleryImage._id,
            name: galleryImage.name,
            url: galleryImage.url,
            sessionsRequired: 0,
        });
        handleClose();
    };

    return (
        <Modal
            title="Add to Student Syllabus"
            open={open}
            onCancel={handleClose}
            footer={null}
            width={520}
            destroyOnClose
        >
            {/* Image being assigned */}
            <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <img
                    src={galleryImage?.url}
                    alt={galleryImage?.name}
                    className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                />
                <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{galleryImage?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{galleryImage?.url}</p>
                </div>
            </div>

            {/* Student search */}
            <Input
                prefix={<SearchOutlined className="text-gray-400" />}
                placeholder="Search student by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                allowClear
                className="mb-3"
            />

            {/* Search results (hidden once student is selected) */}
            {!selectedStudent && (
                <div className="max-h-52 overflow-y-auto border border-gray-100 rounded-lg mb-4">
                    {searchLoading ? (
                        <div className="flex justify-center py-6"><Spin /></div>
                    ) : searchResults.length === 0 ? (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={searchQuery ? 'No students found' : 'Type to search students'}
                            className="py-6"
                        />
                    ) : (
                        searchResults.map((student) => (
                            <div
                                key={student._id}
                                onClick={() => setSelectedStudent(student)}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                            >
                                <Avatar src={student.profile_img} icon={<UserOutlined />} size="small" />
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-sm">{student.username}</p>
                                    <p className="text-xs text-gray-400 truncate">{student.email}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Selected student chip */}
            {selectedStudent && (
                <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Assigning to:</p>
                    <Tag
                        icon={<Avatar src={selectedStudent.profile_img} icon={<UserOutlined />} size={16} className="mr-1" />}
                        closable
                        onClose={() => setSelectedStudent(null)}
                        className="text-sm py-1 px-3"
                    >
                        {selectedStudent.username}
                    </Tag>
                </div>
            )}

            {/* Existing syllabus images for selected student */}
            {selectedStudent && (
                <div className="mb-5">
                    {syllabusLoading ? (
                        <div className="flex justify-center py-4"><Spin size="small" /></div>
                    ) : (
                        <>
                            <p className="text-xs text-gray-500 mb-2">
                                Current custom syllabus ({syllabus?.images?.length || 0} images):
                            </p>
                            {syllabus?.images?.length > 0 ? (
                                <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
                                    {syllabus.images.map((img, i) => (
                                        <Tooltip key={i} title={img.name}>
                                            <img
                                                src={img.url}
                                                alt={img.name}
                                                className="w-12 h-12 object-cover rounded border border-gray-200"
                                            />
                                        </Tooltip>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 italic">No custom syllabus yet</p>
                            )}
                            {alreadyAssigned && (
                                <p className="text-xs text-amber-600 mt-2">
                                    ⚠ This image is already in this student's syllabus
                                </p>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                    type="primary"
                    className="bg-primary"
                    loading={saving}
                    disabled={!selectedStudent || alreadyAssigned || syllabusLoading}
                    onClick={handleAssign}
                >
                    Add to Syllabus
                </Button>
            </div>
        </Modal>
    );
}

export default AssignCustomSyllabusModal;
