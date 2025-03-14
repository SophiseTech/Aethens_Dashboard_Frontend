import CustomForm from '@components/form/CustomForm'
import CustomSubmit from '@components/form/CustomSubmit'
import ItemsInputTable from '@pages/Bills/Components/ItemsInputTable'
import billStore from '@stores/BillStore'
import inventoryStore from '@stores/InventoryStore'
import materialStore from '@stores/MaterialsStore'
import { Button, Flex, Form } from 'antd'
import { useEffect, useMemo, useState } from 'react'

function AllotMaterials({ student_id, handleOk }) {

  const [form] = Form.useForm()
  const { loading, createMaterials } = materialStore()
  const { items, getItems, loading: itemsLoading, total: inventoryTotal } = inventoryStore()
  const [selecteItems, setSelecteItems] = useState({})
  const [totals, setTotals] = useState({})
  const { getInvoiceNo, createBill, createLoading: billLoading } = billStore()

  console.log(student_id);

  useEffect(() => {
    if (inventoryTotal === 0 || items.length < inventoryTotal) {
      getItems(0)
    }
  }, [])

  const onSubmit = async (values) => {
    if (values.items) {
      values.items?.forEach((item, index) => {
        item.inventory_item_id = selecteItems[index]._id
        item.status = "pending",
          item.student_id = student_id
      })
    }
    await createMaterials(values.items)
    console.log(values);
    handleOk()
  }

  const onSubmitWithInvoice = async (values) => {
    await form.validateFields()
    const invoiceNo = await getInvoiceNo()
    const items = values.items?.map((item, index) => ({
      ...item,
      item: selecteItems[index]._id
    }))
    const data = {
      ...totals,
      invoiceNo,
      items,
      status: "unpaid",
      generated_on: new Date(),
      generated_for: student_id,
      subject: "Materials"
    }
    const bill = await createBill(data)
    values.items.forEach(item => item.bill_id = bill._id)
    await onSubmit(values)
    form.resetFields()
    handleOk()
  }

  const initialValues = {
    items: []
  }

  const itemsOptions = useMemo(() => items?.filter(item => (item.quantity > 0 && item.type === "materials"))
    .map(item => ({ label: item.name, value: item._id })), [items])

  return (
    <CustomForm form={form} action={onSubmit} initialValues={initialValues} >

      <ItemsInputTable form={form} items={items} itemsOptions={itemsOptions} name={"items"} selectedItem={selecteItems} setSelectedItem={setSelecteItems} setTotals={setTotals} />

      <Flex gap={5} className='mt-5'>
        <CustomSubmit className='bg-primary' label='Save' loading={loading} />

        <Button onClick={() => { onSubmitWithInvoice(form.getFieldsValue()) }} loading={billLoading} variant='outlined' color='purple'>Save And Generate Invoice</Button>
      </Flex>

    </CustomForm>
  )
}

export default AllotMaterials