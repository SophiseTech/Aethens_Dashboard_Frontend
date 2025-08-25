import DynamicInpuTable from '@components/form/DynamicInpuTable'
import { getDiscount, getDiscountRate, sumFromObjects } from '@utils/helper'
import { Form, Select } from 'antd'
import { sum } from 'lodash';
import React, { useEffect, useState } from 'react'
const { Option } = Select;

function ItemsInputTable({ form, name, items, itemsOptions, selectedItem, setSelectedItem, setTotals, disableAddItem = false, disableDelete = false, itemType, onSearch }) {

  const itemsFields = Form.useWatch(name, form)
  const [discountType, setDiscountType] = useState({ 0: "percentage" })

  const itemsColumns = [
    {
      title: 'Name',
      dataIndex: ['name'],
      width: '30%',
      editable: true,
      type: "autocomplete",
      render: (value, record) => record.itemName,
      onSearch: (value) => { onSearch(value, itemType) },
      itemType: itemType
    },
    {
      title: 'Quantity',
      dataIndex: 'qty',
      editable: true,
      defaultValue: 1,
      width: '10%',
    },
    {
      title: 'U.Price',
      dataIndex: 'rate',
      editable: true,
      width: '10%',

    },
    {
      title: 'Discount',
      dataIndex: 'discount',
      editable: true,
      type: "percentage",
      width: '10%',

      selectAfter: (index) => {
        return <Select
          defaultValue={"percentage"}
          onChange={(value) => {
            setDiscountType({ ...discountType, [index]: value })
          }
          }
          value={discountType[index]}
        >
          <Option value="percentage">%</Option>
          <Option value="amount">₹</Option>
        </Select>
      },
      render: (value, _, index) => (discountType[index] === "percentage" || !discountType[index]) ? `${value} %` : `₹ ${value}`
    },
    {
      title: 'Sub Total',
      dataIndex: 'subtotal',
      editable: false,
      width: '10%',

      render: (value) => value ? value.toFixed(2) : 0
    },
    {
      title: 'Tax',
      dataIndex: 'taxes',
      editable: true,
      width: '5%',

    },
    {
      title: 'Tax Amnt',
      dataIndex: 'taxAmnt',
      editable: false,
      width: '5%',

      render: (value) => value ? value.toFixed(2) : 0
    },
    {
      title: 'Total',
      dataIndex: 'total',
      editable: false,
      width: '10%',

      render: (value) => value ? value.toFixed(2) : 0
    },
  ]

  // Called wehn an item is selected in the items dropdown
  const onItemsChange = (value, index, option) => {
    console.log(value, option);
    
    const item = items?.find(item => item._id === value)
    if (item) {
      // Update the dependend field with selected item values
      const row = form.getFieldValue(["items", index])
      form.setFieldValue(["items", index], {
        ...row,
        itemName: option.label,
        rate: item.rate,
        taxes: item.taxes,
        discount: item.discount
      })
      setSelectedItem({
        ...selectedItem,
        [index]: item
      })
    }
  }



  // Called when any field in the items change so taht all other dependend values are recalculated
  useEffect(() => {

    const updatedFields = itemsFields?.map((field, index) => {
      if (selectedItem[index] && field.qty) {
        const updateObj = {
          ...field,
          discountType: discountType[index],
          undiscountedTotal: Number((Number(field.rate) * Number(field.qty)).toFixed(2)),
          subtotal: (getDiscount(field.discount, field.rate, discountType[index])) * Number(field.qty),
          taxAmnt: Number((Number(field.subtotal) * (Number(field.taxes) / 100)).toFixed(2)),
          total: Number(field.subtotal) + Number(field.taxAmnt)
        }
        return updateObj
      } else {
        return field
      }
    }) || []

    setTotals({
      undiscountedTotal: sumFromObjects(updatedFields, "undiscountedTotal"),
      subtotal: sumFromObjects(updatedFields, "subtotal"),
      total_tax: sumFromObjects(updatedFields, "taxAmnt"),
      total: Math.round(sumFromObjects(updatedFields, "total")),
      total_discount: sum(updatedFields.map((field, index) => Number((getDiscountRate(field.discount, field.rate, discountType[index]) * Number(field.qty)).toFixed(2))))
    })
    form.setFieldValue("items", updatedFields.filter(field => field.name !== undefined))
  }, [itemsFields, discountType])

  return (
    <DynamicInpuTable form={form} name={name} columns={itemsColumns} options={itemsOptions} onSelect={onItemsChange} disableAddItem={disableAddItem} disableDelete={disableDelete} />

  )
}

export default ItemsInputTable