import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function NotificationsRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/?notifications=open', { replace: true });
  }, [navigate]);

  return null;
}

export default NotificationsRedirect;
