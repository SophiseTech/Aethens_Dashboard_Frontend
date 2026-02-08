import inventoryStore from '@stores/InventoryStore';
import userStore from '@stores/UserStore';
import { PlusCircleFilled } from '@ant-design/icons';
import { Button, Checkbox, Flex, Input, Modal, Table } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

function AddToCenterModal() {
  const [open, setOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = userStore();
  const { items, getItems, addItemToCenter, loading, createLoading, inventory } = inventoryStore();

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

  const loadGlobalItems = useCallback(() => {
    getItems(200, { sort: '-createdAt' }, 1);
  }, [getItems]);

  useEffect(() => {
    if (open) {
      loadGlobalItems();
      setSelectedRowKeys([]);
      setSearchTerm('');
    }
  }, [open, loadGlobalItems]);

  const handleAddSelected = async () => {
    if (!selectedRowKeys.length) return;
    const toAdd = filteredItems.filter((item) => selectedRowKeys.includes(item._id));
    for (const item of toAdd) {
      await addItemToCenter({
        item_id: item._id,
        quantity: 0,
        rate: item.default_rate,
        tax: item.default_tax,
        discount: item.default_discount,
        type: item.type,
      });
    }
    setOpen(false);
    setSelectedRowKeys([]);
  };

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
        width={640}
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
          />
        </Flex>
      </Modal>
    </>
  );
}

export default AddToCenterModal;
