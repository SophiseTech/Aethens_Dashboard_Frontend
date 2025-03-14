import Title from '@components/layouts/Title';
import userStore from '@stores/UserStore';
import { ROLES } from '@utils/constants';
import { Spin } from 'antd';
import { lazy, Suspense } from 'react';

function Dashboard() {
  const { user } = userStore();

  const renderDashboard = () => {
    switch (user.role) {
      case ROLES.STUDENT: {
        const Student = lazy(() => import('@pages/Dashboard/Student'));
        return <Student />;
      }
      case ROLES.MANAGER: {
        const Manager = lazy(() => import('@pages/Dashboard/Manager'));
        return <Manager />;
      }
      case ROLES.FACULTY: {
        const ManagerStudents = lazy(() => import('@pages/Students/ManagerStudents'));
        return <ManagerStudents />;
      }
      default:
        return <p>404</p>;
    }
  };

  return (
    <Title title="Dashboard">
      <Suspense fallback={<Spin />}>
        {renderDashboard()}
      </Suspense>
    </Title>
  );
}

export default Dashboard;
