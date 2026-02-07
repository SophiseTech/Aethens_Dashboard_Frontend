import { isUserActive } from '@utils/helper';
import { Button } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';

function SessionStatus({ student }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/faculty/session-status/${student._id}`, { state: { student } });
  };

  return (
    <Button onClick={handleClick} variant='filled' color='green' disabled={!isUserActive(student)}>
      Add Session Status
    </Button>
  );
}

export default SessionStatus