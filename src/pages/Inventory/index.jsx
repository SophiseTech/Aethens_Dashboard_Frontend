import Title from '@components/layouts/Title';
import AddToCenterModal from '@pages/Inventory/Components/AddToCenterModal';
import CenterInventoryList from '@pages/Inventory/Components/CenterInventoryList';
import RaiseRequest from '@pages/Inventory/Components/RaiseRequest';
import RequestList from '@pages/Inventory/Components/RequestList';
import centersStore from '@stores/CentersStore';
import inventoryStore from '@stores/InventoryStore';
import requestsStore from '@stores/RequestsStore';
import userStore from '@stores/UserStore';
import { ROLES } from '@utils/constants';
import { Button, Drawer, Flex, Skeleton, Table } from 'antd';
import React, { useEffect, useState } from 'react';

function Inventory() {
  const { getCenterInventory, clearCenterInventory, inventory, loading } = inventoryStore();
  const { user } = userStore();
  const { selectedCenter } = centersStore();
  const [drawerState, setDrawerState] = useState(false);
  const { requests, getRequests, approveRequest, rejectRequest, loading: requestsLoading } = requestsStore();

  const isAdmin = user?.role === ROLES.ADMIN;
  const centerId = isAdmin ? selectedCenter : user?.center_id;

  useEffect(() => {
    if (centerId && centerId !== 'all') {
      getCenterInventory(centerId);
    } else if (isAdmin && centerId === 'all') {
      clearCenterInventory();
    }
  }, [centerId, isAdmin]);

  const loadRequests = () => {
    if (!requests || requests.length <= 0) {
      getRequests(10, {
        query: { raised_to_center: user.center_id, status: "pending" },
        sort: { createdAt: -1 },
        populate: "items.item raised_by_center raised_by_user"
      })
    }
  }

  const handleApprove = async (id) => {
    await approveRequest(id)
  }

  const handleReject = async (id) => {
    await rejectRequest(id)
  }

  const columns = [
    {
      title: "Name",
      dataIndex: ["item", "name"]
    },
    {
      title: "Quantity",
      dataIndex: "qty"
    }
  ]

  const headerButtons = (
    <Flex gap={20}>
      <RaiseRequest />
      <Button variant="filled" color="orange" onClick={() => setDrawerState(true)}>
        Requests
      </Button>
      {!isAdmin && <AddToCenterModal />}
    </Flex>
  );

  return (
    <Title title="Inventory" button={headerButtons}>
      {!centerId || centerId === 'all' ? (
        <div className="text-gray-500">Select a center to view inventory.</div>
      ) : (
        <Skeleton loading={loading} active>
          <CenterInventoryList />
        </Skeleton>
      )}
      <Drawer
        title="Requests"
        placement='right'
        closable
        onClose={() => { setDrawerState(false) }}
        open={drawerState}
        key={"right"}
      >
        <RequestList
          items={requests}
          loadData={loadRequests}
          approveAction={handleApprove}
          rejectAction={handleReject}
          fromField={"location"}
          render={(item) => <Table columns={columns} dataSource={item?.items || []} pagination={false} className='mt-5' />}
          loading={requestsLoading}
        />
      </Drawer>
    </Title>
  )
}

const Loader = () => (
  <Skeleton />
)

export default Inventory