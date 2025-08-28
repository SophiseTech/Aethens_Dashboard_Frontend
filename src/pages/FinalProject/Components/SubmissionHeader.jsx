import { BookOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons'
import { formatDate } from '@utils/helper'
import { Avatar, Card, Col, Divider, Row, Space, Typography } from 'antd'
import React from 'react'

const { Text } = Typography

function SubmissionHeader({submission}) {
  return (
    <Card className="mb-4">
      <Row gutter={24}>
        <Col span={12}>
          <Space direction="vertical" size="small">
            <Text strong>Student:</Text>
            <Space>
              <Avatar icon={<UserOutlined />} />
              <Text>{submission.studentName}</Text>
            </Space>
          </Space>
        </Col>
        <Col span={12}>
          <Space direction="vertical" size="small">
            <Text strong>Course:</Text>
            <Space>
              <BookOutlined />
              <Text>{submission.courseName}</Text>
            </Space>
          </Space>
        </Col>
      </Row>
      <Divider />
      <Row gutter={24}>
        <Col span={12}>
          <Space direction="vertical" size="small">
            <Text strong>Phase:</Text>
            <Text>{submission.phaseTitle}</Text>
          </Space>
        </Col>
        <Col span={12}>
          <Space direction="vertical" size="small">
            <Text strong>Submitted:</Text>
            <Space>
              <CalendarOutlined />
              <Text>{formatDate(submission.submittedAt)}</Text>
            </Space>
          </Space>
        </Col>
      </Row>
    </Card>
  )
}

export default SubmissionHeader