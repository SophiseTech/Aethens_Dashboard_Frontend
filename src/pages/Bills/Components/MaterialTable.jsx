import { Table } from 'antd'
import React from 'react'

const MaterialTable = ({ bill }) => {

  const columns = [
    {
      title: "#",
      dataIndex: "key",
      render: (_, record, index) => index + 1
    },
    {
      title: "Item & Description",
      dataIndex: ["item", "name"],
    },
    {
      title: "Qty",
      dataIndex: "qty",
    },
    {
      title: "U.Price",
      dataIndex: ["rate"],
    },
    {
      title: "Sub Total",
      dataIndex: "subtotal",
    },
    {
      title: "Discount",
      dataIndex: "discount",
      render: (value, record) => <p>{record.discountType === "percentage" || !record.discountType ? `${value} %` : `₹ ${value}`}</p>
    },
    {
      title: "Tax",
      dataIndex: "taxAmnt",
    },
    {
      title: "Total",
      dataIndex: "total",
      // className: "text-end"
      align: "right"
    },
  ]

  const columns2 = [
    {
      dataIndex: "name",
      // render: (value) => <p className='font-bold'>{value}</p>
      className: "font-bold text-start"
    },
    {
      dataIndex: "value",
      className: "text-end",
      render: (value, _, index) => (index === 2 ? <p className='font-bold text-lg text-primary'>₹{value}</p> : `₹${value}`)
    },
  ]


  return (
    <>
      <Table columns={columns} dataSource={bill?.items} pagination={false} className='w-full text-sm' />
      <Table
        className='w-fit'
        showHeader={false}
        columns={columns2}
        pagination={false}
        dataSource={[
          { name: "Subtotal", value: bill?.subtotal },
          { name: "Total Tax", value: bill?.total_tax },
          { name: "Grand Total", value: bill?.total },
        ]} />
    </>
  )
}

export default MaterialTable