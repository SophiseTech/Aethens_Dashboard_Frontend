import { CheckOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { statusConfig } from '@pages/FinalProject';
import userStore from '@stores/UserStore';
import { formatDate } from '@utils/helper';
import permissions from '@utils/permissions';
import { Button, Card, Space, Tag, Typography } from 'antd';
const { Title, Paragraph, Text } = Typography;

function PhaseCard({ phase, onViewPhase, onSkipPhase, disabled = false }) {
  const config = statusConfig[phase.latestSubmission?.status] || statusConfig['not_started'];
  const { user } = userStore()

  return (
    <Card
      className="mb-4 border border-gray-200 transition-shadow duration-200 hover:shadow-md"
      bodyStyle={{ padding: '20px' }}
    >
      <div className="flex flex-col justify-between items-start sm:flex-row sm:items-center">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <div className="flex justify-center items-center mr-3 w-8 h-8 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full">
              {phase.phaseNumber}
            </div>
            <Title level={4} className="!mb-0">
              {phase.title}
            </Title>
          </div>

          <Paragraph className="mb-3 text-gray-600" ellipsis={{ rows: 2 }}>
            {phase.description}
          </Paragraph>

          <Space size={[0, 8]} wrap className="mb-3">
            <Tag icon={config.icon} color={config.color}>
              {config.text}
            </Tag>

            {phase.requiresSubject && (
              <Tag color="orange" icon={<EditOutlined />}>
                Subject Required
              </Tag>
            )}

            {phase.latestSubmission?.submittedAt && (
              <Text type="secondary" className="text-sm">
                Last submitted: {formatDate(phase.latestSubmission.submittedAt)}
              </Text>
            )}
          </Space>
        </div>

        <div className="flex gap-2 mt-4 w-full sm:mt-0 sm:ml-4 sm:w-auto">
          <Button
            type="primary"
            icon={phase.status === 'not-started' ? <EditOutlined /> : <EyeOutlined />}
            onClick={() => onViewPhase(phase)}
            className="w-full sm:w-auto"
            disabled={disabled}
          >
            {phase.status === 'not-started' ? 'Submit Phase' : 'View Phase'}
          </Button>
          {permissions.finalProjectPhase.approve.includes(user?.role) && !['approved', 'under_review'].includes(phase.latestSubmission?.status) &&
            <Button icon={<CheckOutlined />} onClick={() => { onSkipPhase(phase) }}>Skip Phase</Button>
          }
        </div>
      </div>
    </Card>
  );
}

export default PhaseCard;