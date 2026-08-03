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
import { Button, Drawer, Flex, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import permissions from '@utils/permissions';

function Inventory() {
  const { getCenterInventory, clearCenterInventory, inventory } = inventoryStore();
  const { user } = userStore();
  const { selectedCenter } = centersStore();
  const [drawerState, setDrawerState] = useState(false);
  const { requests, getRequests, approveRequest, rejectRequest, loading: requestsLoading } = requestsStore();

  const isAdmin = user?.role === ROLES.ADMIN;
  const isOpsManager = user?.role === ROLES.OPERATIONS_MANAGER;
  const isPurchaseManager = user?.role === ROLES.PURCHASE_MANAGER;
  // Purchase managers default to their own (central store) inventory, but can
  // browse other centers via the center selector like admin/ops managers do.
  const centerId = isAdmin || isOpsManager
    ? selectedCenter
    : (isPurchaseManager && selectedCenter && selectedCenter !== 'all') ? selectedCenter : user?.center_id;
  const isViewingOwnCenter = !isPurchaseManager || centerId === user?.center_id;

  useEffect(() => {
    // Clear inventory when "all" is selected or center changes to invalid value
    if ((isAdmin || isOpsManager) && centerId === 'all') {
      clearCenterInventory();
    }
    // Note: CenterInventoryList component handles its own data fetching with search/pagination
  }, [centerId, isAdmin, isOpsManager]);

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
      {!isOpsManager && <RaiseRequest />}
      {permissions.inventory.request.includes(user?.role) && <Button variant="filled" color="orange" onClick={() => setDrawerState(true)}>
        Requests
      </Button>}
      {!isAdmin && !isOpsManager && isViewingOwnCenter && <AddToCenterModal />}
    </Flex>
  );

  return (
    <Title title="Inventory" button={headerButtons}>
      {!centerId || centerId === 'all' ? (
        <div className="text-gray-500">Select a center to view inventory.</div>
      ) : (
        <CenterInventoryList />
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
