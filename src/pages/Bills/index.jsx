import centersService from '@/services/Centers'
import courseService from '@/services/Course'
import inventoryService from '@/services/Inventory'
import Title from '@components/layouts/Title'
import BillsLayot from '@pages/Bills/Components/BillsLayot'
import GenerateBillButton from '@pages/Bills/Components/GenerateBillButton'
import billStore from '@stores/BillStore'
import centersStore from '@stores/CentersStore'
import courseStore from '@stores/CourseStore'
import inventoryStore from '@stores/InventoryStore'
import studentStore from '@stores/StudentStore'
import userStore from '@stores/UserStore'
import { ROLES } from '@utils/constants'
import permissions from '@utils/permissions'
import dayjs from 'dayjs'
import _ from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStore } from 'zustand'


function Bills() {

  const { getBills, bills, loading, createBill, total, getInvoiceNo, invoiceNo, center_initial, filters: stateFilters } = billStore()
  const { getItems } = inventoryStore()
  const { getStudentsByCenter, total: studentTotal, students } = studentStore()
  const [searchParams, setSearchParams] = useSearchParams();
  const student_id = searchParams.get("student_id")
  const { user } = useStore(userStore)
  const { selectedCenter } = useStore(centersStore);
  const { courses, getCourses, total: courseTotal } = useStore(courseStore)
  const [lineItems, setLineItems] = useState([])
  const urlStatus = searchParams.get("status")
  // const [lineItemSearchFunction, setLneItemSearchFunction] = useState(() => { })

  useEffect(() => {
    console.log(stateFilters?.query?.generated_for != student_id, stateFilters?.query?.generated_for, student_id);

    if (!bills || stateFilters?.query?.generated_for != student_id || bills.length <= 0 || user.role === 'admin') {
      let filters = _.cloneDeep(stateFilters);
      filters.query = filters.query || {};

      // Only display bills generated till today (this will hide post dated installment bills)
      filters.query.generated_on = {$lte: dayjs().endOf("month")}

      if (user.role === ROLES.STUDENT) {
        filters.query.generated_for = user._id
      } else if (student_id) {
        filters.query.generated_for = student_id
      } else {
        delete filters.query.generated_for
      }

      if (user.role === ROLES.ADMIN) {
        filters.query.center_id = selectedCenter;
      }

      if (urlStatus && ['paid', 'unpaid'].includes(urlStatus)) {
        filters.query.status = urlStatus
      }
      console.log("useeffect filters: ", filters.query);

      // filters = { ...filters, query: { ...filters.query, ...stateFilters.query } }
      fetchBills(10, filters)

    }
  }, [student_id, urlStatus, selectedCenter])

  const fetchBills = (limit = 10, filters = {}) => {
    getBills(limit, {
      ...stateFilters, ...filters, populate: [
        { path: "generated_for", populate: { path: "details_id", model: "Student" } }, // Deep populate details_id
        { path: "generated_by" },
        { path: "items.item", model: "Course" }
      ]
    })
  }

  useEffect(() => {
    getStudentsByCenter(0);
  }, [selectedCenter])

  const loadInitData = async ({ itemType, centerId }) => {
    console.log(itemType, centerId);

    if (!invoiceNo || invoiceNo === 0 || user.role === ROLES.ADMIN) {
      user.role === ROLES.ADMIN ? getInvoiceNo(centerId) : getInvoiceNo();
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
    if (studentTotal === 0 || students.length < studentTotal || user.role === ROLES.ADMIN) {
      getStudentsByCenter(0)
    }
  }

  const customerOptions = useMemo(() => students?.map(item => ({ label: item.username, value: item._id, data: item?.wallet })), [students])

  const handleOnSave = async (values) => {
    values.generated_on = values.generated_on.toISOString()
    await createBill(values)
  }

  const handleSearch = async (value, itemType) => {
    let effectiveCenterId;
    if(user.role === 'manager'){
      effectiveCenterId =  user?.center_id
    }else{
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