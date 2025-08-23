import { statusConfig } from '@pages/FinalProject'
import { formatText } from '@utils/helper'
import { Card, Tag, Typography } from 'antd'
import React from 'react'
const { Title, Text } = Typography

function PhaseHeader({ phase, phaseStatus }) {

  return (
    <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-0">
      <div className="flex items-start mb-4">
        <div className="bg-purple-100 text-purple-600 rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mr-4">
          {phase.phaseNumber}
        </div>
        <div>
          <Title level={2} className="!mb-1">{phase.title}</Title>
          <Text type="secondary" className="text-base whitespace-pre-line">{formatText(phase.description)}</Text>
        </div>
      </div>
      <Tag icon={statusConfig[phaseStatus].icon} color={statusConfig[phaseStatus].color} className="text-sm">
        {statusConfig[phaseStatus].text}
      </Tag>
    </Card>
  )
}

export default PhaseHeader