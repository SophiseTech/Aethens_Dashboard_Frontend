import Sidebar from '@components/Sidebar';
import AnnouncementModal from '@components/AnnouncementModal';
import PushPromptModal from '@components/PushPromptModal';
import ForUserGuard from '@components/ForUserGuard';
import { ConfigProvider, Layout } from 'antd'
import userStore from '@stores/UserStore';
import useMediaQuery, { DESKTOP_QUERY } from '@hooks/useMediaQuery';
import { ROLES } from '@utils/constants';
import { STUDENT_MOBILE_THEME } from '@/config/studentTheme';
import React from 'react'
import { Outlet } from 'react-router-dom';

const { Header, Content, Footer, Sider } = Layout;

function SidebarLayout() {
  const { user } = userStore()
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  // Always wrapped, only the theme changes, so crossing the breakpoint (e.g. rotating
  // a tablet) restyles the page instead of remounting it.
  const theme = user?.role === ROLES.STUDENT && !isDesktop ? STUDENT_MOBILE_THEME : undefined

  return (
    <Sidebar>
      {/* <AnnouncementModal /> */}
      <PushPromptModal />
      <ForUserGuard />
      <ConfigProvider theme={theme}>
        <div className='overflow-auto w-full h-screen max-h-screen app-content'>
          <Outlet />
        </div>
      </ConfigProvider>
    </Sidebar>
  )
}

{/* <Layout className='h-screen'>
  <Sider
    className='!bg-transparent lg:!w-[20%] !flex-none !max-w-none'
  >
    <Sidebar />
  </Sider> */}
{/* <Content className='overflow-auto h-full max-h-full'>
  
</Content> */}

// </Layout>
export default SidebarLayout