import { useMemo, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar } from "antd";
import {
  AppstoreOutlined,
  BookOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  FundProjectionScreenOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MoneyCollectOutlined,
  PictureOutlined,
  ShopOutlined,
  SolutionOutlined,
  MessageOutlined,
  WalletOutlined
} from "@ant-design/icons";

import Book from "@/assets/Book";
import Target from "@/assets/Target";
import SubMenu from "@components/SubMenu";
import UserDetailsDrawer from "@components/UserDetailsDrawer";
import userStore from "@stores/UserStore";
import { ROLES } from "@utils/constants";

// Constants - Move menu configuration outside component
const MENU_CONFIG = [
  {
    label: "Dashboard",
    icon: AppstoreOutlined,
    path: "/",
    roles: [ROLES.STUDENT, ROLES.MANAGER, ROLES.ADMIN],
  },
  {
    label: "Students",
    icon: SolutionOutlined,
    path: "/",
    roles: [ROLES.FACULTY],
  },
  {
    label: "Enquiries",
    icon: MessageOutlined,
    path: "/manager/enquiries",
    roles: [ROLES.MANAGER, ROLES.ADMIN],
  },
  {
    label: "Enquiry Slots",
    icon: MessageOutlined,
    path: "/manager/enquiry-slots",
    roles: [ROLES.MANAGER, ROLES.ADMIN],
  },
  {
    label: "Materials",
    icon: Book,
    path: "/materials",
    roles: [ROLES.STUDENT],
  },
  {
    label: "Activities",
    icon: Target,
    path: "/activities",
    roles: [ROLES.STUDENT],
  },
  {
    label: "Slots",
    icon: CalendarOutlined,
    path: "/slots",
    roles: [ROLES.STUDENT],
  },
  {
    label: "Students",
    icon: SolutionOutlined,
    path: "/manager/students",
    roles: [ROLES.MANAGER, ROLES.ADMIN],
  },
  {
    label: "Wallets",
    icon: WalletOutlined,
    path: "/manager/wallets",
    roles: [ROLES.MANAGER, ROLES.ADMIN],
  },
  {
    label: "Bills",
    icon: DollarOutlined,
    path: "/manager/bills",
    roles: [ROLES.MANAGER, ROLES.ADMIN],
  },
  {
    label: "Bills",
    icon: DollarOutlined,
    path: "/bills",
    roles: [ROLES.STUDENT],
  },
  {
    label: "Inventory",
    icon: ShopOutlined,
    path: "/manager/inventory",
    roles: [ROLES.MANAGER, ROLES.ADMIN],
  },
  {
    label: "Payslips",
    icon: MoneyCollectOutlined,
    path: "/manager/payslips",
    roles: [ROLES.MANAGER, ROLES.ADMIN],
  },
  {
    label: "Courses",
    icon: BookOutlined,
    path: "/faculty/courses",
    roles: [ROLES.FACULTY],
  },
  {
    label: "Payslips",
    icon: MoneyCollectOutlined,
    path: "/faculty/payslips",
    roles: [ROLES.FACULTY],
  },
  {
    label: "FDP",
    icon: FundProjectionScreenOutlined,
    path: "/manager/faculty-development-program",
    roles: [ROLES.MANAGER, ROLES.ADMIN],
  },
  {
    label: "FDP",
    icon: FundProjectionScreenOutlined,
    path: "/faculty/faculty-development-program",
    roles: [ROLES.FACULTY],
  },
  {
    label: "Attendance",
    icon: FundProjectionScreenOutlined,
    path: "/attendance",
    roles: [ROLES.STUDENT],
  },
  {
    label: "Gallery",
    icon: PictureOutlined,
    path: "/gallery",
    roles: [ROLES.MANAGER, ROLES.FACULTY, ROLES.ADMIN],
  },
  {
    label: "Slots",
    icon: ClockCircleOutlined,
    path: "/manager/slots",
    roles: [ROLES.MANAGER, ROLES.ADMIN],
  },
  {
    label: "Slots",
    icon: ClockCircleOutlined,
    path: "/faculty/slots",
    roles: [ROLES.FACULTY],
  },
  {
    label: "Course History",
    icon: ClockCircleOutlined,
    path: "/courseHistory",
    roles: [ROLES.STUDENT],
  },
  {
    label: "Announcements",
    icon: ClockCircleOutlined,
    path: "/manager/announcements",
    roles: [ROLES.MANAGER, ROLES.ADMIN],
  },
  {
    label: "Announcements",
    icon: ClockCircleOutlined,
    path: "/student/announcements",
    roles: [ROLES.STUDENT],
  },
  {
    label: "Final Project",
    icon: ClockCircleOutlined,
    path: "/student/final-project",
    roles: [ROLES.STUDENT],
  },
  {
    label: "Final Project",
    icon: ClockCircleOutlined,
    path: "/manager/final-project",
    roles: [ROLES.MANAGER, ROLES.ADMIN],
  },
];

