import { Card, Col, Row, Select } from 'antd'
import React from 'react'

function StudentSearchBar({ students, onSelect }) {
  return (
    <Card className="mb-4">
      <div>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={6}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Students</label>
              <Select placeholder="Select course" allowClear style={{ width: '100%' }}
                onChange={(option) => {
                  onSelect(option);
                }}
              >
                {students.map(student => (
                  <Option key={student._id} value={student._id} >
                    {student.username}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
          {/* <Col xs={24} sm={12} md={6}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">&nbsp;</label>
              <Button type="primary" icon={<FilterOutlined />}>
                Apply Filters
              </Button>
            </div>
          </Col> */}
        </Row>
      </div>
    </Card>
  )
}

export default StudentSearchBar