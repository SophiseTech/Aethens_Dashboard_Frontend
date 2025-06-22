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
    // if (inventoryTotal === 0 || items.length < inventoryTotal) {
    //   getItems(0)
    // }
    if (lineItems.length === 0) {
      fetchItems(0, 10, { query: { type: "materials" } })
    }
  }, [])

  const fetchItems = async (page = 0, limit = 10, filters = {}) => {
    const { items } = await inventoryService.getInventoryItems(page, limit, filters)
    setLineItems(items)
  }

  useEffect(() => {
    const handleChange = async () => {
      if (fieldItems && fieldItems.length > 0) {
        fieldItems.forEach(async (item, index) => {
          if (Number(item.qty) > Number(selectedItems[index]?.quantity)) {
            form.setFields([{
              name: ["items", index, "qty"],
              errors: [`Quantity cannot exceed ${selectedItems[index].quantity}`],
              touched: true,
              validated: true,
            }])
          }
        })
      }
    }
    handleChange()
  }, [fieldItems])


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
    console.log(item, option);
    
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
    console.log(values);
    await createRequest(values)
  }

  const handleSearch = async (value) => {
    const { items } = await inventoryService.getInventoryItems(
      0,
      value === "" ? 10 : 0,
      { searchQuery: value, query: { type: "materials" } }
    )
    setLineItems(items)
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