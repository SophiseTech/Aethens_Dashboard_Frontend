import PhaseCard from '@pages/FinalProject/Components/PhaseCard';
import { useFinalProject } from '@hooks/useFinalProject';
import { Typography } from 'antd';
import React from 'react'
const { Title } = Typography;

function PhaseList({ phases, onViewPhase, submissionInfo }) {
  return (
    <div>
      <Title level={3} className="mb-4">Project Phases</Title>
      {phases.map(phase => (
        <PhaseCard key={phase._id} phase={phase} onViewPhase={onViewPhase} disabled={submissionInfo.nextPhase?.phaseNumber < phase.phaseNumber} />
      ))}
    </div>
  )
}

export default PhaseList