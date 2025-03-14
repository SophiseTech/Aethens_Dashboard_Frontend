import React, { useMemo } from 'react';
import { Button, Flex, Table } from 'antd';
import Chip from '@components/Chips/Chip';
import { isMobile } from 'react-device-detect';
import { formatDate } from '@utils/helper';
import permissions from '@utils/permissions';
import { useNavigate } from 'react-router-dom';

function MaterialsTable({ materials, loading, currentPage, setCurrentPage, total, pageSize = 5 }) {
  const nav = useNavigate();

  // Format data for the table
  const tableData = useMemo(() => {
    return materials?.map((item, index) => ({
      key: index,
      name: item.inventory_item_id?.name || 'N/A',
      qty: item.qty,
      rate: item.rate,
      subtotal: item.subtotal,
      taxAmnt: item.taxAmnt,
      total: item.total,
      status: item.status,
      collected_on: item.collected_on,
      bill_id: item.bill_id,
    }));
  }, [materials]);

  const handleViewBill = (id) => {
    nav(`/bills/${id}`);
  };

  // Define table columns
  const columns = [
    {
      title: 'Item Name',
      dataIndex: 'name',
      key: 'name',
      render: (value) => <p className='font-bold'>{value}</p>,
    },
    {
      title: 'Quantity',
      dataIndex: 'qty',
      key: 'qty',
    },
    {
      title: 'Rate',
      dataIndex: 'rate',
      key: 'rate',
      render: (rate) => `₹${rate}`,
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: (subtotal) => `₹${subtotal}`,
    },
    {
      title: 'Tax Amount',
      dataIndex: 'taxAmnt',
      key: 'taxAmnt',
      render: (taxAmnt) => `₹${taxAmnt}`,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => `₹${total}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (itemStatus) => (
        <Chip
          size={isMobile ? 'xs' : 'small'}
          type={itemStatus === 'collected' ? 'success' : 'danger'}
          label={itemStatus.toUpperCase()}
        />
      ),
    },
    {
      title: 'Collected On',
      dataIndex: 'collected_on',
      key: 'collected_on',
      render: (date) => formatDate(date) || 'Not collected!',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      render: (_, record) =>
        record.bill_id ? (
          <Button variant='filled' color='blue' onClick={() => handleViewBill(record.bill_id)}>
            View Bill
          </Button>
        ) : (
          <Button variant='filled' color='blue' disabled={true}>
            No Bill
          </Button>
        ),
    },
  ];

  const handlePageChange = (page) => {
    setCurrentPage(page); // Update the current page in the parent component
  };

  return (
    <Table
      columns={columns}
      dataSource={tableData}
      pagination={{
        current: currentPage,
        onChange: handlePageChange,
        total: total,
        pageSize: pageSize,
      }}
      loading={loading}
    />
  );
}

export default MaterialsTable;