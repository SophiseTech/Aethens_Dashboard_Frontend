import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Card, Modal, Space } from 'antd'
import TextArea from 'antd/es/input/TextArea';
import React from 'react'
import { useNavigate } from 'react-router-dom';

function SubmissionReviewForm({ remarks, setRemarks, onSubmit }) {
  const nav = useNavigate()

  const handleApprove = () => {
    if (!remarks.trim()) {
      Modal.error({
        title: 'Remarks Required',
        content: 'Please provide remarks before approving.',
      });
      return;
    }
    console.log('Approved with remarks:', remarks);
    onSubmit('approved');
    Modal.success({
      title: 'Submission Approved',
      content: 'The submission has been approved successfully.',
      onOk: nav('/manager/final-project'),
      onCancel: nav('/manager/final-project'),
      onClose: nav('/manager/final-project')
    });
  };

  const handleReject = () => {
    if (!remarks.trim()) {
      Modal.error({
        title: 'Remarks Required',
        content: 'Please provide remarks before rejecting.',
      });
      return;
    }
    console.log('Rejected with remarks:', remarks);
    onSubmit('rejected');
    Modal.error({
      title: 'Submission Rejected',
      content: 'The submission has been rejected.',
      onOk: nav('/manager/final-project'),
      onCancel: nav('/manager/final-project'),
      onClose: nav('/manager/final-project')
    });
  };

  return (
    <Card title="Review Submission">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Remarks *</label>
          <TextArea
            rows={4}
            placeholder="Enter your feedback and remarks..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        <Space>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={handleApprove}
            size="large"
          >
            Approve
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            onClick={handleReject}
            size="large"
          >
            Reject
          </Button>
        </Space>
      </div>
    </Card>
  )
}

export default SubmissionReviewForm