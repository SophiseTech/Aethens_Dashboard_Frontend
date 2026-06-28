import PhaseCard from '@pages/FinalProject/Components/PhaseCard';
import { Typography } from 'antd';
import React from 'react'
const { Title } = Typography;

function PhaseList({ phases, onViewPhase, onSkipPhase, submissionInfo }) {

  return (
    <div>
      <Title level={3} className="mb-4">Project Phases</Title>
      {phases.map(phase => (
        <PhaseCard key={phase._id} phase={phase} onViewPhase={onViewPhase} onSkipPhase={onSkipPhase} disabled={submissionInfo.nextPhase?.phaseNumber < phase.phaseNumber} />
      ))}
    </div>
  )
}

export default PhaseList