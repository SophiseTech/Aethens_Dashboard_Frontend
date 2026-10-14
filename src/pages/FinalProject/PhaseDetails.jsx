import { ArrowLeftOutlined } from '@ant-design/icons';
import Title from '@components/layouts/Title';
import { usePhaseView } from '@hooks/business/usePhaseView';
import NewSubmissionForm from '@pages/FinalProject/Components/NewSubmissionForm';
import PhaseHeader from '@pages/FinalProject/Components/PhaseHeader';
import PhaseInstructions from '@pages/FinalProject/Components/PhaseInstructions';
import SubmissionHistory from '@pages/FinalProject/Components/SubmissionHistory';
import { Button, Empty, Spin } from 'antd';
import { Link } from 'react-router-dom'


function PhaseDetails() {
  const {
    currentPhaseInfo,
    viewContext,
    loading,
    allPhasesPath,
    onSubmit,
  } = usePhaseView();

  const renderContent = () => {
    if (loading) {
      return <div className='w-full h-full flex items-center justify-center'><Spin size="large" /></div>
    }

    if (!currentPhaseInfo.phase) {
      return <Empty />
    }

    return (
      <div className="max-w-6xl w-full mx-auto">
        <PhaseHeader {...currentPhaseInfo} />
        <PhaseInstructions {...currentPhaseInfo} />
        <SubmissionHistory submissions={currentPhaseInfo.submissions} />
        {viewContext.canSubmit && currentPhaseInfo.canSubmit && <NewSubmissionForm {...currentPhaseInfo} onSubmit={onSubmit} />}
      </div>
    )
  }

  return (
    <Title
      title="Final Project"
      button={
        <Link to={allPhasesPath}>
          <Button icon={<ArrowLeftOutlined />} variant="outlined">All phases</Button>
        </Link>
      }
    >
      {renderContent()}
    </Title>
  )
}

export default PhaseDetails
