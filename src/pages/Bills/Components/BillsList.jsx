import { DownCircleFilled, DownOutlined, Loading3QuartersOutlined } from '@ant-design/icons';
import Chip from '@components/Chips/Chip';
import Filters from '@components/Filters';
import { getValue } from '@utils/helper';
import { Button, List, Spin } from 'antd'
import dayjs from 'dayjs';
import React, { useMemo } from 'react'
import { isMobile } from 'react-device-detect';
import { Link, useLocation, useParams } from 'react-router-dom';

function BillsList({ bills, loading, total, onLoadMore = () => { }, fields = {}, filters = [], onFilterApply = () => { }, onFilterReset = () => { }, defaultFilterValues = {} }) {

  const { id: activeBill } = useParams()
  const location = useLocation()

  const hasMore = useMemo(() => bills.length < total, [bills, total])

  const loadMore =
    hasMore ? (
      <div
        style={{
          textAlign: 'center',
          marginTop: 12,
          height: 32,
          lineHeight: '32px',
        }}
      >
        <Button onClick={() => { onLoadMore(10) }} className='!border-none h-auto text-sm p-2 rounded-full text-white' variant='solid' color='secondary'>
          {loading ? <Loading3QuartersOutlined className='animate-spin ' /> : <DownOutlined className='text-white' />}
        </Button>
      </div>
    ) : null;

  const isActive = (bill) => activeBill && bill._id === activeBill

  return (
    <div className='flex flex-col h-full'>
      <Filters filters={filters} onApply={onFilterApply} defaultValues={defaultFilterValues} onReset={onFilterReset} />
      <div className='border border-border p-2 rounded-2xl overflow-auto max-lg:hidden flex-1'>
        <List
          loading={loading}
          loadMore={loadMore}
          dataSource={bills}
          split={false}
          renderItem={(item) => (
            <Link to={`${item._id}${location.search}`} className='w-1/4'>
              <List.Item className={`!p-4 rounded-2xl mb-2 hover:bg-stone-200/70 transition-colors ${isActive(item) ? "bg-stone-200/70" : "bg-card"}`}>
                <List.Item.Meta
                  title={<p className='font-bold capitalize | 2xl:text-lg'>{getValue(item, fields.title)}</p>}
                  description={<div className='font-normal text-gray-500 flex flex-col gap-2'>
                    <p className='| max-2xl:text-xs'>{getValue(item, fields.description)}</p>
                    {getValue(item, fields.status)}
                  </div>}
                />
                <h1 className='font-bold text-primary | 2xl:text-lg'>{getValue(item, fields.extra)}</h1>
              </List.Item>
            </Link>
          )}
        />
      </div>

      <div className='overflow-auto w-full lg:hidden'>
        <div className='flex gap-4 w-max'>
          {bills.map((bill, index) => (
            <Link to={`${bill._id}${location.search}`}>
              <div key={index} className={`!p-4 rounded-2xl mb-2 hover:bg-stone-200/70 transition-colors ${isActive(bill) ? "bg-stone-200/70" : "bg-card"} w-fit flex gap-5`}>
                <div>
                  <p className='font-bold capitalize | 2xl:text-lg'>{getValue(bill, fields.title)}</p>
                  <div className='font-normal text-gray-500 flex flex-col gap-2'>
                    <p className='| max-2xl:text-xs'>{getValue(bill, fields.description)}</p>
                    {getValue(bill, fields.status)}
                  </div>
                </div>
                <h1 className='font-bold text-primary whitespace-nowrap | 2xl:text-lg'>{getValue(bill, fields.extra)}</h1>
              </div></Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BillsList