import Chip from '@components/Chips/Chip'
import billStore from '@stores/BillStore'
import materialStore from '@stores/MaterialsStore'
import { formatDate } from '@utils/helper'
import {
  ArrowUpOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  FilterOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  DatePicker,
  Drawer,
  Input,
  Row,
  Select,
  Statistic,
  Table,
  Tag,
  Tooltip,
} from 'antd'
import dayjs from 'dayjs'
import React, { useMemo, useState } from 'react'
import { Outlet, useNavigate, useParams, useSearchParams } from 'react-router-dom'

const PRIMARY = '#4F651E'
const DANGER = '#c0392b'

const fmt = (val) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val || 0)

function BillsLayot({ bills, loading, total, onLoadMore }) {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const nav = useNavigate()
  const { editBill, deleteBill, setFilters, filters } = billStore()
  const { editMaterialsByBillId } = materialStore()

  // Drawer state for bill detail
  const [drawerOpen, setDrawerOpen] = useState(!!id)
  const [activeBillId, setActiveBillId] = useState(id || null)

  // Filter states
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [methodFilter, setMethodFilter] = useState('')
  const [dateRange, setDateRange] = useState(null)

  // ── Metrics derived from loaded bills ──────────────────────────────────────
  const metrics = useMemo(() => {
    const inc = bills.reduce((s, b) => s + (b.total || 0), 0)
    const paid = bills.filter(b => b.status === 'paid').reduce((s, b) => s + (b.total || 0), 0)
    const unpaid = bills.filter(b => b.status !== 'paid').reduce((s, b) => s + (b.total || 0), 0)
    const paidCount = bills.filter(b => b.status === 'paid').length
    const unpaidCount = bills.filter(b => b.status !== 'paid').length
    return { inc, paid, unpaid, paidCount, unpaidCount }
  }, [bills])

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns = [
    {
      title: 'Invoice #',
      key: 'invoice',
      width: 110,
      render: (_, bill) => (
        <span className="font-mono text-xs font-semibold" style={{ color: PRIMARY }}>
          {bill.center_initial || ''}{bill.invoiceNo}
        </span>
      ),
    },
    {
      title: 'Student',
      key: 'student',
      render: (_, bill) => (
        <div className="flex items-center gap-2">
          <img
            className="rounded-full aspect-square w-7 border border-border"
            src={bill.generated_for?.profile_img || '/images/default.jpg'}
            alt=""
          />
          <span className="font-medium text-sm capitalize">{bill.generated_for?.username || '—'}</span>
        </div>
      ),
    },
    {
      title: 'Date',
      key: 'date',
      width: 110,
      render: (_, bill) => (
        <span className="text-xs text-gray-500">
          {dayjs(bill.generated_on).format('D MMM YYYY')}
        </span>
      ),
    },
    {
      title: 'Type',
      key: 'type',
      width: 110,
      render: (_, bill) => {
        const type = bill.items?.[0]?.type || 'course'
        const color = type === 'materials' ? 'orange' : type === 'gallery' ? 'purple' : 'blue'
        return <Tag color={color} className="capitalize text-xs">{type}</Tag>
      },
    },
    {
      title: 'Payment Method',
      key: 'method',
      width: 130,
      render: (_, bill) => (
        <span className="text-xs capitalize text-gray-500">
          {bill.payment_method?.replace('_', ' ') || '—'}
        </span>
      ),
    },
    {
      title: 'Paid On',
      key: 'paid_on',
      width: 110,
      render: (_, bill) => (
        <span className="text-xs text-gray-500">
          {bill.payment_date ? dayjs(bill.payment_date).format('D MMM YYYY') : '—'}
        </span>
      ),
    },
    {
      title: 'Amount',
      key: 'amount',
      align: 'right',
      width: 110,
      render: (_, bill) => (
        <span className="font-semibold text-sm" style={{ color: PRIMARY }}>
          {fmt(bill.total)}
        </span>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 90,
      align: 'center',
      render: (_, bill) => {
        if (bill.status === 'paid') return <Chip size="small" type="success" label="Paid" />
        if (bill.status === 'draft') return <Chip size="small" type="draft" label="Draft" />
        return <Chip size="small" type="danger" label="Unpaid" />
      },
    },
    {
      title: '',
      key: 'action',
      width: 60,
      align: 'center',
      render: (_, bill) => (
        <Tooltip title="View Bill">
          <Button
            size="small"
            type="text"
            icon={<FileTextOutlined />}
            style={{ color: PRIMARY }}
            onClick={() => openBill(bill._id)}
          />
        </Tooltip>
      ),
    },
  ]

  // ── Filter logic (applied client-side on loaded bills) ─────────────────────
  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      const inv = `${bill.center_initial || ''}${bill.invoiceNo}`.toLowerCase()
      if (invoiceSearch && !inv.includes(invoiceSearch.toLowerCase())) return false
      if (statusFilter && bill.status !== statusFilter) return false
      if (methodFilter && bill.payment_method !== methodFilter) return false
      if (dateRange?.[0] && dateRange?.[1]) {
        const d = dayjs(bill.generated_on)
        if (d.isBefore(dateRange[0], 'day') || d.isAfter(dateRange[1], 'day')) return false
      }
      return true
    })
  }, [bills, invoiceSearch, statusFilter, methodFilter, dateRange])

  const openBill = (billId) => {
    setActiveBillId(billId)
    setDrawerOpen(true)
    nav(`${billId}${location.search}`, { replace: true })
  }

  const closeBill = () => {
    setDrawerOpen(false)
    setActiveBillId(null)
    nav(`/manager/bills${location.search}`, { replace: true })
  }

  const handleFilterApply = () => {
    const q = {}
    if (statusFilter) q.status = statusFilter
    if (methodFilter) q.payment_method = methodFilter
    if (dateRange?.[0] && dateRange?.[1]) {
      q.generated_on = {
        $gte: dateRange[0].startOf('day').toISOString(),
        $lte: dateRange[1].endOf('day').toISOString(),
      }
    }
    if (filters?.query?.generated_for) q.generated_for = filters.query.generated_for
    onLoadMore(100, { query: q })
  }

  const handleFilterReset = () => {
    setInvoiceSearch('')
    setStatusFilter('')
    setMethodFilter('')
    setDateRange(null)
    onLoadMore(10, { query: filters?.query?.generated_for ? { generated_for: filters.query.generated_for } : {} })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Metrics ────────────────────────────────────────────────────────── */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} lg={6}>
          <Card size="small" className="border border-border bg-card text-center">
            <Statistic
              title={<span className="text-xs text-gray-500">Total Billed</span>}
              value={metrics.inc}
              prefix="₹"
              valueStyle={{ color: PRIMARY, fontSize: 18 }}
              formatter={v => Number(v).toLocaleString('en-IN')}
            />
            <div className="text-xs text-gray-400 mt-1">{bills.length} bill{bills.length !== 1 ? 's' : ''}</div>
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <Card size="small" className="border border-border bg-card text-center">
            <Statistic
              title={<span className="text-xs text-gray-500">Collected</span>}
              value={metrics.paid}
              prefix="₹"
              valueStyle={{ color: PRIMARY, fontSize: 18 }}
              formatter={v => Number(v).toLocaleString('en-IN')}
            />
            <div className="text-xs text-gray-400 mt-1">{metrics.paidCount} paid</div>
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <Card size="small" className="border border-border bg-card text-center">
            <Statistic
              title={<span className="text-xs text-gray-500">Pending</span>}
              value={metrics.unpaid}
              prefix="₹"
              valueStyle={{ color: DANGER, fontSize: 18 }}
              formatter={v => Number(v).toLocaleString('en-IN')}
            />
            <div className="text-xs text-gray-400 mt-1">{metrics.unpaidCount} unpaid</div>
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <Card size="small" className="border border-border bg-card text-center">
            <div className="flex flex-col items-center gap-1 py-1">
              <span className="text-xs text-gray-500">Collection Rate</span>
              <span className="text-2xl font-bold" style={{ color: metrics.inc > 0 ? PRIMARY : '#aaa' }}>
                {metrics.inc > 0 ? Math.round((metrics.paid / metrics.inc) * 100) : 0}%
              </span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <Card size="small" className="border border-border">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Invoice</span>
            <Input
              placeholder="e.g. WFD1001"
              value={invoiceSearch}
              onChange={e => setInvoiceSearch(e.target.value)}
              style={{ width: 150 }}
              allowClear
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Status</span>
            <Select
              value={statusFilter || undefined}
              onChange={setStatusFilter}
              placeholder="All"
              allowClear
              style={{ width: 130 }}
              options={[
                { label: 'Paid', value: 'paid' },
                { label: 'Unpaid', value: 'unpaid' },
                { label: 'Draft', value: 'draft' },
              ]}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Payment Method</span>
            <Select
              value={methodFilter || undefined}
              onChange={setMethodFilter}
              placeholder="All"
              allowClear
              style={{ width: 150 }}
              options={[
                { label: 'Cash', value: 'cash' },
                { label: 'Credit Card', value: 'credit_card' },
                { label: 'Bank Transfer', value: 'bank_transfer' },
              ]}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Date Range</span>
            <DatePicker.RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="D MMM YYYY"
              style={{ width: 250 }}
            />
          </div>
          <div className="flex gap-2">
            <Button type="primary" icon={<FilterOutlined />} onClick={handleFilterApply}>
              Apply
            </Button>
            <Button onClick={handleFilterReset}>Reset</Button>
          </div>
        </div>
      </Card>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400">
          Showing <strong className="text-gray-600">{filteredBills.length}</strong> of{' '}
          <strong className="text-gray-600">{total}</strong> bills
        </span>
        {bills.length < total && (
          <Button
            size="small"
            onClick={() => onLoadMore(bills.length + 50)}
            loading={loading}
          >
            Load more
          </Button>
        )}
      </div>
      <Table
        columns={columns}
        dataSource={filteredBills}
        rowKey="_id"
        loading={loading}
        size="small"
        pagination={{ pageSize: 20, showSizeChanger: false }}
        className="border border-border rounded-xl overflow-hidden"
        onRow={(bill) => ({
          className: 'cursor-pointer hover:bg-stone-50 transition-colors',
          onClick: () => openBill(bill._id),
        })}
        scroll={{ x: 800 }}
      />

      {/* ── Bill Detail Drawer ───────────────────────────────────────────────── */}
      <Drawer
        open={drawerOpen}
        onClose={closeBill}
        width={Math.min(860, window.innerWidth - 40)}
        title={null}
        styles={{ body: { padding: 0 } }}
        destroyOnClose={false}
      >
        {drawerOpen && (
          <Outlet context={{ bills, editBill, id: activeBillId, deleteBill, editMaterials: editMaterialsByBillId }} />
        )}
      </Drawer>
    </div>
  )
}

export default BillsLayot