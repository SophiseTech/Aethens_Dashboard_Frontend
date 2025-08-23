import { Card, Tag, Progress, Space, Button, Typography } from 'antd';
import {
  CalendarOutlined, RightOutlined,
  BookOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { formatDate } from '@utils/helper';

const { Title, Text, Paragraph } = Typography

function ProjectCard({ project, handleViewProjectDetails }) {
  const progress = project.approvedPhases / project.totalPhases * 100;

  const projectDetailsUrl = () => {
    if (viewContext.isManagerView) {
      return `/manager/final-project/${project._id}/details`
    } else {
      return `/student/final-project/${project._id}/phases`
    }
  }

  return (
    <Card
      className="mb-4 hover:shadow-lg transition-all duration-300 border border-gray-200 rounded-lg overflow-hidden"
      bodyStyle={{ padding: '24px' }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {/* Header with course icon and title */}
          <div className="flex items-center mb-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-semibold mr-3 shadow-sm">
              <BookOutlined />
            </div>
            <div>
              <Title level={4} className="!mb-0 text-gray-900">
                {project.course?.course_name || project.title}
              </Title>
              <Text type="secondary" className="text-sm">
                {project.course?.code || project.course?._id}
              </Text>
            </div>
          </div>

          {/* Description if available */}
          {project.description && (
            <Paragraph
              className="text-gray-600 mb-3"
              ellipsis={{ rows: 2 }}
            >
              {project.description}
            </Paragraph>
          )}

          {/* Status and Faculty Tags */}
          <Space size="middle" className="mb-4" wrap>
            <Tag
              icon={project.statusIcon}
              color={project.statusColor}
              className="px-3 py-1 rounded-full font-medium"
            >
              {project.statusText}
            </Tag>
          </Space>

          {/* Progress Section */}
          {project.totalPhases && (
            <div className="mb-3">
              <div className="flex justify-between items-center mb-2">
                <Text type="secondary" className="text-sm font-medium">
                  Phase Progress
                </Text>
                <Text className="text-sm font-semibold text-gray-700">
                  {project.approvedPhases || 0}/{project.totalPhases} Phases
                </Text>
              </div>
              <Progress
                percent={progress}
                size="small"
                strokeColor={{
                  from: '#4F46E5',
                  to: '#7C3AED',
                }}
                trailColor="#F3F4F6"
                status={project.status === 'rejected' ? 'exception' : 'active'}
                className="mb-0"
              />
            </div>
          )}

          {/* Footer with date */}
          <div className="flex items-center text-gray-500 text-sm">
            <CalendarOutlined className="mr-2" />
            <span>Started on {formatDate(project.startDate || project.createdAt)}</span>

            {project.endDate && (
              <>
                <span className="mx-2">•</span>
                <span>Due {formatDate(project.endDate)}</span>
              </>
            )}
          </div>

          {/* <div className="flex items-center text-gray-500 text-sm mt-2">
            <UserOutlined className="mr-2" />
            <span>{project.faculty?.username}</span>
          </div> */}
        </div>

        {/* Action Button */}
        <div className="ml-6">
          <Button
            type="primary"
            icon={<RightOutlined />}
            className="h-10 px-6 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200"
            onClick={() => handleViewProjectDetails(project)}
          >
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default ProjectCard;