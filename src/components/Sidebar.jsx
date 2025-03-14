import Book from '@/assets/Book';
import Target from '@/assets/Target';
import { AppstoreOutlined, BookOutlined, CalendarOutlined, DollarOutlined, FundProjectionScreenOutlined, LogoutOutlined, MenuUnfoldOutlined, MoneyCollectOutlined, PictureOutlined, ShopOutlined, SolutionOutlined } from '@ant-design/icons';
import SubMenu from '@components/SubMenu';
import UserDetailsDrawer from '@components/UserDetailsDrawer';
import userStore from '@stores/UserStore';
import { ROLES } from '@utils/constants';
import Avatar from 'antd/es/avatar/avatar';
import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const getItem = (label, key, icon, path, roles, children) => {
  return {
    key,
    icon,
    children,
    label,
    path,
    roles
  }
}

function Sidebar({ children }) {

  const { pathname } = useLocation();
  const { user, logOut } = userStore()
  const nav = useNavigate()
  const [drawerVisible, setDrawerVisible] = useState(false);


  const isActive = (path) => pathname === path || pathname.startsWith(path) && path !== "/"

  const handleLogout = () => {
    logOut()
    // nav('/auth/login')
    window.location.replace("/auth/login")
  }

  const items = useMemo(() => [
    getItem("Dashboard", '1', AppstoreOutlined, "/", [ROLES.STUDENT, ROLES.MANAGER]),
    getItem("Students", '1', SolutionOutlined, "/", [ROLES.FACULTY]),
    getItem("Materials", '1', Book, "/materials", [ROLES.STUDENT]),
    getItem("Activities", '1', Target, "/activities", [ROLES.STUDENT]),
    getItem("Slots", '1', CalendarOutlined, "/slots", [ROLES.STUDENT]),
    getItem("Students", '1', SolutionOutlined, "/manager/students", [ROLES.MANAGER]),
    getItem("Bills", '1', DollarOutlined, "/manager/bills", [ROLES.MANAGER]),
    getItem("Bills", '1', DollarOutlined, "/bills", [ROLES.STUDENT]),
    getItem("Inventory", '1', ShopOutlined, "/manager/inventory", [ROLES.MANAGER]),
    getItem("Payslips", '1', MoneyCollectOutlined, "/manager/payslips", [ROLES.MANAGER]),
    getItem("Courses", '1', BookOutlined, "/faculty/courses", [ROLES.FACULTY]),
    getItem("Payslips", '1', MoneyCollectOutlined, "/faculty/payslips", [ROLES.FACULTY]),
    getItem("FDA", '1', FundProjectionScreenOutlined, "/manager/faculty-development-program", [ROLES.MANAGER]),
    getItem("FDA", '1', FundProjectionScreenOutlined, "/faculty/faculty-development-program", [ROLES.FACULTY]),
    getItem("Attendance", '1', FundProjectionScreenOutlined, "/attendance", [ROLES.STUDENT]),
    getItem("Syllabus", '1', BookOutlined, `/syllabus/${user?.details_id?.course_id}`, [ROLES.STUDENT]),
    getItem("Gallery", '1', PictureOutlined, "/gallery", [ROLES.MANAGER, ROLES.FACULTY]),
  ], [user])


  const handleNameClick = () => {
    setDrawerVisible(true);
  };

  return (
    <div className="drawer h-full lg:drawer-open">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content">
        <label htmlFor="my-drawer" className="drawer-button lg:hidden fixed right-5 top-5 bg-primary text-white flex items-center p-2 rounded-lg z-10">
          <MenuUnfoldOutlined />
        </label>
        {children}
      </div>

      <div className="drawer-side z-20">
        <label htmlFor="my-drawer" className="drawer-overlay"></label>

        <div className='h-full flex flex-col justify-between bg-white max-sm:w-80 w-96'>
          <div className='flex flex-col | gap-0 2xl:gap-5'>
            <img src="/images/logo.png" alt="" className='self-center | p-5 px-0 max-2xl:w-3/4 2xl:p-10' />
            <ul className="flex flex-col | 2xl:gap-3">
              {/* Sidebar content here */}
              {items.map((item, index) => (
                item.roles.includes(user.role) &&
                <Link key={index} to={item.path}>
                  <div className='flex gap-10 items-center'>
                    <div className={`rounded-r-xl bg-secondary ${isActive(item.path) ? 'opacity-100' : "opacity-0"} | w-1 h-9 2xl:w-1.5 2xl:h-12 `}>

                    </div>
                    <div className='flex items-center | gap-3 2xl:gap-5'>
                      <item.icon className="| text-sm 2xl:text-xl w-[15px] 2xl:w-auto" style={{ strokeWidth: isActive(item.path) ? 3 : 2 }} />
                      <p className={`${isActive(item.path) ? "font-bold" : "font-normal"} | text-sm 2xl:text-lg `}>{item.label}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </ul>
          </div>
          <div className='p-3 m-5 bg-card rounded-full flex gap-2 justify-between items-center'>
            <div className='flex gap-2' onClick={() => { setDrawerVisible(true) }}>
              <Avatar src={user?.profile_img} />
              <div>
                <h1 className='text-sm font-bold'>{user?.username}</h1>
                <p className='text-xs text-gray-500'>{user?.email}</p>
              </div>
            </div>
            <div className=''>
              {/* <MoreOutlined className='text-xl'/> */}
              <SubMenu items={[{
                label: 'Logout',
                icon: <LogoutOutlined />,
                key: '1',
                danger: true,
                onClick: handleLogout
              }]} />
            </div>
          </div>
        </div>
      </div>
      <UserDetailsDrawer
        user={user}
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />
    </div>
  )
}

export default Sidebar