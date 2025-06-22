import { lazy, Suspense } from "react";
import Protected from "@components/layouts/Protected";
import SidebarLayout from "@components/layouts/Sidebar";
import { ROLES } from "@utils/constants";
import { Spin } from "antd";
import { useLocation } from "react-router-dom";

const Login = lazy(() => import("@pages/Login"));
const Dashboard = lazy(() => import("@pages/Dashboard"));
const Gallery = lazy(() => import("@pages/Gallery"));
const Materials = lazy(() => import("@pages/Materials"));
const Activities = lazy(() => import("@pages/Activities"));
const Slots = lazy(() => import("@pages/Slots"));
const ManagerMaterials = lazy(() => import("@pages/ManagerMaterials"));
const Syllabus = lazy(() => import("@pages/Syllabus/Syllabus"));
const Attendance = lazy(() => import("@pages/Attendance"));
const Bills = lazy(() => import("@pages/Bills"));
const BillDetails = lazy(() => import("@pages/Bills/Components/BillDetails"));
const MarkAttendance = lazy(() => import("@pages/Temp/MarkAttendance"));
const MarkFacultyAttendance = lazy(() => import("@pages/Temp/MarkFacultyAttendance"));
const ManagerCourseHistory = lazy(() => import("@pages/CourseHistory/ManagerCourseHistory"));
const StudentAnnouncement = lazy(() => import("@pages/Announcement/StudentAnnouncement"));

const LazyLoader = ({ children }) => {
  const location = useLocation()
  return (<Suspense
    fallback={
      <div className="w-full h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    }
    key={location.pathname}
  >
    {children}
  </Suspense>)
};

export const generalRoutes = [
  {
    path: "auth/login",
    element: (
      <LazyLoader>
        <Login />
      </LazyLoader>
    ),
    title: "Login | School Of Aethens",
  },
  {
    element: <Protected roles={[ROLES.STUDENT, ROLES.MANAGER, ROLES.FACULTY, ROLES.ADMIN]} />,
    children: [
      {
        element: <SidebarLayout />,
        children: [
          {
            path: "/",
            element: (
              <LazyLoader>
                <Dashboard />
              </LazyLoader>
            ),
            title: "Dashboard",
          },
          {
            path: "/markAttendance",
            element: (
              <LazyLoader>
                <MarkAttendance />
              </LazyLoader>
            ),
            title: "Dashboard",
          },
          {
            path: "/markFacultyAttendance",
            element: (
              <LazyLoader>
                <MarkFacultyAttendance />
              </LazyLoader>
            ),
            title: "Dashboard",
          },
        ],
      },
    ],
  },
  {
    element: <Protected roles={[ROLES.FACULTY, ROLES.MANAGER]} />,
    children: [
      {
        element: <SidebarLayout />,
        children: [
          {
            path: "/gallery",
            element: (
              <LazyLoader>
                <Gallery />
              </LazyLoader>
            ),
            title: "Gallery",
          }
        ],
      },
    ],
  },
  {
    element: <Protected roles={[ROLES.FACULTY, ROLES.STUDENT]} />,
    children: [
      {
        element: <SidebarLayout />,
        children: [
          {
            path: "/syllabus/:id",
            element: (
              <LazyLoader>
                <Syllabus />
              </LazyLoader>
            ),
            title: "Syllabus",
          }
        ],
      },
    ],
  },
  {
    element: <Protected roles={["student"]} />,
    children: [
      {
        element: <SidebarLayout />,
        children: [
          {
            path: "/materials",
            element: (
              <LazyLoader>
                <Materials />
              </LazyLoader>
            ),
            title: "Materials",
          },
          {
            path: "/activities",
            element: (
              <LazyLoader>
                <Activities />
              </LazyLoader>
            ),
            title: "Activities",
          },
          {
            path: "/slots",
            element: (
              <LazyLoader>
                <Slots />
              </LazyLoader>
            ),
            title: "Slots",
          },
          {
            path: "/attendance",
            element: (
              <LazyLoader>
                <Attendance />
              </LazyLoader>
            ),
            title: "Slots",
          },
          {
            path: "/attendance/c/:courseId",
            element: (
              <LazyLoader>
                <Attendance />
              </LazyLoader>
            ),
            title: "Slots",
          },
          {
            path: "/courseHistory",
            element: (
              <LazyLoader>
                <ManagerCourseHistory />
              </LazyLoader>
            ),
            title: "Slots",
          },
          {
            path: "/bills",
            element: <LazyLoader>
              <Bills />
            </LazyLoader>,
            title: "Bills",
            children: [
              {
                path: ":id",
                element: <LazyLoader>
                  <BillDetails />
                </LazyLoader>,
                title: "Bills"
              },
            ]
          },
          {
            path: "/student/announcements",
            element: (
              <LazyLoader>
                <StudentAnnouncement />
              </LazyLoader>
            ),
            title: "Slots",
          },
        ],
      },
    ],
  },
];
