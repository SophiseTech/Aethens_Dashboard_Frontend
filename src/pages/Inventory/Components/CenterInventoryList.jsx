import React, { useEffect, useMemo, useState } from 'react';
import { Button, Flex, Input, Modal, Segmented, Table } from 'antd';
import inventoryStore from '@stores/InventoryStore';
import { groupByField } from '@utils/helper';
import CustomInput from '@components/form/CustomInput';
import CustomForm from '@components/form/CustomForm';
import CustomSubmit from '@components/form/CustomSubmit';
import { Form } from 'antd';
import centersStore from '@stores/CentersStore';
import userStore from '@stores/UserStore';
import { ROLES } from '@utils/constants';

const { Search } = Input;

function CenterInventoryList() {
  const { inventory, inventoryTotal, getCenterInventory, updateCenterItem, loading } = inventoryStore();
  const { selectedCenter } = centersStore();
  const { user } = userStore();
  const [selectedTab, setSelectedTab] = useState('materials');
  const [editEntry, setEditEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [form] = Form.useForm();

  const isAdmin = user?.role === ROLES.ADMIN;
  const isOpsManager = user?.role === ROLES.OPERATIONS_MANAGER;
  const centerId = isAdmin || isOpsManager ? selectedCenter : user?.center_id;

  // Reset search and page when tab changes
  useEffect(() => {
    setSearchTerm('');
    setCurrentPage(1);
  }, [selectedTab]);

  // Fetch inventory when dependencies change
  useEffect(() => {
    // Only fetch if we have a valid centerId
    if (!centerId || centerId === 'all') {
      return;
    }

    getCenterInventory(centerId, searchTerm, selectedTab, pageSize, currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerId, selectedTab, searchTerm, currentPage, pageSize]);

  const items = Array.isArray(inventory) ? inventory : [];
  const flattenedRows = useMemo(
    () =>
      items.map((entry) => ({
        ...entry,
        name: entry.item_id?.name,
        _id: entry.item_id?._id,
        key: entry.item_id?._id,
      })),
    [items]
  );

  const segmentOptions = [
    { label: 'Materials', value: 'materials' },
    { label: 'Gallery', value: 'gallery' },
    { label: 'Assets', value: 'assets' },
  ];

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Rate (₹)', dataIndex: 'rate', key: 'rate' },
    { title: 'Discount (₹)', dataIndex: 'discount', key: 'discount' },
    { title: 'Tax (%)', dataIndex: 'tax', key: 'tax' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (!isOpsManager &&
        <Button type="primary" onClick={() => setEditEntry(record)}>
          Edit
        </Button>
      ),
    },
  ];

  const handleEditSubmit = async (values) => {
    if (!editEntry?.item_id?._id) return;
    await updateCenterItem(editEntry.item_id._id, {
      quantity: values.quantity,
      rate: values.rate,
      tax: values.tax,
      discount: values.discount,
    });
    // Refresh the current page after update
    getCenterInventory(centerId, searchTerm, selectedTab, pageSize, currentPage);
    setEditEntry(null);
    form.resetFields();
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Flex vertical gap={20} align="start">
      <Segmented
        options={segmentOptions}
        value={selectedTab}
        onChange={setSelectedTab}
      />
      <Search
        placeholder="Search items by name..."
        onSearch={handleSearch}
        className='w-1/4'
        allowClear
      />
      <Table
        columns={columns}
        dataSource={flattenedRows}
        loading={loading}
        className="w-full"
        rowKey={(r) => r.item_id?._id || r._id}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: inventoryTotal,
          onChange: handlePageChange,
          showSizeChanger: false,
        }}
      />
      <Modal
        title="Edit center inventory item"
        open={!!editEntry}
        footer={null}
        onCancel={() => {
          setEditEntry(null);
          form.resetFields();
        }}
      >
        {editEntry && (
          <CustomForm
            form={form}
            initialValues={{
              quantity: editEntry.quantity,
              rate: editEntry.rate,
              tax: editEntry.tax,
              discount: editEntry.discount,
            }}
            action={handleEditSubmit}
          >
            <CustomInput label="Quantity" name="quantity" type="number" />
            <CustomInput label="Rate (₹)" name="rate" type="number" />
            <CustomInput label="Discount (₹)" name="discount" type="number" />
            <CustomInput label="Tax (%)" name="tax" type="number" />
            <CustomSubmit className="bg-primary" label="Save" />
          </CustomForm>
        )}
      </Modal>
    </Flex>
  );
}

export default CenterInventoryList;
