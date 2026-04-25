import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar, Menu } from "antd";
import {
  AppstoreOutlined,
  BookOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  BankOutlined,
  AimOutlined,
  MessageOutlined,
  AccountBookOutlined,
  WalletOutlined,
  BellOutlined,
  ShopOutlined,
  FundProjectionScreenOutlined,
  CheckSquareOutlined,
  MoneyCollectOutlined,
  PictureOutlined,
  SolutionOutlined,
  UserOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

import Target from "@/assets/Target";
import SubMenu from "@components/SubMenu";
import UserDetailsDrawer from "@components/UserDetailsDrawer";
import StudentContextHoverDrawer from "@components/StudentContextHoverDrawer";
import userStore from "@stores/UserStore";
import studentStore from "@stores/StudentStore";
import { ROLES } from "@utils/constants";
import { getStudentDrawerContext } from "@utils/studentDrawerContext";
import { isStudentDrawerContextRoute } from "@/config/studentDrawerContextRoutes";

const getMenuConfig = (role) => {
  const commonItems = [
    {
      label: "Dashboard",
      icon: <AppstoreOutlined />,
      key: "dashboard",
      path: "/",
    },
  ];

  const adminItems = [
    {
      label: "Students",
      icon: <SolutionOutlined />,
      key: "students",
      path: "/manager/students",
    },
    {
      label: "Finance",
      icon: <DollarOutlined />,
      key: "finance",
      children: [
        { label: "Bills", key: "bills", path: "/manager/bills" },
        { label: "Payslips", key: "payslips", path: "/manager/payslips" },
        { label: "Inventory", key: "inventory", path: "/manager/inventory" },
        {
          label: "Inventory Items",
          key: "inventory-items",
          path: "/manager/inventory-items",
        },
        { label: "Audits", key: "audits", path: "/manager/audits" },
        {
          label: "Expenses",
          key: "expenses",
          path: "/manager/expenses",
        },
        {
          label: "Ledgers",
          key: "ledgers",
          path: "/manager/ledgers",
        },
      ],
    },
    {
      label: "Operations",
      icon: <ClockCircleOutlined />,
      key: "operations",
      children: [
        { label: "Enquiries", key: "enquiries", path: "/manager/enquiries" },
        {
          label: "Enquiry Slots",
          key: "enquiry-slots",
          path: "/manager/enquiry-slots",
        },
        { label: "Targets", key: "targets", path: "/manager/targets" },
        
        
        
      ],
    },
    {
      label: "Academics",
      icon: <BookOutlined />,
      key: "academics",
      children: [
        { label: "Courses", key: "courses", path: "/admin/courses" },
        {
          label: "Syllabus Gallery",
          key: "syllabus-gallery",
          path: "/admin/syllabus-gallery",
        },
        {
          label: "Final Project",
          key: "final-project",
          path: "/manager/final-project",
        },
        { label: "Tasks", key: "tasks", path: "/manager/tasks" },
        {
          label: "Attendance Register",
          key: "attendance-register",
          path: "/manager/attendance-register",
        },
        { label: "Slots", key: "slots", path: "/manager/slots" },
      ],
    },

    {
      label: "Faculty",
      icon: <SolutionOutlined />,
      key: "faculty",
      children: [
        {
          label: "FDP",
          key: "fdp",
          path: "/manager/faculty-development-program",
        },
        {
          label: "Faculty Attendance",
          key: "faculty-attendance",
          path: "/admin/faculty-attendance",
        },
        {
          label: "Manage Leaves",
          key: "manage-leaves",
          path: "/admin/manage-leaves",
        },
      ],
    },
    {
      label: "Staff",
      icon: <UserOutlined />,
      key: "staff",
      path: "/admin/users",
    },
    {
      label: "Centers",
      icon: <BankOutlined />,
      key: "centers",
      path: "/admin/centers",
    },
    {
          label: "Announcements",
          icon: <ClockCircleOutlined />,
          key: "announcements",
          path: "/manager/announcements",
    },
    {
          label: "Notifications",
          icon: <BellOutlined />,
          key: "notifications",
          path: "/manager/notifications",
    },
    { label: "Holidays", 
      icon: <CalendarOutlined />,
      key: "holidays", 
      path: "/manager/holidays" 
    },
    {
      label: "Content",
      icon: <FileTextOutlined />,
      key: "content",
      children: [
        { label: "Blog Posts", key: "blog-posts", path: "/admin/blog-posts" },
        {
          label: "Newsletters",
          key: "newsletters",
          path: "/admin/newsletters",
        },
        { label: "Shop Items", key: "shop-items", path: "/admin/shop-items" },
        { label: "Art Works", key: "art-works", path: "/admin/art-works" },
        {
          label: "Student of the Week",
          key: "student-of-week",
          path: "/admin/student-of-the-week",
        },
        {
          label: "Latest Videos",
          key: "latest-videos",
          path: "/admin/latest-videos",
        },
        {
      label: "Gallery",
      key: "gallery",
      path: "/gallery",
    },
      ],
    },

    
  ];

  const managerItems = [
    {
      label: "Students",
      icon: <SolutionOutlined />,
      key: "students",
      path: "/manager/students",
    },
    {
      label: "Tasks",
      icon: <CheckSquareOutlined />,
      key: "tasks",
      path: "/manager/tasks",
    },
    {
      label: "Academics",
      icon: <BookOutlined />,
      key: "academics",
      children: [
        {
          label: "Attendance Register",
          key: "attendance-register",
          path: "/manager/attendance-register",
        },
        { label: "Slots", key: "slots", path: "/manager/slots" },
      ],
    },
    {
      label: "Finance",
      icon: <DollarOutlined />,
      key: "finance",
      children: [
        { label: "Bills", key: "bills", path: "/manager/bills" },
        { label: "Inventory", key: "inventory", path: "/manager/inventory" },
        { label: "Audits", key: "audits", path: "/manager/audits" },
        {
          label: "Expenses",
          key: "expenses",
          path: "/manager/expenses",
        },
        {
          label: "Ledgers",
          key: "ledgers",
          path: "/manager/ledgers",
        },
      ],
    },
    {
      label: "Operations",
      icon: <ClockCircleOutlined />,
      key: "operations",
      children: [
        { label: "Enquiries", key: "enquiries", path: "/manager/enquiries" },
        {
          label: "Enquiry Slots",
          key: "enquiry-slots",
          path: "/manager/enquiry-slots",
        },
        { label: "Targets", key: "targets", path: "/manager/targets" },
        
        
      ],
    },
    {
          label: "Announcements",
          icon: <ClockCircleOutlined />,
          key: "announcements",
          path: "/manager/announcements",
        },
        {
          label: "Notifications",
          icon: <BellOutlined />,
          key: "notifications",
          path: "/manager/notifications",
        },
        { label: "Holidays", 
          icon: <CalendarOutlined />,
          key: "holidays", 
          path: "/manager/holidays" 
        },
    {
      label: "Gallery",
      icon: <PictureOutlined />,
      key: "gallery",
      path: "/gallery",
    },
  ];

  const academicManagerItems = [
    {
      label: "Students",
      icon: <SolutionOutlined />,
      key: "students",
      path: "/manager/students",
    },
    {
      label: "Courses",
      icon: <BookOutlined />,
      key: "courses",
      path: "/admin/courses",
    },
    {
      label: "Syllabus Gallery",
      icon: <PictureOutlined />,
      key: "syllabus-gallery",
      path: "/admin/syllabus-gallery",
    },
    {
      label: "Student Syllabus",
      icon: <BookOutlined />,
      key: "student-syllabus",
      path: "/academic-manager/student-syllabus",
    },
    {
      label: "Slots",
      icon: <ClockCircleOutlined />,
      key: "slots",
      path: "/manager/slots",
    },
    {
      label: "Final Project",
      icon: <ClockCircleOutlined />,
      key: "final-project",
      path: "/manager/final-project",
    },
    {
      label: "Attendance Register",
      icon: <CheckSquareOutlined />,
      key: "attendance-register",
      path: "/manager/attendance-register",
    },
    {
      label: "FDP",
      icon: <FundProjectionScreenOutlined />,
      key: "fdp",
      path: "/manager/faculty-development-program",
    },
    {
      label: "Announcements",
      icon: <ClockCircleOutlined />,
      key: "announcements",
      path: "/manager/announcements",
    },
    {
      label: "Holidays",
      icon: <CalendarOutlined />,
      key: "holidays",
      path: "/manager/holidays",
    },
  ];

  const facultyItems = [
    {
      label: "Students",
      icon: <SolutionOutlined />,
      key: "students",
      path: "/",
    },
    {
      label: "Courses",
      icon: <BookOutlined />,
      key: "courses",
      path: "/faculty/courses",
    },
    {
      label: "Syllabus Gallery",
      icon: <PictureOutlined />,
      key: "syllabus-gallery",
      path: "/faculty/syllabus-gallery",
    },
    {
      label: "Student Syllabus",
      icon: <BookOutlined />,
      key: "student-syllabus",
      path: "/faculty/student-syllabus",
    },
    {
      label: "FDP",
      icon: <FundProjectionScreenOutlined />,
      key: "fdp",
      path: "/faculty/faculty-development-program",
    },
    {
      label: "My Attendance",
      icon: <CheckSquareOutlined />,
      key: "my-attendance",
      path: "/faculty/my-attendance",
    },
    {
      label: "My Leaves",
      icon: <CalendarOutlined />,
      key: "my-leaves",
      path: "/faculty/my-leaves",
    },

    {
      label: "Payslips",
      icon: <MoneyCollectOutlined />,
      key: "payslips",
      path: "/faculty/payslips",
    },
    {
      label: "Slots",
      icon: <CalendarOutlined />,
      key: "slots",
      path: "/faculty/slots",
    },
    {
      label: "Gallery",
      icon: <PictureOutlined />,
      key: "gallery",
      path: "/gallery",
    },
  ];

  const operationsManagerItems = [
    {
      label: "Students",
      icon: <SolutionOutlined />,
      key: "students",
      path: "/manager/students",
    },
    {
      label: "Enquiries",
      icon: <MessageOutlined />,
      key: "enquiries",
      path: "/manager/enquiries",
    },
    {
      label: "Enquiry Slots",
      icon: <MessageOutlined />,
      key: "enquiry-slots",
      path: "/manager/enquiry-slots",
    },
    {
      label: "Targets",
      icon: <AimOutlined />,
      key: "targets",
      path: "/manager/targets",
    },
    {
      label: "Slots",
      icon: <ClockCircleOutlined />,
      key: "slots",
      path: "/manager/slots",
    },
    {
      label: "Staff",
      icon: <UserOutlined />,
      key: "staff",
      path: "/admin/users",
    },
    {
      label: "Announcements",
      icon: <ClockCircleOutlined />,
      key: "announcements",
      path: "/manager/announcements",
    },
    {
      label: "Notifications",
      icon: <BellOutlined />,
      key: "notifications",
      path: "/manager/notifications",
    },
    {
      label: "Holidays",
      icon: <CalendarOutlined />,
      key: "holidays",
      path: "/manager/holidays",
    },
    {
      label: "Tasks",
      icon: <CheckSquareOutlined />,
      key: "tasks",
      path: "/manager/tasks",
    },
    {
      label: "Bills",
      icon: <DollarOutlined />,
      key: "bills",
      path: "/manager/bills",
    },
    {
      label: "Payslips",
      icon: <MoneyCollectOutlined />,
      key: "payslips",
      path: "/manager/payslips",
    },
    {
      label: "Inventory",
      icon: <ShopOutlined />,
      key: "inventory",
      path: "/manager/inventory",
    },
    {
      label: "Expenses",
      icon: <AccountBookOutlined />,
      key: "expenses",
      path: "/manager/expenses",
    },
    {
      label: "Ledgers",
      icon: <WalletOutlined />,
      key: "ledgers",
      path: "/manager/ledgers",
    },
  ];

  const studentItems = [
    {
      label: "Materials",
      icon: <BookOutlined />,
      key: "materials",
      path: "/materials",
    },
    {
      label: "Attendance",
      icon: <FundProjectionScreenOutlined />,
      key: "attendance",
      path: "/attendance",
    },
    {
      label: "Course History",
      icon: <ClockCircleOutlined />,
      key: "course-history",
      path: "/courseHistory",
    },
    {
      label: "Activities",
      icon: <AimOutlined />,
      key: "activities",
      path: "/activities",
    },
    {
      label: "Slots",
      icon: <CalendarOutlined />,
      key: "slots",
      path: "/slots",
    },
    {
      label: "Bills",
      icon: <DollarOutlined />,
      key: "bills",
      path: "/bills",
    },
    {
      label: "Announcements",
      icon: <ClockCircleOutlined />,
      key: "announcements",
      path: "/student/announcements",
    },
    {
      label: "Final Project",
      icon: <ClockCircleOutlined />,
      key: "final-project",
      path: "/student/final-project",
    },
  ];

  switch (role) {
    case ROLES.ADMIN:
      return [...commonItems, ...adminItems];
    case ROLES.MANAGER:
      return [...commonItems, ...managerItems];
    case ROLES.ACADEMIC_MANAGER:
      return [...commonItems, ...academicManagerItems];
    case ROLES.FACULTY:
      return facultyItems;
    case ROLES.OPERATIONS_MANAGER:
      return [...commonItems, ...operationsManagerItems];
    case ROLES.STUDENT:
      return [...commonItems, ...studentItems];
    default:
      return commonItems;
  }
};

const SidebarLogo = () => (
  <img
    src="/images/logo.png"
    alt="Logo"
    className="self-center p-5 px-0 max-2xl:w-3/4 max-2xl:mx-auto 2xl:p-5"
  />
);

const UserProfile = ({ user, onProfileClick, onLogout }) => (
  <div className="p-3 my-5 ml-2 bg-card rounded-full flex gap-2 justify-between items-center shadow-sm hover:shadow-md transition-shadow duration-200">
    <div className="flex gap-2 cursor-pointer flex-1" onClick={onProfileClick}>
      <Avatar src={user?.profile_img} className="flex-shrink-0">
        {user?.username?.charAt(0)?.toUpperCase()}
      </Avatar>
      <div className="min-w-0 flex-1">
        <h1 className="text-sm font-bold truncate">{user?.username}</h1>
        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
      </div>
    </div>
    <SubMenu
      items={[
        {
          label: "Logout",
          icon: <LogoutOutlined />,
          key: "logout",
          danger: true,
          onClick: onLogout,
        },
      ]}
    />
  </div>
);

const MobileMenuButton = () => (
  <label
    htmlFor="my-drawer"
    className="drawer-button lg:hidden fixed right-5 top-5 bg-primary text-white flex items-center p-2 rounded-lg z-10 shadow-lg hover:shadow-xl transition-shadow duration-200"
  >
    <MenuUnfoldOutlined />
  </label>
);

function Sidebar({ children }) {
  const location = useLocation();
  const { pathname, search, state } = location;
  const navigate = useNavigate();
  const { user, logOut } = userStore();
  const { activeStudent, getStudentById } = studentStore();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [studentContextDrawerVisible, setStudentContextDrawerVisible] = useState(false);
  const [studentContextId, setStudentContextId] = useState(null);
  const drawerRef = useRef(null);

  useEffect(() => {
    const studentDrawerContext = getStudentDrawerContext(state);
    const fromStudentDrawer = Boolean(studentDrawerContext?.enabled);
    const isAllowedRoute = isStudentDrawerContextRoute(pathname);
    const searchParams = new URLSearchParams(search);
    const queryStudentId = searchParams.get("student_id");
    const contextStudentId = studentDrawerContext?.studentId || queryStudentId;

    const shouldEnableStudentContextDrawer =
      fromStudentDrawer && isAllowedRoute && Boolean(contextStudentId);

    if (!shouldEnableStudentContextDrawer) {
      setStudentContextDrawerVisible(false);
      setStudentContextId(null);
      return;
    }

    setStudentContextId(contextStudentId);
    setStudentContextDrawerVisible(true);

    if (activeStudent?._id !== contextStudentId) {
      getStudentById(contextStudentId);
    }
  }, [pathname, search, state, activeStudent?._id, getStudentById]);

  const closeSidebar = useCallback(() => {
    if (drawerRef.current) drawerRef.current.checked = false;
  }, []);

  const menuConfig = useMemo(() => {
    let config = getMenuConfig(user?.role);
    if (user?.role === ROLES.STUDENT && user?.details_id?.course_id) {
      const syllabusItem = {
        label: "Syllabus",
        icon: <BookOutlined />,
        key: "syllabus",
        path: `/syllabus/${user.details_id.course_id}`,
      };
      const hasSyllabus = config.some((item) => item.key === "syllabus");
      if (!hasSyllabus) {
        const materialsIndex = config.findIndex(
          (item) => item.key === "materials",
        );
        if (materialsIndex !== -1) {
          config = [
            ...config.slice(0, materialsIndex),
            syllabusItem,
            ...config.slice(materialsIndex),
          ];
        } else {
          config = [...config, syllabusItem];
        }
      }
    }
    return config;
  }, [user?.role, user?.details_id?.course_id]);

  const selectedKeys = useMemo(() => {
    const findKey = (items) => {
      for (const item of items) {
        if (
          item.path &&
          (pathname === item.path || pathname.startsWith(item.path + "/"))
        ) {
          return [item.key];
        }
        if (item.children) {
          const childKey = findKey(item.children);
          if (childKey) return childKey;
        }
      }
      return [];
    };
    return findKey(menuConfig);
  }, [pathname, menuConfig]);

  const openKeys = useMemo(() => {
    const findOpenKey = (items) => {
      for (const item of items) {
        if (item.children) {
          const hasActiveChild = (children) => {
            for (const child of children) {
              if (
                child.path &&
                (pathname === child.path ||
                  pathname.startsWith(child.path + "/"))
              ) {
                return true;
              }
            }
            return false;
          };
          if (hasActiveChild(item.children)) {
            return [item.key];
          }
        }
      }
      return [];
    };
    return findOpenKey(menuConfig);
  }, [pathname, menuConfig]);

  const handleMenuClick = ({ key }) => {
    const findPath = (items) => {
      for (const item of items) {
        if (item.key === key && item.path) {
          return item.path;
        }
        if (item.children) {
          const path = findPath(item.children);
          if (path) return path;
        }
      }
      return null;
    };
    const path = findPath(menuConfig);
    if (path) {
      navigate(path);
      closeSidebar();
    }
  };

  const handleLogout = useCallback(() => {
    logOut();
    window.location.replace("/auth/login");
  }, [logOut]);

  const handleProfileClick = useCallback(() => {
    setDrawerVisible(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setDrawerVisible(false);
  }, []);

  const renderMenuItems = (items) => {
    return items.map((item) => {
      if (item.children) {
        return (
          <Menu.SubMenu key={item.key} icon={item.icon} title={item.label}>
            {renderMenuItems(item.children)}
          </Menu.SubMenu>
        );
      }
      return (
        <Menu.Item key={item.key} icon={item.icon}>
          {item.label}
        </Menu.Item>
      );
    });
  };

  return (
    <div className="drawer h-full lg:drawer-open">
      <input
        ref={drawerRef}
        id="my-drawer"
        type="checkbox"
        className="drawer-toggle"
      />

      <div className="drawer-content">
        <MobileMenuButton />
        {children}
      </div>

      <div className="drawer-side z-20 no-scrollbar">
        <label htmlFor="my-drawer" className="drawer-overlay" />

        <aside className="h-full flex flex-col bg-white max-sm:w-80 w-64 shadow-lg px-1">
          <div className="flex-shrink-0 border-b border-gray-100">
            <SidebarLogo />
          </div>

          <nav className="flex-1 overflow-y-auto no-scrollbar py-2">
            <Menu
              mode="inline"
              selectedKeys={selectedKeys}
              defaultOpenKeys={openKeys}
              onClick={handleMenuClick}
              style={{ border: "none" }}
              inlineCollapsed={false}
            >
              {renderMenuItems(menuConfig)}
            </Menu>
          </nav>

          <div className="flex-shrink-0 border-t border-gray-100">
            <UserProfile
              user={user}
              onProfileClick={handleProfileClick}
              onLogout={handleLogout}
            />
          </div>
        </aside>
      </div>

      <UserDetailsDrawer
        user={user}
        visible={drawerVisible}
        onClose={handleDrawerClose}
      />
      <StudentContextHoverDrawer
        enabled={Boolean(studentContextId && activeStudent?._id === studentContextId)}
        open={studentContextDrawerVisible}
        onOpen={() => setStudentContextDrawerVisible(true)}
        onClose={() => setStudentContextDrawerVisible(false)}
        student={activeStudent}
      />
    </div>
  );
}

export default Sidebar;
