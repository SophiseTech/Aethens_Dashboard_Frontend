import inventoryService from '@/services/Inventory';
import CustomForm from '@components/form/CustomForm';
import CustomInput from '@components/form/CustomInput';
import CustomSelect from '@components/form/CustomSelect';
import CustomSubmit from '@components/form/CustomSubmit';
import DynamicInpuTable from '@components/form/DynamicInpuTable';
import centersStore from '@stores/CentersStore';
import inventoryStore from '@stores/InventoryStore';
import requestsStore from '@stores/RequestsStore';
import userStore from '@stores/UserStore';
import { Form } from 'antd';
import React, { useEffect, useMemo, useState } from 'react'

function RequestForm() {

  const [form] = Form.useForm();
  // const { inventory, createLoading, loading } = inventoryStore()
  const { getCenters, centers, total } = centersStore()
  const { getItems, items, loading: itemsLoading, total: inventoryTotal } = inventoryStore()
  const [selectedItems, setSelectedItems] = useState({})
  const { createLoading, loading, createRequest } = requestsStore()
  const { user } = userStore()
  const fieldItems = Form.useWatch("items", form)
  const [lineItems, setLineItems] = useState([])

  const initialValues = {
    raised_to_center: "",
    request_details: "",
    items: [],
  };

  useEffect(() => {
    if (!centers || total === 0 || centers.length < total) {
      getCenters(0)
    }

    // Fetch current center's inventory items (items they have available to send)
    if (lineItems.length === 0 && user?.center_id) {
      fetchItems(0, 200, { query: { type: "materials" } })
    }
  }, [user?.center_id])

  const fetchItems = async (page = 0, limit = 200, filters = {}) => {
    try {
      // Fetch items from the CURRENT center's inventory (what they have to send)
      const response = await inventoryService.getCenterInventoryItems(
        user.center_id,
        page,
        limit,
        filters
      )
      if (response?.items) {
        // Map the center inventory items to include quantity info
        const mappedItems = response.items.map(item => ({
          ...item.item_id, // Spread the populated item details
          centerQuantity: item.quantity, // Store center's available quantity
          centerRate: item.rate,
          centerTax: item.tax,
          centerDiscount: item.discount
        }))
        setLineItems(mappedItems)
      }
    } catch (error) {
      console.error('[RequestForm fetchItems] Error:', error);
    }
  }

  useEffect(() => {
    const handleChange = async () => {
      if (fieldItems && fieldItems.length > 0) {
        fieldItems.forEach(async (item, index) => {
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
    }
    handleChange()
  }, [fieldItems, selectedItems])


  const centersOptions = useMemo(() => centers
    ?.filter(center => center._id !== user.center_id)
    .map(center => ({ label: center.location, value: center.location })),
    [centers])
  const itemsOptions = useMemo(() => lineItems?.map(item => ({ label: item.name, value: item._id })), [lineItems])

  const columns = [
    {
      title: "Item",
      dataIndex: "item",
      editable: true,
      type: "autocomplete",
      width: "40%",
      render: (value, record) => record.itemName,
      onSearch: (value) => { handleSearch(value) },
    },
    {
      title: "Quantity",
      dataIndex: "qty",
      editable: true,
      type: "number"
    }
  ]

  // Called wehn an item is selected in the items dropdown
  const onItemsChange = (value, index, option) => {
    const item = lineItems?.find(item => item._id === value)

    if (item) {
      const row = form.getFieldValue(["items", index])
      form.setFieldValue(["items", index], {
        ...row,
        itemName: option.label,
      })
      setSelectedItems({
        ...selectedItems,
        [index]: item
      })
    }
  }

  const handleSubmit = async (values) => {
    const center = centers.find(center => center.location === values.raised_to_center)
    values.raised_to_center = center._id
    // values?.items?.forEach((item, index) => item.item = selectedItems[index]?._id)
    values.raised_by_center = user.center_id
    values.raised_by_user = user._id
    values.status = "pending"
    await createRequest(values)
  }

  const handleSearch = async (value) => {
    // Search within the current center's inventory
    const response = await inventoryService.getCenterInventoryItems(
      user.center_id,
      0,
      value === "" ? 200 : 0,
      { searchQuery: value, query: { type: "materials" } }
    )
    if (response?.items) {
      const mappedItems = response.items.map(item => ({
        ...item.item_id,
        centerQuantity: item.quantity,
        centerRate: item.rate,
        centerTax: item.tax,
        centerDiscount: item.discount
      }))
      setLineItems(mappedItems)
    }
  }

  return (
    <CustomForm form={form} initialValues={initialValues} action={handleSubmit}>
      <CustomSelect name={"raised_to_center"} options={centersOptions} label={"Select the center to send the items"} />
      <CustomInput label={"Remarks"} name={"request_details"} placeholder={"Something about the request"} />
      <DynamicInpuTable form={form} name={"items"} columns={columns} onSelect={onItemsChange} options={itemsOptions} onS />
      <CustomSubmit className='bg-primary' label='Save' loading={createLoading} />
    </CustomForm>
  )
}

export default RequestForm