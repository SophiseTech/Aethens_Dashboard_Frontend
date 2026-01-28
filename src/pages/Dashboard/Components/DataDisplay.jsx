import { ArrowUpOutlined } from '@ant-design/icons'
import { Card, Flex, Statistic } from 'antd'
import React from 'react'

function DataDisplay({ count, title, styles = {}, prefix, suffix, precision = 0, icon, loading }) {
  return (
    <Card bordered={false} className='border border-border w-full'>
      <Flex align='center' gap={16} justify='space-between'>
        <div className="flex-1 min-w-0">
          <Statistic
            title={<p className='text-gray-500 font-bold'>{title}</p>}
            value={count}
            precision={precision}
            valueStyle={{ fontSize: 32, fontWeight: "bolder", whiteSpace: "nowrap", ...styles }}
            prefix={prefix}
            suffix={suffix}
            loading={loading}
          />
        </div>
        <div className='bg-primary p-2 rounded-lg flex flex-shrink-0'>
          {icon}
        </div>
      </Flex>
    </Card>
  )
}

export default DataDisplay