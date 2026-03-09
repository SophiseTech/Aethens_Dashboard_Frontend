import inventoryService from '@/services/Inventory';
import CustomForm from '@components/form/CustomForm';
import CustomInput from '@components/form/CustomInput';
import CustomSelect from '@components/form/CustomSelect';
import CustomSubmit from '@components/form/CustomSubmit';
import DynamicInpuTable from '@components/form/DynamicInpuTable';
import centersStore from '@stores/CentersStore';
import requestsStore from '@stores/RequestsStore';
import userStore from '@stores/UserStore';
import { ROLES } from '@utils/constants';
import { Form, Tag } from 'antd';
import React, { useEffect, useMemo, useState } from 'react'

function RequestForm() {

  const [form] = Form.useForm();
  const { getCenters, centers, total, selectedCenter } = centersStore()
  const { createLoading, createRequest } = requestsStore()
  const { user } = userStore()
  const fieldItems = Form.useWatch("items", form)

  // Per-row state
  const [rowTypes, setRowTypes] = useState({})           // { [index]: 'materials' | 'assets' }
  const [rowItems, setRowItems] = useState({})            // { [index]: { options: [], items: [] } }
  const [selectedItems, setSelectedItems] = useState({}) // { [index]: { centerQuantity, ... } }

  // Derive the correct "from" center based on role
  const isAdmin = user?.role === ROLES.ADMIN
  const isOpsManager = user?.role === ROLES.OPERATIONS_MANAGER
  const sourceCenterId = (isAdmin || isOpsManager) ? selectedCenter : user?.center_id

  const initialValues = {
    raised_to_center: "",
    request_details: "",
    items: [],
  };

  useEffect(() => {
    if (!centers || total === 0 || centers.length < total) {
      getCenters(0)
    }
  }, [user?.center_id])

  // Validate quantity against available stock whenever items change
  useEffect(() => {
    if (fieldItems && fieldItems.length > 0) {
      fieldItems.forEach((item, index) => {
        const selectedItem = selectedItems[index]
        if (selectedItem && Number(item.qty) > Number(selectedItem.centerQuantity)) {
          form.setFields([{
            name: ["items", index, "qty"],
            errors: [`Quantity cannot exceed ${selectedItem.centerQuantity} (available in inventory)`],
            touched: true,
            validated: true,
          }])
        }
      })
    }
  }, [fieldItems, selectedItems])

  // Fetch items for a specific row by type
  const fetchItemsByType = async (type, rowIndex) => {
    if (!sourceCenterId) return
    try {
      const response = await inventoryService.getCenterInventoryItems(
        sourceCenterId,
        0,
        200,
        { query: { type } }
      )
      if (response?.items) {
        const mappedItems = response.items.map(item => ({
          ...item.item_id,
          centerQuantity: item.quantity,
          centerRate: item.rate,
          centerTax: item.tax,
          centerDiscount: item.discount,
        }))
        const opts = mappedItems.map(item => ({ label: item.name, value: item._id }))
        setRowItems(prev => ({ ...prev, [rowIndex]: { options: opts, items: mappedItems } }))
      }
    } catch (error) {
      console.error('[RequestForm fetchItemsByType] Error:', error)
    }
  }

  // Search items within a row respecting that row's selected type
  const handleSearch = async (value, rowIndex) => {
    const type = rowTypes[rowIndex]
    if (!type || !sourceCenterId) return
    try {
      const response = await inventoryService.getCenterInventoryItems(
        sourceCenterId,
        0,
        value === "" ? 200 : 0,
        { searchQuery: value, query: { type } }
      )
      if (response?.items) {
        const mappedItems = response.items.map(item => ({
          ...item.item_id,
          centerQuantity: item.quantity,
        }))
        const opts = mappedItems.map(item => ({ label: item.name, value: item._id }))
        setRowItems(prev => ({
          ...prev,
          [rowIndex]: { options: opts, items: mappedItems },
        }))
      }
    } catch (error) {
      console.error('[RequestForm handleSearch] Error:', error)
    }
  }

  // Unified handler for all DynamicInpuTable cell changes (dispatches by dataIndex)
  const onRowChange = (value, index, option, dataIndex) => {
    if (dataIndex === 'type') {
      setRowTypes(prev => ({ ...prev, [index]: value }))
      // Clear item but keep qty
      const row = form.getFieldValue(['items', index])
      form.setFieldValue(['items', index], { ...row, item: '', itemName: '' })
      // Remove the available qty badge for this row
      setSelectedItems(prev => { const next = { ...prev }; delete next[index]; return next })
      fetchItemsByType(value, index)
    } else if (dataIndex === 'item') {
      const rowItemList = rowItems[index]?.items || []
      const item = rowItemList.find(i => i._id === value)
      if (item) {
        const row = form.getFieldValue(['items', index])
        form.setFieldValue(['items', index], { ...row, itemName: option?.label || '' })
        setSelectedItems(prev => ({ ...prev, [index]: item }))
      }
    }
  }

  // Exclude the source center from the destination dropdown
  const centersOptions = useMemo(() => centers
    ?.filter(center => center._id !== sourceCenterId)
    .map(center => ({ label: center.location, value: center.location })),
    [centers, sourceCenterId])

  const typeOptions = [
    { label: 'Materials', value: 'materials' },
    { label: 'Assets', value: 'assets' },
  ]

  const columns = [
    {
      title: "Type",
      dataIndex: "type",
      editable: true,
      type: "select",
      width: "20%",
      options: typeOptions,
    },
    {
      title: "Item",
      dataIndex: "item",
      editable: true,
      type: "autocomplete",
      width: "35%",
      render: (value, record) => record.itemName,
      // Dynamic per-row options based on selected type
      getOptions: (record, index) => rowItems[index]?.options || [],
      onSearch: (value, index) => handleSearch(value, index),
    },
    {
      title: "Available",
      dataIndex: "available",
      editable: false,
      width: "15%",
      render: (_, record, index) => {
        const selected = selectedItems[index]
        return selected
          ? <Tag color="blue">Qty: {selected.centerQuantity}</Tag>
          : '—'
      },
    },
    {
      title: "Quantity",
      dataIndex: "qty",
      editable: true,
      type: "number",
      width: "15%",
    },
  ]

  const handleSubmit = async (values) => {
    const center = centers.find(c => c.location === values.raised_to_center)
    values.raised_to_center = center._id
    values.raised_by_center = sourceCenterId
    values.raised_by_user = user._id
    values.status = "pending"
    await createRequest(values)
  }

  return (
    <CustomForm form={form} initialValues={initialValues} action={handleSubmit}>
      <CustomSelect name={"raised_to_center"} options={centersOptions} label={"Select the center to send the items"} />
      <CustomInput label={"Remarks"} name={"request_details"} placeholder={"Something about the request"} />
      <DynamicInpuTable form={form} name={"items"} columns={columns} onSelect={onRowChange} />
      <CustomSubmit className='bg-primary' label='Save' loading={createLoading} />
    </CustomForm>
  )
}

export default RequestForm