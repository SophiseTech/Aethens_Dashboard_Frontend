import Protected from "@components/layouts/Protected";
import SidebarLayout from "@components/layouts/Sidebar";
import { ROLES } from "@utils/constants";
import { Spin } from "antd";
import { lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";

const ManagerStudents = lazy(() => import("@pages/Students/ManagerStudents"))
const FacultyCourses = lazy(() => import("@pages/Courses/FacultyCourses"))
const PayslipDetails = lazy(() => import("@pages/Payslips/components/PayslipDetails"))
const FacultyPayslips = lazy(() => import("@pages/Payslips/Faculty"))
const FacultyAcitivities = lazy(() => import("@pages/Activities/FacultyAcitivities"))
const Activities = lazy(() => import("@pages/Activities"))
const ManagerMaterials = lazy(() => import("@pages/ManagerMaterials"))
const FacultyDevelopmentProgram = lazy(() => import("@pages/FacultyDevelopmentProgram/Faculty"))
const FacultyAttendance = lazy(() => import("@pages/Attendance/FacultyAttendance"))
const ManagerCourseHistory = lazy(() => import("@pages/CourseHistory/ManagerCourseHistory"))
const Slots = lazy(() => import("@pages/Slots/ManagerSlots"))
const MyAttendance = lazy(() => import("@pages/FacultyAttendance/MyAttendance"))
const MyLeaves = lazy(() => import("@pages/FacultyLeaves/MyLeaves"))
const AddSessionStatus = lazy(() => import("@pages/Students/AddSessionStatus"))
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


export const facultyRoutes = [
  {
    element: <Protected roles={[ROLES.FACULTY]} />,
    children: [
      {
        element: <SidebarLayout />,
        children: [
          {
            path: "/",
            element: <LazyLoader element={<ManagerStudents />} />,
            title: "Students"
          },
          {
            path: "/faculty/courses",
            element: <LazyLoader element={<FacultyCourses />} />,
            title: "Courses"
          },
          {
            path: "/faculty/activities/:id",
            element: <LazyLoader element={<FacultyAcitivities />} />,
            title: "Courses"
          },
          {
            path: "/faculty/faculty-development-program",
            element: <LazyLoader element={<FacultyDevelopmentProgram />} />,
            title: "Courses"
          },
          {
            path: "/faculty/activities/student/:id",
            element: (
              <LazyLoader element={<Activities />} />
            ),
            title: "Activities",
          },
          {
            path: "/faculty/materials",
            element: <LazyLoader element={<ManagerMaterials />} />,
            title: "Materials"
          },
          {
            path: "/faculty/payslips",
            element: <LazyLoader element={<FacultyPayslips />} />,
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
            path: "/faculty/attendance/:id/c/:course_id",
            element: (
              <LazyLoader element={<FacultyAttendance />} />
            ),
            title: "Attendance",
          },
          {
            path: "/faculty/slots",
            element: (
              <LazyLoader element={<Slots />} />
            ),
            title: "Attendance",
          },
          {
            path: "/faculty/courseHistory/:studentId",
            element: <LazyLoader element={<ManagerCourseHistory />} />,
            title: "Materials"
          },
          {
            path: "/faculty/my-attendance",
            element: <LazyLoader element={<MyAttendance />} />,
            title: "My Attendance"
          },
          {
            path: "/faculty/my-leaves",
            element: <LazyLoader element={<MyLeaves />} />,
            title: "My Leaves"
          },
          {
            path: "/faculty/session-status/:studentId",
            element: <LazyLoader element={<AddSessionStatus />} />,
            title: "Add Session Status"
          },
          {
            path: "/faculty/syllabus-gallery",
            element: <LazyLoader element={<SyllabusGallery />} />,
            title: "Syllabus Gallery",
          },
        ]
      }
    ]
  }
]