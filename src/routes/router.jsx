import { facultyRoutes } from '@/routes/faculty';
import { generalRoutes } from '@/routes/general';
import { managerRoutes } from '@/routes/manager';
import { purchaseManagerRoutes } from '@/routes/purchaseManager';
import { Navigate, Route, Routes } from 'react-router-dom';

const renderRoutes = (routes) => {
  return routes.map(({ path, title, element, children = [] }, index) => {
    return (
      <Route key={title || index} path={path} element={element}>
        {children.length > 0 && renderRoutes(children)}
      </Route>
    );
  });
};

const Router = () => {
  const pageRoutes = renderRoutes([...generalRoutes, ...managerRoutes, ...facultyRoutes, ...purchaseManagerRoutes]);
  return (
    <Routes>
      {pageRoutes}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default Router;