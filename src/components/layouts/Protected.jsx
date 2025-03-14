import FullPageLoading from '@components/Loaders/FullPageLoading';
import userStore from '@stores/UserStore'
import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom';

function Protected({ roles }) {
  const { checkAuth, authLoading, isAuthenticated, user } = userStore()
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserAuth = async () => {
      await checkAuth();
    };

    checkUserAuth();
  }, [checkAuth]);


  if (authLoading) return <FullPageLoading />;

  if (!isAuthenticated) {
    navigate('/auth/login');
    return null;
  }

  if (!user || (roles && !roles.includes(user.role))) {
    navigate('/unauthorized');
    return null;
  }

  return <Outlet context={{ roles }} />;
}

export default Protected