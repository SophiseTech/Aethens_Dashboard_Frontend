import { EllipsisOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd'
import React from 'react'

function SubMenu({items}) {
  return (
    <Dropdown menu={{items}}>
      <EllipsisOutlined className='text-xl font-bold cursor-pointer' />
    </Dropdown>
  )
}

export default SubMenu