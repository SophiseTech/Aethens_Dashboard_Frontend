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

  const formatBill = (bill) => {
    const prefix = bill.center_initial || bill.center_id?.center_initial || ''
    const invoiceLabel = bill.invoiceNo ? `${prefix}${bill.invoiceNo}` : 'Draft'
    const payableTotal = Math.round(bill.applyWallet ? bill.finalTotal : bill.total)
    const fy = bill.financial_year

    return {
      ...bill,
      description: <div>
        <p className='flex items-center gap-2'>
          <span>{`${invoiceLabel} | ${dayjs(bill.generated_on).format("D MMM, YYYY")}`}</span>
          {fy && (
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              lineHeight: 1,
              padding: '2px 6px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              color: '#fff',
              letterSpacing: '0.03em',
              whiteSpace: 'nowrap',
            }}>
              FY '{fy}
            </span>
          )}
        </p>
        <p>Paid On: <strong>{formatDate(bill.payment_date)}</strong></p>
        <p className='capitalize'>Mode: <strong>{bill.payment_method?.replace("_", " ")}</strong></p>
      </div>,
      total: `₹ ${payableTotal}`,
      chipStatus: <Status status={bill?.status} />
    }
  }

  const formattedBills = useMemo(() => bills?.map(formatBill), [bills])

  const customFilters = [
    { key: 'invoice_search', type: 'input', placeholder: 'Search Invoice (e.g., WFD1001)' },
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
        { value: 'unpaid', label: 'Unpaid' },
        { value: 'draft', label: 'Draft' },
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
