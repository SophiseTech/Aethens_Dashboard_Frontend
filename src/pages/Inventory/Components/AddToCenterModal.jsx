import inventoryStore from '@stores/InventoryStore';
import userStore from '@stores/UserStore';
import { PlusCircleFilled } from '@ant-design/icons';
import { Button, Flex, Input, InputNumber, Modal, Table } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

function AddToCenterModal() {
  const [open, setOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemOverrides, setItemOverrides] = useState({});

  // Use individual selectors to prevent re-render loops
  const items = inventoryStore((state) => state.items);
  const getItems = inventoryStore((state) => state.getItems);
  const addItemToCenter = inventoryStore((state) => state.addItemToCenter);
  const loading = inventoryStore((state) => state.loading);
  const createLoading = inventoryStore((state) => state.createLoading);
  const inventory = inventoryStore((state) => state.inventory);

  const existingItemIds = useMemo(
    () => new Set((inventory?.items || []).map((i) => (i.item_id?._id || i.item_id)?.toString())),
    [inventory?.items]
  );

  const availableItems = useMemo(
    () => items.filter((item) => !existingItemIds.has(item._id?.toString())),
    [items, existingItemIds]
  );

  const filteredItems = useMemo(() => {
    if (!searchTerm?.trim()) return availableItems;
    const term = searchTerm.toLowerCase();
    return availableItems.filter(
      (item) =>
        item.name?.toLowerCase().includes(term) ||
        (item.type && item.type.toLowerCase().includes(term))
    );
  }, [availableItems, searchTerm]);

  useEffect(() => {
    if (open) {
      console.log('[AddToCenterModal] Modal opened, fetching items...');
      getItems(200, { sort: '-createdAt' }, 1);
      setSelectedRowKeys([]);
      setSearchTerm('');
      setItemOverrides({});
    }
  }, [open, getItems]);



  // Get the value for an item field (use override if exists, otherwise default)
  const getItemValue = (itemId, field, defaultValue) => {
    return itemOverrides[itemId]?.[field] ?? defaultValue;
  };

  // Update a value for an item
  const updateItemValue = (itemId, field, value) => {
    setItemOverrides((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }));
  };

  const handleAddSelected = async () => {
    if (!selectedRowKeys.length) return;
    const toAdd = filteredItems.filter((item) => selectedRowKeys.includes(item._id));
    for (const item of toAdd) {
      await addItemToCenter({
        item_id: item._id,
        quantity: getItemValue(item._id, 'quantity', 0),
        rate: getItemValue(item._id, 'rate', item.default_rate || 0),
        tax: getItemValue(item._id, 'tax', item.default_tax || 0),
        discount: getItemValue(item._id, 'discount', item.default_discount || 0),
        type: item.type,
      });
    }
    setOpen(false);
    setSelectedRowKeys([]);
    setItemOverrides({});
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 80,
    },
    {
      title: 'Quantity',
      key: 'quantity',
      width: 100,
      render: (_, record) => (
        <InputNumber
          min={0}
          value={getItemValue(record._id, 'quantity', 0)}
          onChange={(value) => updateItemValue(record._id, 'quantity', value)}
          disabled={!selectedRowKeys.includes(record._id)}
          size="small"
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Rate (₹)',
      key: 'rate',
      width: 100,
      render: (_, record) => (
        <InputNumber
          min={0}
          value={getItemValue(record._id, 'rate', record.default_rate || 0)}
          onChange={(value) => updateItemValue(record._id, 'rate', value)}
          disabled={!selectedRowKeys.includes(record._id)}
          size="small"
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Discount (₹)',
      key: 'discount',
      width: 100,
      render: (_, record) => (
        <InputNumber
          min={0}
          value={getItemValue(record._id, 'discount', record.default_discount || 0)}
          onChange={(value) => updateItemValue(record._id, 'discount', value)}
          disabled={!selectedRowKeys.includes(record._id)}
          size="small"
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Tax (%)',
      key: 'tax',
      width: 80,
      render: (_, record) => (
        <InputNumber
          min={0}
          max={100}
          value={getItemValue(record._id, 'tax', record.default_tax || 0)}
          onChange={(value) => updateItemValue(record._id, 'tax', value)}
          disabled={!selectedRowKeys.includes(record._id)}
          size="small"
          style={{ width: '100%' }}
        />
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return (
    <>
      <PlusCircleFilled
        className="text-3xl text-primary"
        onClick={() => setOpen(true)}
        style={{ cursor: 'pointer' }}
      />
      <Modal
        title="Add items to center inventory"
        open={open}
        onCancel={() => setOpen(false)}
        footer={
          <Flex justify="space-between">
            <span>
              {selectedRowKeys.length > 0 && `${selectedRowKeys.length} selected`}
            </span>
            <Flex gap={8}>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                onClick={handleAddSelected}
                disabled={selectedRowKeys.length === 0 || createLoading}
                loading={createLoading}
              >
                Add selected
              </Button>
            </Flex>
          </Flex>
        }
        width={800}
      >
        <Flex vertical gap={12}>
          <Input.Search
            placeholder="Search by name or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={filteredItems}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            size="small"
            scroll={{ x: 700 }}
          />
        </Flex>
      </Modal>
    </>
  );
}

export default AddToCenterModal;
