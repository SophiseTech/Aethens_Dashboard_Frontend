import { FileImageOutlined } from '@ant-design/icons'
import SubmitHistoryCard from '@pages/FinalProject/Components/SubmitHistoryCard'
import { formatDate } from '@utils/helper'
import { Card, Timeline, Typography } from 'antd'
import React from 'react'

const { Text } = Typography

function SubmissionHistory({ submissions }) {

  return (
    <Card title="Submission History" className="mb-6" headStyle={{ backgroundColor: '#fafafa' }}>
      {submissions.length > 0 ? (
        <Timeline mode="alternate"
          items={submissions.map((submission, index) => ({
            key: index,
            label: formatDate(submission.submittedAt),
            children: <SubmitHistoryCard submission={submission} />
          }))}
        />
      ) : (
        <div className="text-center py-8 text-gray-500">
          <FileImageOutlined className="text-4xl mb-2 block" />
          <Text>No submissions yet</Text>
        </div>
      )}
    </Card>
  )
}

export default SubmissionHistory