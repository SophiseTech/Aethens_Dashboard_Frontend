import Sidebar from '@components/Sidebar';
import AnnouncementModal from '@components/AnnouncementModal';
import { Layout } from 'antd'
import React from 'react'
import { Outlet } from 'react-router-dom';

const { Header, Content, Footer, Sider } = Layout;

function SidebarLayout() {
  return (
    <Sidebar>
      {/* <AnnouncementModal /> */}
      <div className='overflow-auto w-full h-screen max-h-screen'>
        <Outlet />
      </div>
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