import { FileImageOutlined } from '@ant-design/icons'
import SubmitHistoryCard from '@pages/FinalProject/Components/SubmitHistoryCard'
import { formatDate } from '@utils/helper'
import { Card, Grid, Timeline, Typography } from 'antd'
import React from 'react'

const { Text } = Typography
const { useBreakpoint } = Grid

function SubmissionHistory({ submissions }) {
  // Alternate sides on laptops/desktops (lg ≥ 992px). On mobile/tablet, keep every
  // item on one side, with the date above its card instead of in a label column,
  // which would take half the width.
  const { lg } = useBreakpoint()

  return (
    <Card title="Submission History" className="mb-6" headStyle={{ backgroundColor: '#fafafa' }}>
      {submissions.length > 0 ? (
        <Timeline mode={lg ? 'alternate' : 'left'}
          items={submissions.map((submission, index) => ({
            key: index,
            label: lg ? formatDate(submission.submittedAt) : undefined,
            children: lg ? (
              <SubmitHistoryCard submission={submission} />
            ) : (
              <>
                <Text type="secondary" className="block mb-1">{formatDate(submission.submittedAt)}</Text>
                <SubmitHistoryCard submission={submission} />
              </>
            )
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
