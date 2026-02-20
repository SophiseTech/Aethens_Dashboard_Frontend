import React, { useEffect, useMemo, useState } from 'react';
import { Button, Flex, Input, Modal, Segmented, Table } from 'antd';
import EditInventoryItem from '@pages/Inventory/Components/EditInventoryItem';
import inventoryStore from '@stores/InventoryStore';
import { groupByField } from '@utils/helper';

const { Search } = Input;

function InventoryItemsList() {
  const loading = inventoryStore((state) => state.loading);
  const items = inventoryStore((state) => state.items);
  const getItems = inventoryStore((state) => state.getItems);
  const total = inventoryStore((state) => state.total);
  const searchItems = inventoryStore((state) => state.searchItems);
  const searchResults = inventoryStore((state) => state.searchResults);
  const searchQuery = inventoryStore((state) => state.searchQuery);
  const setSearchQuery = inventoryStore((state) => state.setSearchQuery);
  const searchTotal = inventoryStore((state) => state.searchTotal);
  const deleteItem = inventoryStore((state) => state.deleteItem);
  const [selectedTab, setSelectedTab] = useState('materials');
  const [editItem, setEditItem] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Default Rate (₹)',
      dataIndex: 'default_rate',
      key: 'default_rate',
    },
    {
      title: 'Default Discount (₹)',
      dataIndex: 'default_discount',
      key: 'default_discount',
    },
    {
      title: 'Default Tax (%)',
      dataIndex: 'default_tax',
      key: 'default_tax',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Flex gap={8}>
          <Button type="primary" onClick={() => setEditItem({ ...record, rate: record.default_rate, discount: record.default_discount, taxes: record.default_tax })}>
            Edit
          </Button>
          <Button
            type="primary"
            danger
            onClick={() => {
              Modal.confirm({
                title: 'Delete inventory item',
                content: `Are you sure you want to delete "${record.name}"?`,
                okText: 'Delete',
                okType: 'danger',
                onOk: async () => {
                  await deleteItem(record._id);
                },
              });
            }}
          >
            Delete
          </Button>
        </Flex>
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

  useEffect(() => {
    setSearchQuery('');
    setSearchTerm('');
    getItems(10, { sort: '-createdAt', query: { type: selectedTab } }, 1);
  }, [selectedTab]);

  const handlePageChange = (page, pageSize) => {
    if (searchQuery) {
      searchItems(pageSize, { searchQuery }, page);
    } else {
      getItems(pageSize, { sort: '-createdAt', query: { type: selectedTab } }, page);
    }
  };

  const onSearch = (value) => {
    if (value === '') {
      setSearchQuery(null);
      return;
    }
    searchItems(10, { searchQuery: value }, 1);
  };

  const itemsToDisplay = useMemo(() => {
    return searchQuery ? searchResults : items;
  }, [items, searchResults, searchQuery]);

  return (
    <Flex vertical gap={20} align="start">
      <Segmented
        options={segmentOptions}
        value={selectedTab}
        onChange={setSelectedTab}
      />
      <Search
        placeholder="Search..."
        onSearch={onSearch}
        className="w-1/4"
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

export default InventoryItemsList;
