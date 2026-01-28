import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Flex, Input, Segmented, Table } from 'antd';
import EditInventoryItem from '@pages/Inventory/Components/EditInventoryItem';
import inventoryStore from '@stores/InventoryStore';
import { groupByField } from '@utils/helper';
import centersStore from '@stores/CentersStore';
import { useStore } from 'zustand';
import userStore from '@stores/UserStore';
import { ROLES } from '@utils/constants';

const { Search } = Input

function InventoryList() {
  const { loading, items, getItems, total, searhcItems, searchResults, searchQuery, setSearchQuery, searchTotal } = inventoryStore();
  const [selectedTab, setSelectedTab] = useState('materials');
  const [editItem, setEditItem] = useState({});
  const [searchTerm, setSearchTerm] = useState("")
  const { selectedCenter } = centersStore();
  const {user} = useStore(userStore);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'inventory_name',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'inventory_qty',
    },
    {
      title: 'Rate (₹)',
      dataIndex: 'rate',
      key: 'inventory_rate',
    },
    {
      title: 'Discount (₹)',
      dataIndex: 'discount',
      key: 'inventory_discount',
    },
    {
      title: 'Tax (%)',
      dataIndex: 'taxes',
      key: 'inventory_tax',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" onClick={() => setEditItem(record)}>
          Edit
        </Button>
      ),
    },
  ];

  const segmentOptions = [
    { label: 'Materials', value: 'materials' },
    { label: 'Gallery', value: 'gallery' },
    { label: 'Assets', value: 'assets' },
  ];

  const categorizedItems = useMemo(
    () => groupByField(items, 'type', { gallery: [], materials: [], assets: [] }),
    [items]
  );

  const selectedCategoryItems = useMemo(
    () => categorizedItems[selectedTab] || [],
    [categorizedItems, selectedTab]
  );

  useEffect(() => {
    setSearchQuery("")
    setSearchTerm("")
    if (!items.length || !categorizedItems[selectedTab]?.length || user.role === ROLES.ADMIN) {
      getItems(10, { sort: '-createdAt', query: { type: selectedTab } }, 1);
    }
  }, [selectedTab, selectedCenter]);

  const handlePageChange = (page, pageSize) => {
    if (searchQuery) {
      searhcItems(pageSize, { searchQuery: searchQuery }, page)
    } else {
      getItems(pageSize, { sort: '-createdAt', query: { type: selectedTab } }, page);
    }
  };

  const onSearch = (value, _e, info) => {
    if (value === "") {
      setSearchQuery(null)
      return
    }
    searhcItems(10, { searchQuery: value }, 1)
    // setSearchQuery(value)
  }

  const itemsToDisplay = useMemo(() => {
    return searchQuery ? searchResults : items;
  }, [items, searchResults, searchQuery]);

  return (
    <Flex vertical gap={20} align="start">
      <Segmented
        options={segmentOptions}
        onChange={setSelectedTab}
        defaultValue="materials"
      />
      <Search
        placeholder="Search..."
        onSearch={onSearch}
        defaultValue={searchQuery}
        className='w-1/4'
        onChange={(e) => setSearchTerm(e.target.value)}
        value={searchTerm}
      />
      <Table
        columns={columns}
        dataSource={itemsToDisplay}
        loading={loading}
        className="w-full"
        rowKey="_id"
        pagination={{
          pageSize: 10,
          onChange: handlePageChange,
          total: searchQuery ? searchTotal : total,
        }}
      />
      <EditInventoryItem editItem={editItem} setEditItem={setEditItem} />
    </Flex>
  );
}

export default InventoryList;
