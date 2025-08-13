import { BookOutlined } from '@ant-design/icons';
import { useFinalProject } from '@hooks/useFinalProject';
import useUser from '@hooks/useUser';
import SubmissionHeader from '@pages/FinalProject/Components/SubmissionHeader';
import SubmissionHistory from '@pages/FinalProject/Components/SubmissionHistory';
import SubmissionImageViewer from '@pages/FinalProject/Components/SubmissionImageViewer';
import SubmissionReviewForm from '@pages/FinalProject/Components/SubmissionReviewForm';
import { Card, Empty, message, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const { Text } = Typography

const submission = {
  studentName: 'John Doe',
  courseName: 'Web Development Fundamentals',
  phaseTitle: 'Frontend Implementation',
  submittedDate: '2025-01-10',
  subject: 'E-commerce Website Frontend'
};

const submissionHistory = [
  { date: '2025-01-08', status: 'approved', remarks: 'Initial submission' },
  { date: '2025-01-05', status: 'rejected', remarks: 'Working on implementation' }
];

const mockImages = [
  'https://picsum.photos/400/300?random=1',
  'https://picsum.photos/400/300?random=2',
  'https://picsum.photos/400/300?random=3'
];

function ReviewSubmission() {
  const { fetchSubmissionDetails, currentSubmission, reviewSubmission, loading } = useFinalProject()
  const { submissionId } = useParams()
  const { user } = useUser()

  const [selectedImage, setSelectedImage] = useState(null);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchSubmissionDetails(submissionId)
  }, [])

  const onSubmit = (status) => {
    if (!currentSubmission) return message.error('No submission details available');
    const reviewData = {
      remark: remarks,
      status,
      selectedImageId: selectedImage,
      managerId: user._id
    }
    reviewSubmission(currentSubmission._id, reviewData)
  }

  if (loading) {
    return <div className='w-full h-full flex items-center justify-center'><Spin size="large" /></div>
  }

  if (!currentSubmission) return <Empty description="Loading submission details..." />

  return (
    <div className="p-6">
      <SubmissionHeader submission={currentSubmission} />

      <Card title={<><BookOutlined /> Project Subject</>} className="mb-4">
        <Text>{currentSubmission?.subject}</Text>
      </Card>

      <SubmissionImageViewer images={currentSubmission?.images} selectedImage={selectedImage} setSelectedImage={setSelectedImage} />

      <SubmissionReviewForm remarks={remarks} setRemarks={setRemarks} onSubmit={onSubmit} />

      <SubmissionHistory submissions={currentSubmission?.history} />
    </div>
  )
}

export default ReviewSubmission