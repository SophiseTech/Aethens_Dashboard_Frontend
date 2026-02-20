import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Flex, Input, Segmented, Table } from 'antd';
import EditInventoryItem from '@pages/Inventory/Components/EditInventoryItem';
import inventoryStore from '@stores/InventoryStore';
import { groupByField } from '@utils/helper';
import centersStore from '@stores/CentersStore';
import userStore from '@stores/UserStore';
import { ROLES } from '@utils/constants';

const { Search } = Input

function InventoryList() {
  const loading = inventoryStore((state) => state.loading);
  const items = inventoryStore((state) => state.items);
  const getItems = inventoryStore((state) => state.getItems);
  const total = inventoryStore((state) => state.total);
  const searchItems = inventoryStore((state) => state.searchItems);
  const searchResults = inventoryStore((state) => state.searchResults);
  const searchQuery = inventoryStore((state) => state.searchQuery);
  const setSearchQuery = inventoryStore((state) => state.setSearchQuery);
  const searchTotal = inventoryStore((state) => state.searchTotal);
  const [selectedTab, setSelectedTab] = useState('materials');
  const [editItem, setEditItem] = useState({});
  const [searchTerm, setSearchTerm] = useState("")
  const selectedCenter = centersStore((state) => state.selectedCenter);
  const user = userStore((state) => state.user);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'inventory_name',
    },
    {
      title: 'Default Rate (₹)',
      dataIndex: 'default_rate',
      key: 'inventory_rate',
    },
    {
      title: 'Default Discount (₹)',
      dataIndex: 'default_discount',
      key: 'inventory_discount',
    },
    {
      title: 'Default Tax (%)',
      dataIndex: 'default_tax',
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
  }, [selectedTab]);

  useEffect(() => {
    // Fetch items when tab or center changes
    getItems(10, { sort: '-createdAt', query: { type: selectedTab } }, 1);
  }, [selectedTab, selectedCenter]);

  const handlePageChange = (page, pageSize) => {
    if (searchQuery) {
      searchItems(pageSize, { searchQuery: searchQuery }, page)
    } else {
      getItems(pageSize, { sort: '-createdAt', query: { type: selectedTab } }, page);
    }
  };

  const onSearch = (value, _e, info) => {
    if (value === "") {
      setSearchQuery(null)
      return
    }
    searchItems(10, { searchQuery: value }, 1)
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
