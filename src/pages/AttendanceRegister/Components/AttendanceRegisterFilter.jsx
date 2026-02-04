import React, { useEffect, useMemo } from 'react';
import { DatePicker, Select, Button, Row, Col, Spin } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useStore } from 'zustand';
import courseStore from '@stores/CourseStore';

function AttendanceRegisterFilter({
  selectedMonth,
  setSelectedMonth,
  selectedCourse,
  setSelectedCourse,
  onApply,
  loading
}) {
  const { courses, getCourses, loading: courseLoading } = useStore(courseStore);

  // Fetch courses on component mount
  useEffect(() => {
    getCourses(100); // Fetch up to 100 courses
  }, [getCourses]);

  // Transform courses to select options
  const courseOptions = useMemo(() => {
    return courses?.map(course => ({
      label: course.course_name,
      value: course._id
    })) || [];
  }, [courses]);

  const handleMonthChange = (date) => {
    if (date) {
      setSelectedMonth(date.toDate());
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 mb-6 border border-border">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={8}>
          <label className="text-sm font-semibold block mb-2">Select Month</label>
          <DatePicker
            picker="month"
            value={dayjs(selectedMonth)}
            onChange={handleMonthChange}
            style={{ width: '100%' }}
            format="MMMM YYYY"
          />
        </Col>

        <Col xs={24} sm={12} md={10}>
          <label className="text-sm font-semibold block mb-2">Select Course (Optional)</label>
          <Spin spinning={courseLoading} size="small">
            <Select
              allowClear
              placeholder={courseLoading ? "Loading courses..." : "All courses"}
              options={courseOptions}
              value={selectedCourse}
              onChange={setSelectedCourse}
              style={{ width: '100%' }}
              disabled={courseLoading}
            />
          </Spin>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Button
            icon={<ReloadOutlined />}
            onClick={onApply}
            loading={loading}
            type="primary"
            block
            style={{ marginTop: 30 }}
          >
            Apply Filters
          </Button>
        </Col>
      </Row>
    </div>
  );
}

export default AttendanceRegisterFilter;
