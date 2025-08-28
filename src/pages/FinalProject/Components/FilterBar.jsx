import { FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, Input, Row, Select } from 'antd'
import React from 'react'

const { Option } = Select

export const mockCourses = [
  { id: 1, name: 'Web Development Fundamentals' },
  { id: 2, name: 'React Advanced Concepts' },
  { id: 3, name: 'Node.js Backend Development' }
];

export const mockPhases = [
  { id: 1, name: 'Project Setup', courseId: 1 },
  { id: 2, name: 'Frontend Implementation', courseId: 1 },
  { id: 3, name: 'API Integration', courseId: 1 },
  { id: 4, name: 'Testing & Deployment', courseId: 1 }
];

function FilterBar({ onFiltersChange }) {
  return (
    <Card className="mb-4">
      <div>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={6}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Course</label>
              <Select placeholder="Select course" allowClear style={{ width: '100%' }}>
                {mockCourses.map(course => (
                  <Option key={course.id} value={course.id}>
                    {course.name}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Phase</label>
              <Select placeholder="Select phase" allowClear style={{ width: '100%' }}>
                {mockPhases.map(phase => (
                  <Option key={phase.id} value={phase.id}>
                    {phase.name}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Student</label>
              <Input
                placeholder="Search student"
                prefix={<SearchOutlined />}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">&nbsp;</label>
              <Button type="primary" icon={<FilterOutlined />}>
                Apply Filters
              </Button>
            </div>
          </Col>
        </Row>
      </div>
    </Card>
  )
}

export default FilterBar