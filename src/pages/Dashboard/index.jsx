import Title from '@components/layouts/Title';
import userStore from '@stores/UserStore';
import { ROLES } from '@utils/constants';
import { Spin } from 'antd';
import { lazy, Suspense } from 'react';

// ✅ Define lazy imports ONCE here
const Student = lazy(() => import('@pages/Dashboard/Student'));
const Manager = lazy(() => import('@pages/Dashboard/Manager'));
const ManagerStudents = lazy(() => import('@pages/Students/ManagerStudents'));

function Dashboard() {
  const { user } = userStore();

  const renderDashboard = () => {
    switch (user.role) {
      case ROLES.STUDENT:
        return <Student />;
      case ROLES.MANAGER:
        return <Manager />;
      case ROLES.FACULTY:
        return <ManagerStudents />;
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
