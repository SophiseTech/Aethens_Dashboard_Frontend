import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SlotRequestRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/?notifications=open', { replace: true });
  }, [navigate]);

  return null;
}

export default SlotRequestRedirect;
