import { lazy, Suspense } from "react";
import Protected from "@components/layouts/Protected";
import SidebarLayout from "@components/layouts/Sidebar";
import { ROLES } from "@utils/constants";
import { Spin } from "antd";
import { useLocation } from "react-router-dom";
import FinalProjectPage from "@pages/FinalProject";

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
const PhaseDetails = lazy(() => import("@pages/FinalProject/PhaseDetails"));
const PhaseListPage = lazy(() => import("@pages/FinalProject/PhaseList"));
const AdminFacultyAttendance = lazy(() => import("@pages/AdminAttendance/AdminFacultyAttendance"));
const AdminLeaves = lazy(() => import("@pages/AdminLeaves/AdminLeaves"));
const AdminUsers = lazy(() => import("@pages/Admin/Users"));
const AdminEditUser = lazy(() => import("@pages/Admin/Users/EditUser"));
const AdminCenters = lazy(() => import("@pages/Admin/Centers"));
const AdminBlogPosts = lazy(() => import("@pages/Admin/BlogPosts"));
const EditBlogPost = lazy(() => import("@pages/Admin/BlogPosts/EditBlogPost"));
const AdminNewsletters = lazy(() => import("@pages/Admin/Newsletters"));
const EditNewsletter = lazy(() => import("@pages/Admin/Newsletters/EditNewsletter"));
const AdminShopItems = lazy(() => import("@pages/Admin/ShopItems"));
const EditShopItem = lazy(() => import("@pages/Admin/ShopItems/EditShopItem"));
const AdminArtWorks = lazy(() => import("@pages/Admin/ArtWorks"));
const EditArtWork = lazy(() => import("@pages/Admin/ArtWorks/EditArtWork"));
const AdminStudentOfTheWeek = lazy(() => import("@pages/Admin/StudentOfTheWeek"));
const EditStudentOfTheWeek = lazy(() => import("@pages/Admin/StudentOfTheWeek/EditStudentOfTheWeek"));
const AdminLatestVideos = lazy(() => import("@pages/Admin/LatestVideos"));
const AdminCourses = lazy(() => import("@pages/AdminCourses"));
const AdminUsers = lazy(() => import("@pages/Admin/Users"));
const AdminCenters = lazy(() => import("@pages/Admin/Centers"));
const AdminBlogPosts = lazy(() => import("@pages/Admin/BlogPosts"));
const AdminNewsletters = lazy(() => import("@pages/Admin/Newsletters"));
const AdminShopItems = lazy(() => import("@pages/Admin/ShopItems"));
const AdminArtWorks = lazy(() => import("@pages/Admin/ArtWorks"));
const AdminStudentOfTheWeek = lazy(() => import("@pages/Admin/StudentOfTheWeek"));
const AdminLatestVideos = lazy(() => import("@pages/Admin/LatestVideos"));

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
    element: <Protected roles={[ROLES.STUDENT, ROLES.MANAGER, ROLES.FACULTY, ROLES.ADMIN, ROLES.OPERATIONS_MANAGER]} />,
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
    element: <Protected roles={[ROLES.FACULTY, ROLES.MANAGER, ROLES.ADMIN]} />,
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
          {
            path: "/student/final-project",
            element: <FinalProjectPage />,
            title: "Slots",
          },
          {
            path: "/student/final-project/:projectId/phases",
            element: <LazyLoader><PhaseListPage /></LazyLoader>,
            title: "Slots",
          },
          {
            path: "/student/final-project/:projectId/phase/:phaseId",
            element: (
              <LazyLoader>
                <PhaseDetails />
              </LazyLoader>
            ),
            title: "Slots",
          },
        ],
      },
    ],
  },
  {
    element: <Protected roles={[ROLES.ADMIN]} />,
    children: [
      {
        element: <SidebarLayout />,
        children: [
          {
            path: "/admin/faculty-attendance",
            element: (
              <LazyLoader>
                <AdminFacultyAttendance />
              </LazyLoader>
            ),
            title: "Faculty Attendance",
          },
          {
            path: "/admin/manage-leaves",
            element: (
              <LazyLoader>
                <AdminLeaves />
              </LazyLoader>
            ),
            title: "Manage Leaves",
          },
          {
            path: "/admin/users",
            element: (
              <LazyLoader>
                <AdminUsers />
              </LazyLoader>
            ),
            title: "Users",
          },
          {
            path: "/admin/users/new",
            element: (
              <LazyLoader>
                <AdminEditUser />
              </LazyLoader>
            ),
            title: "Add User",
          },
          {
            path: "/admin/users/:id",
            element: (
              <LazyLoader>
                <AdminEditUser />
              </LazyLoader>
            ),
            title: "Edit User",
          },
          {
            path: "/admin/centers",
            element: (
              <LazyLoader>
                <AdminCenters />
              </LazyLoader>
            ),
            title: "Centers",
          },
          {
            path: "/admin/blog-posts",
            element: (
              <LazyLoader>
                <AdminBlogPosts />
              </LazyLoader>
            ),
            title: "Blog Posts",
          },
          {
            path: "/admin/blog-posts/create",
            element: (
              <LazyLoader>
                <EditBlogPost />
              </LazyLoader>
            ),
            title: "Create Blog Post",
          },
          {
            path: "/admin/blog-posts/edit/:id",
            element: (
              <LazyLoader>
                <EditBlogPost />
              </LazyLoader>
            ),
            title: "Edit Blog Post",
          },
          {
            path: "/admin/newsletters",
            element: (
              <LazyLoader>
                <AdminNewsletters />
              </LazyLoader>
            ),
            title: "Newsletters",
          },
          {
            path: "/admin/newsletters/create",
            element: (
              <LazyLoader>
                <EditNewsletter />
              </LazyLoader>
            ),
            title: "Create Newsletter",
          },
          {
            path: "/admin/newsletters/edit/:id",
            element: (
              <LazyLoader>
                <EditNewsletter />
              </LazyLoader>
            ),
            title: "Edit Newsletter",
          },
          {
            path: "/admin/shop-items",
            element: (
              <LazyLoader>
                <AdminShopItems />
              </LazyLoader>
            ),
            title: "Shop Items",
          },
          {
            path: "/admin/shop-items/create",
            element: (
              <LazyLoader>
                <EditShopItem />
              </LazyLoader>
            ),
            title: "Create Shop Item",
          },
          {
            path: "/admin/shop-items/edit/:id",
            element: (
              <LazyLoader>
                <EditShopItem />
              </LazyLoader>
            ),
            title: "Edit Shop Item",
          },
          {
            path: "/admin/art-works",
            element: (
              <LazyLoader>
                <AdminArtWorks />
              </LazyLoader>
            ),
            title: "Art Works",
          },
          {
            path: "/admin/art-works/create",
            element: (
              <LazyLoader>
                <EditArtWork />
              </LazyLoader>
            ),
            title: "Create Art Work",
          },
          {
            path: "/admin/art-works/edit/:id",
            element: (
              <LazyLoader>
                <EditArtWork />
              </LazyLoader>
            ),
            title: "Edit Art Work",
          },
          {
            path: "/admin/student-of-the-week",
            element: (
              <LazyLoader>
                <AdminStudentOfTheWeek />
              </LazyLoader>
            ),
            title: "Student of the Week",
          },
          {
            path: "/admin/student-of-the-week/create",
            element: (
              <LazyLoader>
                <EditStudentOfTheWeek />
              </LazyLoader>
            ),
            title: "Add Student of the Week",
          },
          {
            path: "/admin/student-of-the-week/edit/:id",
            element: (
              <LazyLoader>
                <EditStudentOfTheWeek />
              </LazyLoader>
            ),
            title: "Edit Student of the Week",
          },
          {
            path: "/admin/latest-videos",
            element: (
              <LazyLoader>
                <AdminLatestVideos />
              </LazyLoader>
            ),
            title: "Latest Videos",
          },
          {
            path: "/admin/courses",
            element: (
              <LazyLoader>
                <AdminCourses />
              </LazyLoader>
            ),
            title: "Courses",
            path: "/admin/users",
            element: (
              <LazyLoader>
                <AdminUsers />
              </LazyLoader>
            ),
            title: "Users",
          },
          {
            path: "/admin/centers",
            element: (
              <LazyLoader>
                <AdminCenters />
              </LazyLoader>
            ),
            title: "Centers",
          },
          {
            path: "/admin/blog-posts",
            element: (
              <LazyLoader>
                <AdminBlogPosts />
              </LazyLoader>
            ),
            title: "Blog Posts",
          },
          {
            path: "/admin/newsletters",
            element: (
              <LazyLoader>
                <AdminNewsletters />
              </LazyLoader>
            ),
            title: "Newsletters",
          },
          {
            path: "/admin/shop-items",
            element: (
              <LazyLoader>
                <AdminShopItems />
              </LazyLoader>
            ),
            title: "Shop Items",
          },
          {
            path: "/admin/art-works",
            element: (
              <LazyLoader>
                <AdminArtWorks />
              </LazyLoader>
            ),
            title: "Art Works",
          },
          {
            path: "/admin/student-of-the-week",
            element: (
              <LazyLoader>
                <AdminStudentOfTheWeek />
              </LazyLoader>
            ),
            title: "Student of the Week",
          },
          {
            path: "/admin/latest-videos",
            element: (
              <LazyLoader>
                <AdminLatestVideos />
              </LazyLoader>
            ),
            title: "Latest Videos",
          },
        ],
      },
    ],
  },
];
