import React, { useMemo, useState } from 'react';
import { Button, Flex, Modal, Segmented, Table } from 'antd';
import inventoryStore from '@stores/InventoryStore';
import { groupByField } from '@utils/helper';
import CustomInput from '@components/form/CustomInput';
import CustomForm from '@components/form/CustomForm';
import CustomSubmit from '@components/form/CustomSubmit';
import { Form } from 'antd';

function CenterInventoryList() {
  const { inventory, updateCenterItem } = inventoryStore();
  const [selectedTab, setSelectedTab] = useState('materials');
  const [editEntry, setEditEntry] = useState(null);
  const [form] = Form.useForm();

  const items = inventory?.items || [];
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

  const categorizedItems = useMemo(
    () => groupByField(flattenedRows, 'type', { gallery: [], materials: [], assets: [] }),
    [flattenedRows]
  );

  const itemsToDisplay = useMemo(
    () => categorizedItems[selectedTab] || [],
    [categorizedItems, selectedTab]
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
      render: (_, record) => (
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
    setEditEntry(null);
    form.resetFields();
  };

  return (
    <Flex vertical gap={20} align="start">
      <Segmented
        options={segmentOptions}
        value={selectedTab}
        onChange={setSelectedTab}
      />
      <Table
        columns={columns}
        dataSource={itemsToDisplay}
        className="w-full"
        rowKey={(r) => r.item_id?._id || r._id}
        pagination={false}
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
