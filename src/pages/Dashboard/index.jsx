import Title from '@components/layouts/Title';
import userStore from '@stores/UserStore';
import useMediaQuery, { DESKTOP_QUERY } from '@hooks/useMediaQuery';
import { ROLES } from '@utils/constants';
import { Spin } from 'antd';
import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
// ✅ Define lazy imports ONCE here. Every role dashboard is lazy — a static import
// here would pull its dependencies (e.g. the 564 KB charts chunk) in before the
// current role's dashboard can start loading.
const AcademicManager = lazy(() => import('@pages/Dashboard/AcademicManager'));
const Student = lazy(() => import('@pages/Dashboard/Student'));
const Manager = lazy(() => import('@pages/Dashboard/Manager'));
const Admin = lazy(() => import('@pages/Dashboard/Admin'));
const ManagerStudents = lazy(() => import('@pages/Students/ManagerStudents'));

function Dashboard() {
  const { user } = userStore();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  // Matches the "Home" tab students see below the desktop breakpoint.
  const title = user.role === ROLES.STUDENT && !isDesktop ? "Home" : "Dashboard";

  const renderDashboard = () => {
    switch (user.role) {
      case ROLES.STUDENT:
        return <Student />;
      case ROLES.MANAGER:
        return <Manager />;
      case ROLES.ADMIN:
        return <Admin />;
      case ROLES.FACULTY:
        return <ManagerStudents />;
      case ROLES.OPERATIONS_MANAGER:
        return <Admin />;
      case ROLES.ACADEMIC_MANAGER:
        return <AcademicManager />;
      case ROLES.MEDIA_MANAGER:
        return <Navigate to="/admin/blog-posts" replace />;
      case ROLES.PURCHASE_MANAGER:
        return <Navigate to="/purchase-manager/inventory" replace />;
      default:
        return <p>404</p>;
    }
  };

  return (
    <Title title={title}>
      <Suspense fallback={<Spin />}>
        {renderDashboard()}
      </Suspense>
    </Title>
  );
}

export default Dashboard;
