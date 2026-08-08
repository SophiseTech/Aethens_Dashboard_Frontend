import inventoryService from '@/services/Inventory'
import CustomForm from '@components/form/CustomForm'
import CustomSubmit from '@components/form/CustomSubmit'
import ItemsInputTable from '@pages/Bills/Components/ItemsInputTable'
import billStore from '@stores/BillStore'
import materialStore from '@stores/MaterialsStore'
import { Button, Flex, Form } from 'antd'
import { useEffect, useMemo, useState } from 'react'

// Flattens a center-scoped InventoryV2 stock row (item_id populated with the
// InventoryItemV2 catalog doc) into the flat shape ItemsInputTable expects.
// Uses the catalog item's _id (not the stock row's own _id) as the identity,
// since that's what Bill.items.item / StudentMaterial.inventory_item_id
// actually reference.
const mapCenterInventoryItem = (row) => ({
  _id: row.item_id?._id,
  name: row.item_id?.name,
  type: row.type || row.item_id?.type,
  quantity: row.quantity,
  rate: row.rate,
  taxes: row.tax,
  discount: row.discount,
})

function AllotMaterials({ student_id, handleOk, course_id }) {

  const [form] = Form.useForm()
  const { loading, createMaterials, editMaterials } = materialStore()
  const [selecteItems, setSelecteItems] = useState({})
  const [totals, setTotals] = useState({})
  const { createBill, createLoading: billLoading } = billStore()
  const [items, setItems] = useState([])

  console.log(student_id);

  useEffect(() => {
    fetchItems(10, { type: "materials" })
  }, [])

  const fetchItems = async (limit = 10, filters = {}) => {
    const response = await inventoryService.getCenterInventoryItems(null, 0, limit, filters)
    if (response?.items) {
      setItems(response.items.filter(row => row.item_id).map(mapCenterInventoryItem))
    }
  }

  // `collected: true` is used by the "Save And Generate Invoice" path — generating
  // the invoice is treated as the sale being final. Materials are always created
  // "pending" first (that's the status _deductAndLog requires to run), then
  // immediately transitioned to "collected" via editMaterials, which is what
  // actually deducts stock — mirrors EditAllotedMaterials' generate-then-collect
  // flow instead of relying on the bill itself to move stock.
  const onSubmit = async (values, { collected = false } = {}) => {
    if (values.items) {
      values.items?.forEach((item, index) => {
        item.inventory_item_id = selecteItems[index]._id
        item.status = "pending"
        item.student_id = student_id
        item.course_id = course_id
      })
    }
    const created = await createMaterials(values.items)
    if (collected && created) {
      const createdIds = (Array.isArray(created) ? created : [created]).map(m => m._id)
      if (createdIds.length) {
        await editMaterials(createdIds, { status: "collected", collected_on: new Date() })
      }
    }
    console.log(values);
    handleOk()
  }

  const onSubmitWithInvoice = async (values) => {
    await form.validateFields()

    const items = values.items?.map((item, index) => ({
      ...item,
      item: selecteItems[index]._id,
      name: selecteItems[index].name,
      item_type: "InventoryItemV2"
    }))
    const data = {
      ...totals,
      items,
      status: "unpaid",
      generated_on: new Date(),
      generated_for: student_id,
      subject: "Materials",
      // Stock is deducted via the StudentMaterial "collected" flow below
      // (see onSubmit), not by the bill itself — avoids double-decrementing.
      skipInventoryReconciliation: true
    }
    const bill = await createBill(data)
    values.items.forEach(item => item.bill_id = bill._id)
    await onSubmit(values, { collected: true })
    form.resetFields()
    handleOk()
  }

  const initialValues = {
    items: []
  }

  const handleSearch = async (value) => {
    const response = await inventoryService.getCenterInventoryItems(
      null,
      0,
      15,
      { searchQuery: value, type: "materials" }
    )
    if (response?.items) {
      setItems(response.items.filter(row => row.item_id).map(mapCenterInventoryItem))
    } else {
      setItems([])
    }
  }

  const itemsOptions = useMemo(() => items?.filter(item => (item.quantity > 0 && item.type === "materials"))
    .map(item => ({ label: item.name, value: item._id })), [items])

  console.log(itemsOptions);


  return (
    <CustomForm form={form} action={onSubmit} initialValues={initialValues} >

      <ItemsInputTable form={form} items={items} itemsOptions={itemsOptions} name={"items"} selectedItem={selecteItems} setSelectedItem={setSelecteItems} setTotals={setTotals} onSearch={handleSearch} />

      <Flex gap={5} className='mt-5'>
        <CustomSubmit className='bg-primary' label='Save' loading={loading} />

        <Button onClick={() => { onSubmitWithInvoice(form.getFieldsValue()) }} loading={billLoading} variant='outlined' color='purple'>Save And Generate Invoice</Button>
      </Flex>

    </CustomForm>
  )
}

export default AllotMaterials