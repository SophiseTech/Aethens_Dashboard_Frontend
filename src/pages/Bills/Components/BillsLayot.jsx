import Chip from '@components/Chips/Chip'
import BillsList from '@pages/Bills/Components/BillsList'
import ExportBillsModal from '@pages/Bills/Components/ExportBillsModal'
import inventoryService from '@services/Inventory'
import billStore from '@stores/BillStore'
import materialStore from '@stores/MaterialsStore'
import userStore from '@stores/UserStore'
import { formatDate } from '@utils/helper'
import permissions from '@utils/permissions'
import { Empty, Tag } from 'antd'
import dayjs from 'dayjs'
import debounce from 'lodash/debounce'
import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { Outlet, useParams, useSearchParams } from 'react-router-dom'
import { useStore } from 'zustand'

function BillsLayot({ bills, loading, total, onLoadMore }) {

  const { id } = useParams()
  const { editBill, deleteBill, setFilters, filters, fe } = billStore()
  const { editMaterialsByBillId } = materialStore()
  const { user } = useStore(userStore)

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

  const ZohoStatus = ({ billStatus, syncStatus }) => {
    if (billStatus === 'draft' || billStatus === 'migration_closed') return null
    if (syncStatus === 'synced') return <Chip size='xs' glow={false} type='success' label='Zoho ✓' />
    if (syncStatus === 'failed') return <Chip size='xs' glow={false} type='danger' label='Zoho failed' />
    return <Chip size='xs' glow={false} type='warning' label='Zoho pending' />
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
          <ZohoStatus billStatus={bill.status} syncStatus={bill.zoho?.syncStatus} />
        </p>
        <p>Paid On: <strong>{formatDate(bill.payment_date)}</strong></p>
        <p className='capitalize'>Mode: <strong>{bill.payment_method?.replace("_", " ")}</strong></p>
      </div>,
      total: `₹ ${payableTotal}`,
      chipStatus: <Status status={bill?.status} />
    }
  }

  const formattedBills = useMemo(() => bills?.map(formatBill), [bills])

  const [materials, setMaterials] = useState([])
  const [materialsLoading, setMaterialsLoading] = useState(false)
  const [materialsHasMore, setMaterialsHasMore] = useState(true)
  const searchQueryRef = useRef('')
  const lastRefKeyRef = useRef(0)
  const isFetchingRef = useRef(false)
  const selectedOptionsRef = useRef([])

  const PAGE_SIZE = 20

  const fetchMaterials = useCallback(async (lastRef = 0, query = '', append = false) => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true
    setMaterialsLoading(true)
    try {
      const response = await inventoryService.getInventoryItems(lastRef, PAGE_SIZE, {
        type: 'materials',
        searchQuery: query,
      })
      const items = response?.items || []
      const newOptions = items.map((item) => ({
        label: item.name,
        value: item._id,
      }))

      setMaterials((prev) => {
        const combined = append
          ? [...prev, ...newOptions]
          : [...selectedOptionsRef.current, ...newOptions]
        const seen = new Set()
        return combined.filter((item) => {
          if (seen.has(item.value)) return false
          seen.add(item.value)
          return true
        })
      })

      lastRefKeyRef.current = lastRef + items.length
      setMaterialsHasMore(items.length >= PAGE_SIZE)
    } catch {
      setMaterialsHasMore(false)
    } finally {
      setMaterialsLoading(false)
      isFetchingRef.current = false
    }
  }, [])

  useEffect(() => {
    fetchMaterials(0, '', false)
  }, [fetchMaterials])

  const debouncedMaterialsSearch = useMemo(
    () =>
      debounce((query) => {
        searchQueryRef.current = query
        lastRefKeyRef.current = 0
        fetchMaterials(0, query, false)
      }, 350),
    [fetchMaterials]
  )

  const handleMaterialsSearch = (value) => {
    debouncedMaterialsSearch(value)
  }

  const handleMaterialsPopupScroll = (e) => {
    const { target } = e
    if (
      target.scrollTop + target.offsetHeight >= target.scrollHeight - 15 &&
      materialsHasMore &&
      !materialsLoading
    ) {
      fetchMaterials(lastRefKeyRef.current, searchQueryRef.current, true)
    }
  }

  const customFilters = [
    { key: 'invoice_search', type: 'input', placeholder: 'Search Invoice (e.g., WFD1001)', span: 12 },
    {
      key: 'subject', type: 'select', placeholder: 'Select Subject', span: 12, options: [
        { value: '', label: 'Select Subject' },
        { value: 'course', label: 'Course' },
        { value: 'materials', label: 'Materials' },
        { value: 'gallery', label: 'Gallery' },
        { value: 'registration', label: 'Registration' }
      ]
    },
    { key: 'student_name', type: 'input', placeholder: 'Search Student Name', span: 24 },
    {
      key: 'payment_method', type: 'select', placeholder: 'Select Payment Method', span: 12, options: [
        { value: '', label: 'Select' },
        { value: 'cash', label: 'Cash' },
        { value: 'credit_card', label: 'Credit Card' },
        { value: 'bank_transfer', label: 'Bank Transfer' },
      ]
    },
    { key: 'payment_date', type: 'date', placeholder: 'Select Payment Date', span: 12 },
    { key: 'generated_on', type: 'range', placeholder: 'Select Generated Date', span: 24 },
    {
      key: 'status', type: 'select', placeholder: 'Select Status', span: 24, options: [
        { value: '', label: 'Select' },
        { value: 'paid', label: 'Paid' },
        { value: 'unpaid', label: 'Unpaid' },
        { value: 'draft', label: 'Draft' },
      ]
    },
    {
      key: 'materials',
      type: 'select',
      mode: 'multiple',
      placeholder: 'Select Materials',
      options: materials,
      span: 24,
      loading: materialsLoading,
      onSearch: handleMaterialsSearch,
      onPopupScroll: handleMaterialsPopupScroll,
      filterOption: false,
      onChange: (selectedIds) => {
        if (Array.isArray(selectedIds)) {
          const selectedObjs = materials.filter((m) => selectedIds.includes(m.value))
          selectedOptionsRef.current = selectedObjs
        }
      }
    }
  ];

  // Context filters that scope the whole page (center, pre-selected student/staff) and must
  // survive panel filter apply/reset — losing center_id here would leak bills across centers.
  const STICKY_FILTER_KEYS = ['generated_for', 'center_id']

  const getStickyFilters = () => {
    const stickyFilters = {}
    STICKY_FILTER_KEYS.forEach((key) => {
      if (filters?.query?.[key] !== undefined) stickyFilters[key] = filters.query[key]
    })
    return stickyFilters
  }

  const onFilterApply = (newFilters) => {
    onLoadMore(10, { query: { ...getStickyFilters(), ...newFilters } })
  }

  const onReset = () => {
    onLoadMore(10, { query: getStickyFilters() })
  }

  return (
    <div className='flex gap-5 h-full | flex-col lg:overflow-auto lg:flex-row'>
      <div className='| w-full lg:w-1/4'>
        <div className='flex justify-between mb-3 items-center'>
          <div>
            <Tag color='orange'>{total} bills</Tag>
          </div>
          {permissions.bills?.export?.includes(user?.role) && (
            <div>
              <ExportBillsModal />
            </div>
          )}
        </div>
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
