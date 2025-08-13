import { useFinalProject } from '@hooks/useFinalProject';
import { Card, Progress, Typography } from 'antd';
import React from 'react'
const { Title, Text } = Typography;

function ProgressBar({ submissionInfo }) {

  return (
    <Card className="mb-6">
      <Title level={4} className="!mb-4">Project Progress</Title>
      <Progress
        percent={submissionInfo.progress.percentage}
        strokeColor={{
          '0%': '#3d4f15',   // darker olive
          '100%': '#b2c57d',
        }}
        className="mb-2"
      />
      <Text type="secondary">
        {submissionInfo.progress.approved} of {submissionInfo.progress.total} phases completed
      </Text>
    </Card>
  );
}

export default ProgressBar