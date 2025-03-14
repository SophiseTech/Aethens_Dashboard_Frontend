import AddInventoryItem from '@pages/Inventory/Components/AddInventoryItem'
import EditInventoryItem from '@pages/Inventory/Components/EditInventoryItem'
import inventoryStore from '@stores/InventoryStore'
import { groupByField } from '@utils/helper'
import { Button, Flex, Segmented, Table } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'

function InventoryList() {

  const { loading, items, inventory } = inventoryStore()
  const [selectedCategoryItems, setSelectedCategoryItems] = useState([])
  const [selectedTab, setSelectedTab] = useState("materials")
  const [editItem, setEditItem] = useState({})

  const handleEdit = (record) => {
    if (record) {
      setEditItem(record)
    }
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: "name",
      key: "inventory_name",
    },
    {
      title: 'Quantity',
      dataIndex: "quantity",
      key: "inventory_qty",
    },
    {
      title: 'Rate (₹)',
      dataIndex: "rate",
      key: "inventory_rate",
    },
    {
      title: 'Discount (₹)',
      dataIndex: "discount",
      key: "inventory_discount",
    },
    {
      title: 'Tax (%)',
      dataIndex: "taxes",
      key: "inventory_tax",
    },
    {
      title: 'Action',
      dataIndex: "action",
      key: "action",
      render: (_, record) => (
        <Flex>
          <Button variant='filled' color='blue' onClick={() => { handleEdit(record) }}>
            Edit
          </Button>
        </Flex>
      )
    },
  ]

  const segmentOptions = [
    {
      label: "Materials",
      value: "materials",
      key: "materials"
    },
    {
      label: "Gallery",
      value: "gallery",
      key: "gallery"
    },
    {
      label: "Assets",
      value: "assets",
      key: "assets"
    },
  ]

  const categorizedItems = useMemo(() => groupByField(items, "type", { gallery: [], materials: [], assets: [] }), [items])

  const handleSegmentedChange = (value) => {
    setSelectedTab(value)
  }

  useEffect(() => {
    if (categorizedItems && categorizedItems[selectedTab]) {
      setSelectedCategoryItems(categorizedItems[selectedTab])
    }
  }, [categorizedItems, selectedTab])

  return (
    <Flex vertical gap={20} align='start'>
      <Segmented options={segmentOptions} onChange={handleSegmentedChange} defaultValue={"materials"} />
      <Table columns={columns} dataSource={selectedCategoryItems} loading={loading} className='w-full' />
      <EditInventoryItem editItem={editItem} setEditItem={setEditItem} />
    </Flex>
  )
}

export default InventoryList