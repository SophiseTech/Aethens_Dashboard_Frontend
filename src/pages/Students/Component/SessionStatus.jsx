import userStore from '@stores/UserStore';
import { isUserActive } from '@utils/helper';
import { Button } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from 'zustand';

function SessionStatus({ student }) {
  const navigate = useNavigate();
  const { user } = useStore(userStore);

  const handleClick = () => {
    if (user.role === 'academic_manager') {
      navigate(`/acmanager/session-status/${student._id}`, { state: { student } });
    } else {
      navigate(`/faculty/session-status/${student._id}`, { state: { student } });
    }
  };

  return (
    <Button onClick={handleClick} variant='filled' color='green' disabled={!isUserActive(student)}>
      Add Session Status
    </Button>
  );
}

export default SessionStatus