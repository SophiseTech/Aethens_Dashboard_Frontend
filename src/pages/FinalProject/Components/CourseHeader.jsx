import { Avatar, Card, Tag, Typography } from 'antd'
import React from 'react'
const { Title, Text } = Typography;

function CourseHeader({ course }) {
  return (
    <Card className="mb-6 bg-gradient-to-r from-green-50 to-lime-50 border-0 shadow-sm">
      <div className="flex flex-col-reverse sm:flex-row justify-between items-center sm:items-start">
        <div className="text-center sm:text-left">
          <Title level={3} className="!mb-2 !text-gray-800">
            {course.course_name}
          </Title>
          <Text className="text-base text-gray-600 block">Final Project</Text>
          <div className="mt-2">
            <Tag color="green" className="text-sm">
              {course.totalPhases} Phases Total
            </Tag>
          </div>
        </div>
        <Avatar
          size={64}
          className="bg-lime-800 text-xl mb-4 sm:mb-0"
        >
          {course.course_name?.split(' ').map(word => word[0]).join('')}
        </Avatar>
      </div>
    </Card>
  )
}

export default CourseHeader