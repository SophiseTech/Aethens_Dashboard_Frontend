import Protected from "@components/layouts/Protected";
import SidebarLayout from "@components/layouts/Sidebar";
import FinalProjectPage from "@pages/FinalProject";
import PhaseListPage from "@pages/FinalProject/PhaseList";
import { ROLES } from "@utils/constants";
import { Spin } from "antd";
import { lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";

const Students = lazy(() => import("@pages/Students"))
const Bills = lazy(() => import("@pages/Bills"));
const BillDetails = lazy(() => import("@pages/Bills/Components/BillDetails"));
const Inventory = lazy(() => import("@pages/Inventory"));
const PayslipDetails = lazy(() => import("@pages/Payslips/components/PayslipDetails"));
const ManagerPayslips = lazy(() => import("@pages/Payslips/Manager"));
const ManagerFacultyDevelopmentProgram = lazy(() => import("@pages/FacultyDevelopmentProgram/Manager"));
const ManagerMaterials = lazy(() => import("@pages/ManagerMaterials"));
const FacultyAttendance = lazy(() => import("@pages/Attendance/FacultyAttendance"))
const ManagerSlots = lazy(() => import("@pages/Slots/ManagerSlots"))
const ManagerCourseHistory = lazy(() => import("@pages/CourseHistory/ManagerCourseHistory"))
const ManagerAnnouncementPage = lazy(() => import("@pages/Announcement/ManagerAnnouncement"))
const ReviewSubmission = lazy(() => import("@pages/FinalProject/ReviewSubmission"))
const StudentProjectDetails = lazy(() => import("@pages/FinalProject/StudentProjectDetails"))
const PhaseDetails = lazy(() => import("@pages/FinalProject/PhaseDetails"))

export const LazyLoader = ({ element }) => {
  const location = useLocation();
  return (<Suspense
    fallback={
      <div className="w-full h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    }
    key={location.pathname}
  >
    {element}
  </Suspense>)
};


export const managerRoutes = [
  {
    element: <Protected roles={[ROLES.MANAGER]} />,
    children: [
      {
        element: <SidebarLayout />,
        children: [
          {
            path: "/manager/students",
            element: <LazyLoader element={<Students />} />,
            title: "Students"
          },
          {
            path: "/manager/inventory",
            element: <LazyLoader element={<Inventory />} />,
            title: "Inventory"
          },
          {
            path: "/manager/materials",
            element: <LazyLoader element={<ManagerMaterials />} />,
            title: "Materials"
          },
          {
            path: "/manager/courseHistory/:studentId",
            element: <LazyLoader element={<ManagerCourseHistory />} />,
            title: "Materials"
          },
          {
            path: "/manager/faculty-development-program",
            element: <LazyLoader element={<ManagerFacultyDevelopmentProgram />} />,
            title: "Materials"
          },
          {
            path: "/manager/payslips",
            element: <LazyLoader element={<ManagerPayslips />} />,
            title: "Payslips",
            children: [
              {
                path: ":id",
                element: <LazyLoader element={<PayslipDetails />} />,
                title: "Payslips"
              },
            ]
          },
          {
            path: "/manager/bills",
            element: <LazyLoader element={<Bills />} />,
            title: "Bills",
            children: [
              {
                path: ":id",
                element: <LazyLoader element={<BillDetails />} />,
                title: "Bills"
              },
            ]
          },
          {
            path: "/manager/attendance/:id/c/:course_id",
            element: (
              <LazyLoader element={<FacultyAttendance />} />
            ),
            title: "Attendance",
          },
          {
            path: "/manager/slots",
            element: (
              <LazyLoader element={<ManagerSlots />} />
            ),
            title: "Slots",
          },
          {
            path: "/manager/announcements",
            element: (
              <LazyLoader element={<ManagerAnnouncementPage />} />
            ),
            title: "Slots",
          },
          {
            path: "/manager/final-project",
            element: (
              <FinalProjectPage />
            ),
            title: "Slots",
          },
          {
            path: "/manager/final-project/submission/:submissionId",
            element: <LazyLoader element={<ReviewSubmission />} />,
            title: "Payslips"
          },
          {
            path: "/manager/final-project/:projectId/student/:studentId/phases",
            element: <LazyLoader element={<StudentProjectDetails />} />,
            title: "Payslips"
          },
          {
            path: "/manager/final-project/:projectId/student/:studentId/phase/:phaseId",
            element: (
              <LazyLoader element={<PhaseDetails />} />
            ),
            title: "Slots",
          },
        ]
      }
    ]
  }
]