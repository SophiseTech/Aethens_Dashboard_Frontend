import courseService from '@/services/Course'
import inventoryService from '@/services/Inventory'
import { BILL_POPULATE } from '@/services/Bills'
import Title from '@components/layouts/Title'
import useSearchableStudents from '@hooks/useSearchableStudents'
import BillsLayot from '@pages/Bills/Components/BillsLayot'
import GenerateBillButton from '@pages/Bills/Components/GenerateBillButton'
import billStore from '@stores/BillStore'
import centersStore from '@stores/CentersStore'
import userStore from '@stores/UserStore'
import { ROLES } from '@utils/constants'
import { toISTStartOfDayISO } from '@utils/helper'
import permissions from '@utils/permissions'
import dayjs from 'dayjs'
import _, { debounce } from 'lodash'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStore } from 'zustand'


function Bills() {

  const { getBills, bills, loading, createBill, total, getInvoiceNo, invoiceNo, center_initial, filters: stateFilters } = billStore()
  const { searchStudents, students } = useSearchableStudents()
  const [searchParams] = useSearchParams();
  const student_id = searchParams.get("student_id")
  const staff_id = searchParams.get("staff_id")
  // Both params scope the same "generated_for" field — a bill can be raised for a student or a staff member
  const generatedForId = student_id || staff_id
  const { user } = useStore(userStore)
  const { selectedCenter } = useStore(centersStore);
  const [lineItems, setLineItems] = useState([])
  const urlStatus = searchParams.get("status")

  useEffect(() => {
    // Refetch only when the context actually changed — not on every remount/re-render.
    // Center changes are covered because `selectedCenter` is a dependency.
    if (!bills || bills.length <= 0 || stateFilters?.query?.generated_for != generatedForId) {
      let filters = _.cloneDeep(stateFilters);
      filters.query = filters.query || {};

      // Only display bills generated till today (this will hide post dated installment bills).
      // ISO string (not a live dayjs) so the query stays plain JSON for store `_.isEqual` paging checks.
      filters.query.generated_on = { $lte: dayjs().endOf("month").toISOString() }

      if (user.role === ROLES.STUDENT) {
        filters.query.generated_for = user._id
      } else if (generatedForId) {
        filters.query.generated_for = generatedForId
      } else {
        delete filters.query.generated_for
      }

      if (user.role === ROLES.ADMIN || user.role === ROLES.OPERATIONS_MANAGER) {
        filters.query.center_id = selectedCenter;
      }

      if (urlStatus && ['paid', 'unpaid'].includes(urlStatus)) {
        filters.query.status = urlStatus
      }

      fetchBills(10, filters)

    }
  }, [generatedForId, urlStatus, selectedCenter])

  const fetchBills = (limit = 10, filters = {}) => {
    getBills(limit, { ...stateFilters, ...filters, populate: BILL_POPULATE })
  }

  const handleDebouncedCustomerSearch = useCallback(
    debounce((searchQuery) => {
      try {
        searchStudents(0, 15, { searchQuery });
      } catch (error) {
        console.error(error);
      }
    }, 500),
    []
  );

  const loadInitData = async ({ itemType, centerId }) => {
    if (!invoiceNo || invoiceNo === 0 || user.role === ROLES.ADMIN || user.role === ROLES.OPERATIONS_MANAGER) {
      user.role === ROLES.ADMIN || user.role === ROLES.OPERATIONS_MANAGER ? getInvoiceNo(centerId) : getInvoiceNo();
    }

    // Determine which center to fetch items from
    const effectiveCenterId = centerId || user?.center_id;

    if (itemType === "materials" && effectiveCenterId) {
      // Fetch from center's inventory (only items available in this center)
      const response = await inventoryService.getCenterInventoryItems(effectiveCenterId, 0, 200, { type: "materials" })
      if (response?.items) {
        // Map center inventory records to item format for the bill form
        const mappedItems = response.items.map(record => ({
          ...record.item_id,
          rate: record.rate,
          discount: record.discount,
          taxes: record.tax,
          quantity: record.quantity,
          type: record.type,
        }))
        setLineItems(mappedItems)
      }
    }
    if (itemType === "course") {
      const { courses } = await courseService.getCourses({}, 0, 0)
      setLineItems([...courses?.map(course => ({ name: course.course_name, _id: course._id, type: "course", rate: course.rate, discount: 0, taxes: 18 })), { name: "Registration Fee", _id: "67c00eb2073609b23054ca01", type: "course", rate: 3500, discount: 0, taxes: 18 }])
    }
    if (itemType === "gallery" && effectiveCenterId) {
      // Fetch from center's inventory (only gallery items available in this center)
      const response = await inventoryService.getCenterInventoryItems(effectiveCenterId, 0, 200, { type: "gallery" })
      if (response?.items) {
        const mappedItems = response.items.map(record => ({
          ...record.item_id,
          rate: record.rate,
          discount: record.discount,
          taxes: record.tax,
          quantity: record.quantity,
          type: record.type,
        }))
        setLineItems(mappedItems)
      }
    }
  }

  const customerOptions = useMemo(() => students?.map(item => ({ label: item.username, value: item._id, data: item?.wallet })), [students])

  const handleOnSave = async (values) => {
    values.generated_on = toISTStartOfDayISO(values.generated_on)
    await createBill(values)
  }

  const handleSearch = async (value, itemType) => {
    let effectiveCenterId;
    if (user.role === 'manager') {
      effectiveCenterId = user?.center_id
    } else {
      effectiveCenterId = selectedCenter
    }
    if (!effectiveCenterId) return;

    if (itemType === "materials") {
      const response = await inventoryService.getCenterInventoryItems(
        effectiveCenterId,
        0,
        value === "" ? 200 : 0,
        { searchQuery: value, type: "materials" }
      )
      if (response?.items) {
        const mappedItems = response.items.map(record => ({
          ...record.item_id,
          rate: record.rate,
          discount: record.discount,
          taxes: record.tax,
          quantity: record.quantity,
          type: record.type,
        }))
        setLineItems(mappedItems)
      }
      return
    }
    if (itemType === "gallery") {
      const response = await inventoryService.getCenterInventoryItems(
        effectiveCenterId,
        0,
        value === "" ? 200 : 0,
        { searchQuery: value, type: "gallery" }
      )
      if (response?.items) {
        const mappedItems = response.items.map(record => ({
          ...record.item_id,
          rate: record.rate,
          discount: record.discount,
          taxes: record.tax,
          quantity: record.quantity,
          type: record.type,
        }))
        setLineItems(mappedItems)
      }
      return
    }
  }

  return (
    <Title title={"Bills"} button={
      permissions.bills?.add?.includes(user?.role) &&
      <GenerateBillButton
        // itemsOptions={itemsOptions}
        customersOptions={customerOptions}
        loadInitData={loadInitData}
        items={lineItems}
        customers={students}
        onSave={handleOnSave}
        invoiceNo={invoiceNo}
        center_initial={center_initial}
        onSearch={handleSearch}
        onCustomerSearch={handleDebouncedCustomerSearch}
      />
    }>
      <BillsLayot
        bills={bills}
        loading={loading}
        total={total}
        onLoadMore={fetchBills}
      />
    </Title>
  )
}
export default Bills
