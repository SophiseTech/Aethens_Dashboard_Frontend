import Title from '@components/layouts/Title'
import AddInventoryItem from '@pages/Inventory/Components/AddInventoryItem';
import RaiseRequest from '@pages/Inventory/Components/RaiseRequest';
import RequestList from '@pages/Inventory/Components/RequestList';
import inventoryStore from '@stores/InventoryStore'
import requestsStore from '@stores/RequestsStore';
import userStore from '@stores/UserStore';
import { Button, Drawer, Flex, Skeleton, Table } from 'antd';
import _ from 'lodash';
import React, { lazy, Suspense, useEffect, useState } from 'react'

const InventoryList = lazy(() => import('@pages/Inventory/Components/InventoryList'));

function Inventory() {

  const { getItems, items, getInventory, inventory } = inventoryStore()
  const { user } = userStore()
  const [drawerState, setDrawerState] = useState(false);
  const { requests, getRequests, approveRequest, rejectRequest, loading } = requestsStore()

  useEffect(() => {
    // if (!items || items.length <= 0) {
    //   getItems(30, {
    //     sort: "-createdAt"
    //   })
    // }
    if (_.isEmpty(inventory)) {
      getInventory({ query: { center_id: user.center_id } })
    }
  }, [])

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

  return (
    <Title title={"Inventory"} button={<Flex gap={20}>
      <RaiseRequest />
      <Button variant='filled' color='orange' onClick={() => { setDrawerState(true) }}>Requests</Button>
      <AddInventoryItem />
    </Flex>}>
      <Suspense fallback={<Loader />}>
        <InventoryList />
      </Suspense>
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
          loading={loading}
        />
      </Drawer>
    </Title>
  )
}

const Loader = () => (
  <Skeleton />
)

export default Inventory