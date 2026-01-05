import courseService from '@/services/Course'
import inventoryService from '@/services/Inventory'
import Title from '@components/layouts/Title'
import BillsLayot from '@pages/Bills/Components/BillsLayot'
import GenerateBillButton from '@pages/Bills/Components/GenerateBillButton'
import billStore from '@stores/BillStore'
import courseStore from '@stores/CourseStore'
import inventoryStore from '@stores/InventoryStore'
import studentStore from '@stores/StudentStore'
import userStore from '@stores/UserStore'
import { ROLES } from '@utils/constants'
import permissions from '@utils/permissions'
import _ from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStore } from 'zustand'


function Bills() {

  const { getBills, bills, loading, createBill, total, getInvoiceNo, invoiceNo, filters: stateFilters } = billStore()
  const { getItems, searhcItems } = inventoryStore()
  const { getStudentsByCenter, total: studentTotal, students } = studentStore()
  const [searchParams, setSearchParams] = useSearchParams();
  const student_id = searchParams.get("student_id")
  const { user } = useStore(userStore)
  const { courses, getCourses, total: courseTotal } = useStore(courseStore)
  const [lineItems, setLineItems] = useState([])
  const urlStatus = searchParams.get("status")
  // const [lineItemSearchFunction, setLneItemSearchFunction] = useState(() => { })

  useEffect(() => {
    console.log(stateFilters?.query?.generated_for != student_id, stateFilters?.query?.generated_for, student_id);

    if (!bills || stateFilters?.query?.generated_for != student_id || bills.length <= 0) {
      let filters = _.cloneDeep(stateFilters);
      filters.query = filters.query || {};

      if (user.role === ROLES.STUDENT) {
        filters.query.generated_for = user._id
      } else if (student_id) {
        filters.query.generated_for = student_id
      } else {
        delete filters.query.generated_for
      }

      if( urlStatus && ['paid', 'unpaid'].includes(urlStatus)) {
        filters.query.status = urlStatus
      }
      console.log("useeffect filters: ", filters.query);

      // filters = { ...filters, query: { ...filters.query, ...stateFilters.query } }
      fetchBills(10, filters)
    }
  }, [student_id, urlStatus])

  const fetchBills = (limit = 10, filters = {}) => {
    getBills(limit, {
      ...stateFilters, ...filters, populate: [
        { path: "generated_for", populate: { path: "details_id", model: "Student" } }, // Deep populate details_id
        { path: "generated_by" },
        { path: "items.item", model: "Course" }
      ]
    })
  }

  const loadInitData = async ({ itemType }) => {
    console.log(itemType);

    if (!invoiceNo || invoiceNo === 0) {
      getInvoiceNo()
    }
    if (itemType === "materials") {
      const { items } = await inventoryService.getInventoryItems(0, 10, { query: { type: "materials" } })
      setLineItems(items)
      // setLneItemSearchFunction(searhcItems)
    }
    if (itemType === "course") {
      const { courses } = await courseService.getCourses({}, 0, 0)
      setLineItems([...courses?.map(course => ({ name: course.course_name, _id: course._id, type: "course", rate: course.rate, discount: 0, taxes: 18 })), { name: "Registration Fee", _id: "67c00eb2073609b23054ca01", type: "course", rate: 3500, discount: 0, taxes: 18 }])
    }
    if (itemType === "gallery") {
      const { items } = await inventoryService.getInventoryItems(0, 10, { query: { type: "gallery" } })
      setLineItems(items)
      // setLneItemSearchFunction(searhcItems)
    }
    if (studentTotal === 0 || students.length < studentTotal) {
      getStudentsByCenter(0)
    }
    // if (courseTotal === 0 || courses.length < courseTotal) {
    //   getCourses(0)
    // }
  }

  const customerOptions = useMemo(() => students?.map(item => ({ label: item.username, value: item._id })), [students])

  const handleOnSave = async (values) => {
    values.generated_on = values.generated_on.toISOString()
    await createBill(values)
  }

  const handleSearch = async (value, itemType) => {
    if (itemType === "materials") {
      const { items } = await inventoryService.getInventoryItems(
        0,
        value === "" ? 10 : 0,
        { searchQuery: value, query: { type: "materials" } }
      )
      setLineItems(items)
      return
    }
    if (itemType === "gallery") {
      const { items } = await inventoryService.getInventoryItems(
        0,
        value === "" ? 10 : 0,
        { searchQuery: value, query: { type: "gallery" } }
      )
      setLineItems(items)
      return
    }
  }

  return (
    <Title title={"Bills"} button={
      permissions.bills.add.includes(user.role) &&
      <GenerateBillButton
        // itemsOptions={itemsOptions}
        customersOptions={customerOptions}
        loadInitData={loadInitData}
        items={lineItems}
        customers={students}
        onSave={handleOnSave}
        invoiceNo={invoiceNo}
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