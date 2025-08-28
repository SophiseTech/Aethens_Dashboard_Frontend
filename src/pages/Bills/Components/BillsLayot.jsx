import Chip from '@components/Chips/Chip'
import BillsList from '@pages/Bills/Components/BillsList'
import billStore from '@stores/BillStore'
import materialStore from '@stores/MaterialsStore'
import { formatDate } from '@utils/helper'
import { Empty } from 'antd'
import dayjs from 'dayjs'
import React, { useMemo } from 'react'
import { Outlet, useParams, useSearchParams } from 'react-router-dom'

function BillsLayot({ bills, loading, total, onLoadMore }) {

  const { id } = useParams()
  const { editBill, deleteBill, setFilters, filters, fe } = billStore()
  const { editMaterialsByBillId } = materialStore()

  const fields = {
    title: ["generated_for", "username"],
    description: ["description"],
    extra: ["total"],
    status: ["chipStatus"]
  }

  const Status = ({ status }) => {
    if (status === "paid") {
      return <Chip size='small' type='success' label='Paid' />
    } else if (status === "draft") {
      return <Chip size='small' type='draft' label='Draft' />
    } else {
      return <Chip size='small' type='danger' label='Unpaid' />
    }
  }

  const formattedBills = useMemo(() => bills?.map(bill => ({
    ...bill,
    description: <div>
      <p>{`${bill.invoiceNo} | ${dayjs(bill.generated_on).format("D MMM, YYYY")}`}</p>
      <p>Paid On: <strong>{formatDate(bill.payment_date)}</strong></p>
      <p className='capitalize'>Mode: <strong>{bill.payment_method?.replace("_", " ")}</strong></p>
    </div>,
    total: `₹ ${bill.total}`,
    chipStatus: <Status status={bill?.status} />
  })), [bills])

  const customFilters = [
    {
      key: 'payment_method', type: 'select', placeholder: 'Select Payment Method', options: [
        { value: '', label: 'Select' },
        { value: 'cash', label: 'Cash' },
        { value: 'credit_card', label: 'Credit Card' },
        { value: 'bank_transfer', label: 'Bank Transfer' },
      ]
    },
    { key: 'payment_date', type: 'date', placeholder: 'Select Payment Date' },
    { key: 'generated_on', type: 'range', placeholder: 'Select Generated Date' },
    {
      key: 'status', type: 'select', placeholder: 'Select Status', options: [
        { value: '', label: 'Select' },
        { value: 'paid', label: 'Paid' },
        { value: 'unpaid', label: 'unpaid' },
      ]
    }
  ];

  const onFilterApply = (newFilters) => {
    if (filters?.query?.generated_for) {
      onLoadMore(10, { query: { generated_for: filters.query.generated_for, ...newFilters } })
    } else {
      onLoadMore(10, { query: newFilters })
    }

  }

  const onReset = () => {
    if (filters?.query?.generated_for) {
      onLoadMore(10, { query: { generated_for: filters.query.generated_for } })
    } else {
      onLoadMore(10, { query: {} })
    }
  }

  return (
    <div className='flex gap-5 h-full | flex-col lg:overflow-auto lg:flex-row'>
      <div className='| w-full lg:w-1/4'>
        <BillsList
          bills={formattedBills}
          loading={loading}
          total={total}
          onLoadMore={onLoadMore}
          fields={fields}
          filters={customFilters}
          onFilterApply={onFilterApply}
          defaultFilterValues={filters.query}
          onFilterReset={onReset}
        />
      </div>
      {!id ?
        <div className='bg-card rounded-2xl flex-1 flex items-center justify-center'>
          <Empty />
        </div>
        :
        <Outlet context={{ bills, editBill, id, deleteBill, editMaterials: editMaterialsByBillId }} />
      }
    </div>
  )
}

export default BillsLayot