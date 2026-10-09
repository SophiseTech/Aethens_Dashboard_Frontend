import { Avatar, Drawer } from "antd";
import {
  HomeOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  WalletOutlined,
  AppstoreOutlined,
  LogoutOutlined,
  RightOutlined,
} from "@ant-design/icons";
import useStudentMobileNav from "@hooks/useStudentMobileNav";

// Shorter labels and clearer icons than the sidebar uses, sized for a tab bar.
const TAB_PRESENTATION = {
  dashboard: { label: "Home", icon: <HomeOutlined /> },
  slots: { label: "Sessions", icon: <CalendarOutlined /> },
  attendance: { label: "Attendance", icon: <CheckCircleOutlined /> },
  bills: { label: "Bills", icon: <WalletOutlined /> },
};

function StudentMobileNav({ menuItems, selectedKey, user, onNavigate, onProfile, onLogout }) {
  const { tabItems, moreItems, moreActive, moreOpen, openMore, closeMore, navigateTo, openProfile } =
    useStudentMobileNav({ menuItems, selectedKey, onNavigate, onProfile });

  return (
    <>
      <nav className="student-tabbar lg:hidden" aria-label="Main">
        {tabItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className="student-tab"
            aria-current={selectedKey === item.key ? "page" : undefined}
            onClick={() => navigateTo(item.key)}
          >
            <span className="student-tab__icon">{TAB_PRESENTATION[item.key]?.icon ?? item.icon}</span>
            <span className="student-tab__label">{TAB_PRESENTATION[item.key]?.label ?? item.label}</span>
          </button>
        ))}
        <button
          type="button"
          className="student-tab"
          aria-current={moreActive ? "page" : undefined}
          aria-expanded={moreOpen}
          onClick={openMore}
        >
          <span className="student-tab__icon"><AppstoreOutlined /></span>
          <span className="student-tab__label">More</span>
        </button>
      </nav>

      <Drawer
        open={moreOpen}
        onClose={closeMore}
        placement="bottom"
        height="auto"
        closable={false}
        rootClassName="student-sheet"
        styles={{ body: { padding: 0 } }}
      >
        <div className="student-sheet__handle" aria-hidden="true" />

        <button type="button" className="student-sheet__profile" onClick={openProfile}>
          <Avatar src={user?.profile_img} size={44}>
            {user?.username?.charAt(0)?.toUpperCase()}
          </Avatar>
          <span className="flex-1 min-w-0 text-left">
            <span className="block font-semibold truncate">{user?.username}</span>
            <span className="block text-sm truncate student-muted">View your profile</span>
          </span>
          <RightOutlined className="student-muted" />
        </button>

        <ul className="student-sheet__list">
          {moreItems.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                className="student-sheet__row"
                aria-current={selectedKey === item.key ? "page" : undefined}
                onClick={() => navigateTo(item.key)}
              >
                <span className="student-sheet__icon">{item.icon}</span>
                <span className="flex-1 text-left">{item.label}</span>
                <RightOutlined className="student-muted" />
              </button>
            </li>
          ))}
        </ul>

        <button type="button" className="student-sheet__logout" onClick={onLogout}>
          <LogoutOutlined />
          Log out
        </button>
      </Drawer>
    </>
  );
}

export default StudentMobileNav;
