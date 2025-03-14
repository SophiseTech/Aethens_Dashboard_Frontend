import Chip from '@components/Chips/Chip';
import EditAllotedMaterialsModal from '@pages/ManagerMaterials/Components/EditAllotedMaterialsModal';
import inventoryStore from '@stores/InventoryStore';
import materialStore from '@stores/MaterialsStore';
import userStore from '@stores/UserStore';
import permissions from '@utils/permissions';
import { Button, Flex, Modal, Table } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from 'zustand';

function MaterialsList({ currentPage, setCurrentPage, total, pageSize = 10 }) {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const { editMaterials, loading, materials } = materialStore();
  const { editItem } = useStore(inventoryStore);
  const nav = useNavigate();
  const { user } = useStore(userStore);
  const [searchParams] = useSearchParams();
  const student_id = searchParams.get("student_id");
  const [modal, contextHolder] = Modal.useModal();

  const onSelectChange = (newSelectedRowKeys) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const hasSelected = selectedRowKeys.length > 0;

  const handleMarkCollected = async () => {
    await editMaterials(selectedRowKeys, { status: "collected", collected_on: new Date() });

    const materialMap = new Map(materials.map((m) => [m._id, m]));

    selectedRowKeys.forEach((key) => {
      const material = materialMap.get(key);
      if (material && material.status === "pending") {
        editItem(material.inventory_item_id?._id || material.inventory_item_id, { $inc: { quantity: -(material.qty) } });
      }
    });

    setSelectedRowKeys([]);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: ["inventory_item_id", "name"],
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      render: (value) => value ? (dayjs(value).format("D MMM, YYYY")) : "",
    },
    {
      title: 'Quantity',
      dataIndex: 'qty',
    },
    {
      title: 'Student',
      dataIndex: ["student_id", "username"],
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (value) => <Chip type={value === "pending" ? "danger" : "success"} label={value?.toUpperCase()} glow={false} />,
    },
    {
      title: 'Collected On',
      dataIndex: 'collected_on',
      render: (value) => value ? (dayjs(value).format("D MMM, YYYY h:mm A")) : "NA",
    },
    {
      title: 'Action',
      dataIndex: 'action',
      render: (_, record) => (
        <Flex>
          {permissions.materials.view_bill.includes(user.role) &&
            (record.bill_id ?
              <Button variant='filled' color='blue' onClick={() => { handleViewBill(record.bill_id) }}>View Bill</Button>
              :
              <Button variant='filled' color='blue' disabled={true}>No Bill</Button>
            )
          }
        </Flex>
      ),
    },
  ];

  const dataSource = useMemo(() => materials?.map((material, index) => ({ ...material, key: material._id })), [materials]);

  const handleViewBill = (id) => {
    nav(`/manager/bills/${id}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page); // Update the current page in the parent component
  };

  return (
    <>
      <Flex align="center" gap="middle">
        {permissions.materials.mark_collected.includes(user.role) &&
          <Flex gap={10}>
            <Button variant='filled' color='blue' disabled={!hasSelected} onClick={handleMarkCollected} loading={loading}>
              Mark Collected
            </Button>
            <EditAllotedMaterialsModal student_id={student_id} hasSelected={hasSelected} materials={materials} selectedRowKeys={selectedRowKeys} />
          </Flex>
        }
        {hasSelected ? `Selected ${selectedRowKeys.length} items` : null}
      </Flex>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={{
          current: currentPage,
          onChange: handlePageChange,
          total: total,
          pageSize: pageSize,
        }}
        scroll={{
          x: 'max-content',
        }}
      />
      {contextHolder}
    </>
  );
}

export default MaterialsList;