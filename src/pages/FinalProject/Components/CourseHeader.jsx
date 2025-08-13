import { Avatar, Card, Tag, Typography } from 'antd'
import React from 'react'
const { Title, Text } = Typography;

function CourseHeader({ course }) {
  return (
    <Card className="mb-6 bg-gradient-to-r from-green-50 to-lime-50 border-0 shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="!mb-2 !text-gray-800">{course.course_name}</Title>
          <Text className="text-lg text-gray-600">Final Project</Text>
          <div className="mt-2">
            <Tag color="green" className="text-sm">
              {course.totalPhases} Phases Total
            </Tag>
          </div>
        </div>
        <Avatar size={64} className="bg-lime-800 text-xl">
          {course.course_name?.split(' ').map(word => word[0]).join('')}
        </Avatar>
      </div>
    </Card>
  )
}

export default CourseHeader