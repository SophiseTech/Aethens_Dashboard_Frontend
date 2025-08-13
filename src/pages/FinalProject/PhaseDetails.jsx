import { usePhaseView } from '@hooks/business/usePhaseView';
import { useFinalProject } from '@hooks/useFinalProject';
import useUser from '@hooks/useUser';
import NewSubmissionForm from '@pages/FinalProject/Components/NewSubmissionForm';
import PhaseHeader from '@pages/FinalProject/Components/PhaseHeader';
import PhaseInstructions from '@pages/FinalProject/Components/PhaseInstructions';
import SubmissionHistory from '@pages/FinalProject/Components/SubmissionHistory';
import { ROLES } from '@utils/constants';
import { Empty, Spin } from 'antd';
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'


function PhaseDetails() {
  const {
    currentPhaseInfo,
    viewContext,
    loading,
    onSubmit,
    onReview
  } = usePhaseView();

  if (loading) {
    return <div className='w-full h-full flex items-center justify-center'><Spin size="large" /></div>
  }

  if (!currentPhaseInfo.phase) {
    return <Empty />
  }

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen">

      <PhaseHeader {...currentPhaseInfo} />
      <PhaseInstructions {...currentPhaseInfo} />
      <SubmissionHistory submissions={currentPhaseInfo.submissions} />
      {viewContext.canSubmit && currentPhaseInfo.canSubmit && <NewSubmissionForm {...currentPhaseInfo} onSubmit={onSubmit} />}
    </div>
  )
}

export default PhaseDetails