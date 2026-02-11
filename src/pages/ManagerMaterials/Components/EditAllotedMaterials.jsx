import inventoryService from '@/services/Inventory'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import CustomForm from '@components/form/CustomForm'
import CustomSubmit from '@components/form/CustomSubmit'
import ItemsInputTable from '@pages/Bills/Components/ItemsInputTable'
import billStore from '@stores/BillStore'
import inventoryStore from '@stores/InventoryStore'
import materialStore from '@stores/MaterialsStore'
import userStore from '@stores/UserStore'
import { Button, Form, Modal } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { useStore } from 'zustand'

function EditAllotedMaterials({ selectedRowKeys, student_id, handleOk }) {
  const [form] = Form.useForm()
  const { user } = useStore(userStore)
  const { getInvoiceNo, createBill, createLoading: billLoading } = useStore(billStore)
  const { getItems, total: inventoryTotal, editItem } = useStore(inventoryStore)
  const [selecteItems, setSelecteItems] = useState({})
  const [totals, setTotals] = useState({})
  const { editMaterials, loading, materials } = useStore(materialStore)
  const [items, setItems] = useState([])

  const [modal, contextHolder] = Modal.useModal()

  useEffect(() => {
    fetchItems(10, { query: { type: "materials" } })
  }, [])

  const fetchItems = async (limit = 10, filters = {}) => {
    const { items, total } = await inventoryService.getInventoryItems(0, limit, filters)
    if (items) {
      setItems(items)
    }
  }

  useEffect(() => {
    const materialMap = new Map(materials.map((m) => [m._id, m]));
    const selectedMaterials = selectedRowKeys.map((key) => {
      const material = materialMap.get(key)
      return {
        ...material,
        name: material?.inventory_item_id?._id,
        itemName: material?.inventory_item_id?.name
      }
    });
    form.setFieldValue("items", selectedMaterials)
    const items = {}
    selectedMaterials.forEach((material, index) => items[index] = material)
    setSelecteItems(items)

  }, [selectedRowKeys])


  const handleMarkCollectedWithInvoice = async () => {
    modal.confirm({
      title: 'Confirm Payment',
      icon: <ExclamationCircleOutlined />,
      content: 'Has the student paid this bill?',
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        const bill = await generateInvoice({ status: "paid" })
        await handleMarkCollected({ bill_id: bill._id })
        handleOk()
      },
      onCancel: async () => {
        const bill = await generateInvoice({ status: "unpaid" })
        await handleMarkCollected({ bill_id: bill._id })
        handleOk()
      }
    });
  }

  const generateInvoice = async ({ status = "unpaid" }) => {
    const invoiceData = await getInvoiceNo()
    const invoiceNo = invoiceData?.invoiceNo || 0;
    const center_initial = invoiceData?.center_initial || '';

    const materialMap = new Map(materials.map((m) => [m._id, m]));

    const items = selectedRowKeys.map((key, index) => {
      const material = materialMap.get(key);

      return {
        item: material.inventory_item_id?._id,
        item_type: "InventoryItem",
        qty: material.qty,
        taxAmnt: material.taxAmnt,
        subtotal: material.subtotal,
        total: material.total,
        taxes: material.taxes,
        rate: material.rate,
        discount: material.discount,
        discountType: material.discountType,
        name: material?.inventory_item_id?.name,
      }
    })

    const data = {
      subtotal: totals.subtotal,
      undiscountedTotal: totals.undiscountedTotal,
      total_tax: totals.total_tax,
      total: totals.total,
      total_discount: totals.total_discount,
      invoiceNo,
      center_initial,
      items,
      status: status,
      generated_on: new Date(),
      generated_for: student_id,
      subject: "Materials",
      payment_method: "cash",
      payment_date: new Date()
    }
    const bill = await createBill(data)
    return bill
  }

  const handleMarkCollected = async (updateData = {}) => {
    // Backend now automatically deducts inventory when marking as collected
    await editMaterials(selectedRowKeys, { status: "collected", collected_on: new Date(), ...updateData })
  }

  const itemsOptions = useMemo(() => items?.filter(item => (item.type === "default" || (item.quantity > 0 && item.type === "materials")))
    .map(item => ({ label: item.name, value: item._id })), [items])

  const handleSearch = async (value) => {
    const { items } = await inventoryService.getInventoryItems(
      0,
      0,
      { searchQuery: value, query: { type: "materials" } }
    )
    setItems(items)
  }

  return (
    <CustomForm form={form} action={handleMarkCollectedWithInvoice} >
      <ItemsInputTable
        form={form}
        items={items}
        itemsOptions={itemsOptions}
        name={"items"}
        selectedItem={selecteItems}
        setSelectedItem={setSelecteItems}
        setTotals={setTotals}
        disableAddItem
        disableDelete
        onSearch={handleSearch}
      />

      <CustomSubmit label='Save And Generate Invoice' loading={billLoading} />
      {contextHolder}
    </CustomForm>
  )
}

export default EditAllotedMaterials