import Protected from "@components/layouts/Protected";
import SidebarLayout from "@components/layouts/Sidebar";
import FinalProjectPage from "@pages/FinalProject";
import { ROLES } from "@utils/constants";
import { Spin } from "antd";
import { lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";

const Students = lazy(() => import("@pages/Students"))
const Enquiries = lazy(() => import("@pages/Enquiries"))
const Targets = lazy(() => import("@pages/Targets"))
const Wallets = lazy(() => import("@pages/Wallets/index.jsx"))
const Remarks = lazy(() => import("@pages/Remarks/index.jsx"))
const EnquirySlots = lazy(() => import("@pages/EnquirySlots"))
const Bills = lazy(() => import("@pages/Bills"));
const BillDetails = lazy(() => import("@pages/Bills/Components/BillDetails"));
const Inventory = lazy(() => import("@pages/Inventory"));
const InventoryItems = lazy(() => import("@pages/InventoryItems"));
const Audits = lazy(() => import("@pages/Audits"));
const PayslipDetails = lazy(() => import("@pages/Payslips/components/PayslipDetails"));
const ManagerPayslips = lazy(() => import("@pages/Payslips/Manager"));
const ManagerFacultyDevelopmentProgram = lazy(() => import("@pages/FacultyDevelopmentProgram/Manager"));
const ManagerMaterials = lazy(() => import("@pages/ManagerMaterials"));
const FacultyAttendance = lazy(() => import("@pages/Attendance/FacultyAttendance"))
const ManagerSlots = lazy(() => import("@pages/Slots/ManagerSlots"))
const ManagerCourseHistory = lazy(() => import("@pages/CourseHistory/ManagerCourseHistory"))
const ManagerAnnouncementPage = lazy(() => import("@pages/Announcement/ManagerAnnouncement"))
const Notifications = lazy(() => import("@pages/Notifications/Notifications"))
const ReviewSubmission = lazy(() => import("@pages/FinalProject/ReviewSubmission"))
const StudentProjectDetails = lazy(() => import("@pages/FinalProject/StudentProjectDetails"))
const PhaseDetails = lazy(() => import("@pages/FinalProject/PhaseDetails"))
const FinalProjectStudentView = lazy(() => import("@pages/FinalProject/Components/FinalProjectStudentView"))
const Tasks = lazy(() => import("@pages/Tasks"))
const Holidays = lazy(() => import("@pages/Holidays"))
const AttendanceRegister = lazy(() => import("@pages/AttendanceRegister"))
const SyllabusGallery = lazy(() => import("@pages/SyllabusGallery"))

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
    element: <Protected roles={[ROLES.MANAGER, ROLES.ADMIN, ROLES.OPERATIONS_MANAGER, ROLES.ACADEMIC_MANAGER]} />,
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
            path: "/manager/enquiries",
            element: <LazyLoader element={<Enquiries />} />,
            title: "Enquiries"
          },
          {
            path: "/manager/wallets/s/:studentId",
            element: <LazyLoader element={<Wallets />} />,
            title: "Wallets"
          },
          {
            path: "/manager/remarks/s/:studentId",
            element: <LazyLoader element={<Remarks />} />,
            title: "Remarks"
          },
          {
            path: "/manager/enquiry-slots",
            element: <LazyLoader element={<EnquirySlots />} />,
            title: "Enquiry Slots"
          },
          {
            path: "/manager/targets",
            element: <LazyLoader element={<Targets />} />,
            title: "Targets"
          },
          {
            path: "/manager/inventory",
            element: <LazyLoader element={<Inventory />} />,
            title: "Inventory"
          },
          {
            path: "/manager/inventory-items",
            element: <LazyLoader element={<InventoryItems />} />,
            title: "Inventory Items"
          },
          {
            path: "/manager/audits",
            element: <LazyLoader element={<Audits />} />,
            title: "Audits"
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
            path: "/manager/notifications",
            element: (
              <LazyLoader element={<Notifications />} />
            ),
            title: "Notifications",
          },
          {
            path: "/manager/holidays",
            element: <LazyLoader element={<Holidays />} />,
            title: "Holidays"
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
          {
            path: "/manager/final-project/student/:studentId/details",
            element: <LazyLoader element={<FinalProjectStudentView />} />,
            title: "Slots",
          },
          {
            path: "/manager/tasks",
            element: <LazyLoader element={<Tasks />} />,
            title: "Tasks",
          },
          {
            path: "/manager/attendance-register",
            element: <LazyLoader element={<AttendanceRegister />} />,
            title: "Attendance Register",
          },
          {
            path: "/admin/syllabus-gallery",
            element: <LazyLoader element={<SyllabusGallery />} />,
            title: "Syllabus Gallery",
          },
        ]
      }
    ]
  }
]

LazyLoader.propTypes = {
  element: PropTypes.element.isRequired,
};