import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import { statusConfig } from '@pages/FinalProject';
import { formatDate } from '@utils/helper';
import { Button, Card, Space, Tag, Typography } from 'antd';
const { Title, Paragraph, Text } = Typography;

function PhaseCard({ phase, onViewPhase, disabled = false }) {
  const config = statusConfig[phase.latestSubmission?.status] || statusConfig['not_started'];

  return (
    <Card
      className="mb-4 hover:shadow-md transition-shadow duration-200 border border-gray-200"
      bodyStyle={{ padding: '20px' }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold mr-3">
              {phase.phaseNumber}
            </div>
            <Title level={4} className="!mb-0">{phase.title}</Title>
          </div>

          <Paragraph className="text-gray-600 mb-3" ellipsis={{ rows: 2 }}>
            {phase.description}
          </Paragraph>

          <Space size="middle" className="mb-3">
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

        <Button
          type="primary"
          icon={phase.status === 'not-started' ? <EditOutlined /> : <EyeOutlined />}
          onClick={() => onViewPhase(phase)}
          className="ml-4"
          disabled={disabled}
        >
          {phase.status === 'not-started' ? 'Submit Phase' : 'View Phase'}
        </Button>
      </div>
    </Card>
  );
}

export default PhaseCard