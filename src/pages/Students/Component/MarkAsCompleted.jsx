import { Button, Modal, message } from 'antd';
import { useState } from 'react';
import PropTypes from 'prop-types';
import studentStore from '@stores/StudentStore';
import { isUserActive } from '@utils/helper';

function MarkAsCompleted({ student }) {
  const [loading, setLoading] = useState(false);
  const [completedLocally, setCompletedLocally] = useState(false);
  const markCourseCompleted = studentStore((state) => state.markCourseCompleted);

  const isCompleted = completedLocally || Boolean(student?.isCourseCompleted || student?.enrollmentStatus === 'completed');

  const handleMarkCompleted = () => {
    Modal.confirm({
      title: 'Mark Course Completed',
      content: 'Are you sure you want to mark this student\'s course as completed?',
      okText: 'Mark Course Completed',
      cancelText: 'Cancel',
      okType: 'primary',
      onOk: async () => {
        try {
          setLoading(true);
          await markCourseCompleted(student?._id);
          setCompletedLocally(true);
          message.success('Course marked as completed successfully');
        } catch (error) {
          message.error(error?.message || 'Failed to mark course as completed');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <Button
      onClick={handleMarkCompleted}
      disabled={!isUserActive(student) || isCompleted}
      loading={loading}
      variant="filled"
      color="green"
    >
      Mark Course Completed
    </Button>
  );
}

MarkAsCompleted.propTypes = {
  student: PropTypes.shape({
    _id: PropTypes.string,
  }).isRequired,
};

export default MarkAsCompleted;
