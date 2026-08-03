import Protected from "@components/layouts/Protected";
import SidebarLayout from "@components/layouts/Sidebar";
import { ROLES } from "@utils/constants";
import { Spin } from "antd";
import { lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";

const Inventory = lazy(() => import("@pages/Inventory"));
const InventoryLedger = lazy(() => import("@pages/InventoryLedger"));

const LazyLoader = ({ element }) => {
  const location = useLocation();
  return (<Suspense
    fallback={
      <div className="flex justify-center items-center w-full h-screen">
        <Spin size="large" />
      </div>
    }
    key={location.pathname}
  >
    {element}
  </Suspense>)
};

export const purchaseManagerRoutes = [
  {
    element: <Protected roles={[ROLES.ADMIN, ROLES.PURCHASE_MANAGER]} />,
    children: [
      {
        element: <SidebarLayout />,
        children: [
          {
            path: "/purchase-manager/inventory",
            element: <LazyLoader element={<Inventory />} />,
            title: "Central Store"
          },
          {
            path: "/purchase-manager/ledger",
            element: <LazyLoader element={<InventoryLedger />} />,
            title: "Inventory Ledger"
          },
        ]
      }
    ]
  }
]
