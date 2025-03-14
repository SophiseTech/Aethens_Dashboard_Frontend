import Title from '@components/layouts/Title'
import BillsLayot from '@pages/Bills/Components/BillsLayot'
import GenerateBillButton from '@pages/Bills/Components/GenerateBillButton'
import billStore from '@stores/BillStore'
import inventoryStore from '@stores/InventoryStore'
import studentStore from '@stores/StudentStore'
import userStore from '@stores/UserStore'
import { ROLES } from '@utils/constants'
import permissions from '@utils/permissions'
import _ from 'lodash'
import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStore } from 'zustand'


function Bills() {

  const { getBills, bills, loading, createBill, total, getInvoiceNo, invoiceNo, filters: stateFilters } = billStore()
  const { getItems, items, loading: itemsLoading, total: inventoryTotal } = inventoryStore()
  const { getStudentsByCenter, total: studentTotal, students } = studentStore()
  const [searchParams, setSearchParams] = useSearchParams();
  const student_id = searchParams.get("student_id")
  const { user } = useStore(userStore)

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
      console.log("useeffect filters: ", filters.query);

      // filters = { ...filters, query: { ...filters.query, ...stateFilters.query } }
      fetchBills(10, filters)
    }
  }, [student_id])

  const fetchBills = (limit = 10, filters = {}) => {
    getBills(limit, {
      ...stateFilters, ...filters, populate: [
        { path: "generated_for", populate: { path: "details_id", model: "Student" } }, // Deep populate details_id
        { path: "generated_by" },
        { path: "items.item" }
      ]
    })
  }

  const loadInitData = () => {
    if (!invoiceNo || invoiceNo === 0) {
      getInvoiceNo()
    }
    if (inventoryTotal === 0 || items.length < inventoryTotal) {
      getItems(0)
    }
    if (studentTotal === 0 || students.length < studentTotal) {
      getStudentsByCenter(0)
    }
  }

  const itemsOptions = useMemo(() => items?.map(item => ({ label: item.name, value: item._id })), [items])
  const customerOptions = useMemo(() => students?.map(item => ({ label: item.username, value: item._id })), [students])

  const handleOnSave = async (values) => {
    values.generated_on = values.generated_on.toISOString()
    await createBill(values)
  }

  return (
    <Title title={"Bills"} button={
      permissions.bills.add.includes(user.role) &&
      <GenerateBillButton
        itemsOptions={itemsOptions}
        customersOptions={customerOptions}
        loadInitData={loadInitData}
        items={items}
        customers={students}
        onSave={handleOnSave}
        invoiceNo={invoiceNo}
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