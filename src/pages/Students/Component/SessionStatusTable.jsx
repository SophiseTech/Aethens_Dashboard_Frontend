import { RestFilled } from '@ant-design/icons'
import facultyRemarksStore from '@stores/FacultyRemarksStore'
import courseStore from '@stores/CourseStore'
import { formatDate } from '@utils/helper'
import { Button, Image, Input, Select, Space, Table } from 'antd'
import React, { useEffect, useState, useMemo } from 'react'
import { useStore } from 'zustand'

const { Search } = Input;

function SessionStatusTable({ student }) {

  const { getFacultyRemarks, facultyRemarks, loading, deleteFacultyRemark } = useStore(facultyRemarksStore)
  const { course } = useStore(courseStore); // Get course from courseStore which has full data
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');

  // Use course from courseStore which has syllabusType and images populated
  const syllabusType = course?.syllabusType || 'general';

  console.log('Course from store:', course);
  console.log('SyllabusType:', syllabusType);

  useEffect(() => {
    if (!student?._id) return;

    const courseId = student?.details_id?.course_id?._id || student?.details_id?.course_id;

    const filters = {
      query: {
        student_id: student._id,
        course_id: courseId
      },
      populate: "faculty_id"
    };

    // Add status filter
    if (statusFilter && statusFilter !== 'all') {
      filters.status = statusFilter;
    }

    // Add search filter
    if (searchText) {
      filters.search = searchText;
    }

    getFacultyRemarks(filters);
  }, [student?._id, student?.details_id?.course_id, statusFilter, searchText]);

  // Build columns based on syllabus type
  const columns = useMemo(() => {
    const cols = [];

    if (syllabusType === 'custom') {
      // For custom/image-based syllabus, show Image column
      cols.push({
        title: "Image",
        dataIndex: "topic", // topic field stores image name for custom syllabus
        key: "image",
        render: (imageName) => {
          // Find the image URL from course images
          const image = course?.images?.find(img => img.name === imageName);
          return (
            <div className="flex items-center gap-2">
              {image?.url && (
                <Image
                  src={image.url}
                  alt={imageName}
                  width={50}
                  height={50}
                  className="object-cover rounded"
                  preview={{ src: image.url }}
                />
              )}
              <span>{imageName}</span>
            </div>
          );
        }
      });
    } else {
      // For general syllabus, show Module/Unit/Topic columns
      cols.push(
        {
          title: "Module",
          dataIndex: "module",
          key: "module"
        },
        {
          title: "Unit",
          dataIndex: "unit",
          key: "unit"
        },
        {
          title: "Topic",
          dataIndex: "topic",
          key: "topic"
        }
      );
    }

    // Common columns for both types
    cols.push(
      {
        title: "Faculty",
        dataIndex: ["faculty_id", "username"],
        key: "faculty"
      },
      {
        title: "Remarks",
        dataIndex: "remarks",
        key: "remarks"
      },
      {
        title: "Completed On",
        dataIndex: "completedOn",
        key: "completedOn",
        render: (value, record) => record.isTopicComplete ? formatDate(value) : "Not Completed"
      },
      {
        title: "Action",
        dataIndex: "action",
        key: "action",
        render: (_, record) => (
          <Button icon={<RestFilled />} color='red' onClick={() => { deleteFacultyRemark(record._id) }} />
        ),
      }
    );

    return cols;
  }, [syllabusType, course?.images, deleteFacultyRemark]);

  return (
    <div>
      {/* Filters */}
      <Space className="mb-4" wrap>
        <Select
          style={{ width: 150 }}
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: 'All Status', value: 'all' },
            { label: 'Completed', value: 'completed' },
            { label: 'Pending', value: 'pending' },
          ]}
        />
        <Search
          placeholder={syllabusType === 'custom' ? "Search image name or remarks" : "Search module, unit, topic, or remarks"}
          allowClear
          style={{ width: 300 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={setSearchText}
        />
      </Space>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={facultyRemarks}
        loading={loading}
        rowClassName={(record) => record.isTopicComplete && "bg-stone-500/25"}
        scroll={{
          x: 'max-content',
        }}
      />
    </div>
  )
}

export default SessionStatusTable