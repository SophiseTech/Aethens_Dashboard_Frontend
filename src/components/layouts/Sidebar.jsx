import Sidebar from '@components/Sidebar';
import { Layout } from 'antd'
import React from 'react'
import { Outlet } from 'react-router-dom';

const { Header, Content, Footer, Sider } = Layout;

function SidebarLayout() {
  return (
    <Sidebar>
      <div className='h-screen max-h-screen overflow-auto w-full'>
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
  {/* <Content className='h-full max-h-full overflow-auto'>
  
</Content> */}

// </Layout>
export default SidebarLayout