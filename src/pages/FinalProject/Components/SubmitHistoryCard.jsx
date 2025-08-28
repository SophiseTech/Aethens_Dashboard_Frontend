import { FileImageOutlined } from '@ant-design/icons';
import { statusConfig } from '@pages/FinalProject';
import { formatDate } from '@utils/helper';
import { Alert, Card, Image, Tag, Timeline, Typography } from 'antd';
import React from 'react'

const { Text } = Typography

function SubmitHistoryCard({ submission }) {
  const config = statusConfig[submission.status];
  

  return (
    <Card size="small" className="ml-2 mb-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <Text strong>Attempt #{submission.attemptNumber}</Text>
          <Tag color={config.color} size="small" className="ml-2">
            {config.text}
          </Tag>
        </div>
        <Text type="secondary" className="text-sm">
          {formatDate(submission.submittedAt)}
        </Text>
      </div>

      {submission?.subject &&
        <Text type="primary" className="text-md font-bold">
          {submission.subject}
        </Text>
      }

      {submission.remark && (
        <Alert
          message="Manager Feedback"
          description={submission.remark}
          type={submission.status === 'rejected' ? 'error' : 'info'}
          size="small"
          showIcon
          className="mb-3"
        />
      )}

      {submission.images?.length > 0 && (
        <div>
          <Text type="secondary" className="text-sm block mb-2">
            Submitted Files ({submission.images.length}):
          </Text>
          <div className="flex flex-wrap gap-4">
            {submission.images.map((image, index) => (
              <div
                key={index}
                className={`relative group rounded-lg overflow-hidden shadow-md border border-gray-200 bg-white transition-transform hover:scale-105 ${image === submission.selectedImage ? 'ring-2 ring-blue-500' : ''}`}
                style={{ width: 250, height: 'auto' }}
              >
                <Image src={image.fileUrl} />
                {image._id === submission.selectedImageId && (
                  <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-sm px-2 py-0.5 rounded shadow">
                    Selected
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export default SubmitHistoryCard