// Utility function for dynamic paths
const getDynamicPath = (path, user) => {
  if (path.includes("${user?.details_id?.course_id}")) {
    return path.replace(
      "${user?.details_id?.course_id}",
      user?.details_id?.course_id || ""
    );
  }
  return path;
};

// Separate components for better organization
const SidebarLogo = () => (
  <img
    src="/images/logo.png"
    alt="Logo"
    className="self-center p-5 px-0 max-2xl:w-3/4 2xl:p-10"
  />
);

const MenuItem = ({ item, isActive, user }) => {
  const IconComponent = item.icon;
  const dynamicPath = getDynamicPath(item.path, user);

  return (
    <Link to={dynamicPath} className="block">
      <div className="flex gap-10 items-center group hover:bg-gray-50 transition-colors duration-200 rounded-r-xl">
        <div
          className={`rounded-r-xl bg-secondary transition-opacity duration-200 w-1 h-9 2xl:w-1.5 2xl:h-12 ${
            isActive ? "opacity-100" : "opacity-0"
          }`}
        />
        <div className="flex items-center gap-3 2xl:gap-5 py-2">
          <IconComponent
            className="text-sm 2xl:text-xl w-[15px] 2xl:w-auto transition-all duration-200"
            style={{ strokeWidth: isActive ? 3 : 2 }}
          />
          <p
            className={`transition-all duration-200 text-sm 2xl:text-lg ${
              isActive ? "font-bold text-primary" : "font-normal text-gray-700"
            }`}
          >
            {item.label}
          </p>
        </div>
      </div>
    </Link>
  );
};

const UserProfile = ({ user, onProfileClick, onLogout }) => (
  <div className="p-3 m-5 bg-card rounded-full flex gap-2 justify-between items-center shadow-sm hover:shadow-md transition-shadow duration-200">
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
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logOut } = userStore();
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Memoized filtered menu items
  const visibleMenuItems = useMemo(
    () => MENU_CONFIG.filter((item) => item.roles.includes(user?.role)),
    [user?.role]
  );

  // Add syllabus dynamically if user is student
  const menuItems = useMemo(() => {
    const items = [...visibleMenuItems];
    if (user?.role === ROLES.STUDENT && user?.details_id?.course_id) {
      items.push({
        label: "Syllabus",
        icon: BookOutlined,
        path: `/syllabus/${user.details_id.course_id}`,
        roles: [ROLES.STUDENT],
      });
    }
    return items;
  }, [visibleMenuItems, user]);

  // Optimized active check
  const isActive = useCallback(
    (path) => {
      if (path === "/") return pathname === "/";
      return pathname.startsWith(path);
    },
    [pathname]
  );

  // Event handlers
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

  return (
    <div className="drawer h-full lg:drawer-open">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content">
        <MobileMenuButton />
        {children}
      </div>

      <div className="drawer-side z-20 no-scrollbar">
        <label htmlFor="my-drawer" className="drawer-overlay" />

        <aside className="h-full flex flex-col justify-between bg-white max-sm:w-80 w-96 shadow-lg">
          {/* Header */}
          <div className="flex flex-col gap-0 2xl:gap-5">
            <SidebarLogo />

            {/* Navigation Menu */}
            <nav className="flex flex-col 2xl:gap-3 px-2">
              {menuItems.map((item, index) => (
                <MenuItem
                  key={`${item.path}-${index}`}
                  item={item}
                  isActive={isActive(item.path)}
                  user={user}
                />
              ))}
            </nav>
          </div>

          {/* User Profile */}
          <UserProfile
            user={user}
            onProfileClick={handleProfileClick}
            onLogout={handleLogout}
          />
        </aside>
      </div>

      <UserDetailsDrawer
        user={user}
        visible={drawerVisible}
        onClose={handleDrawerClose}
      />
    </div>
  );
}

export default Sidebar;
