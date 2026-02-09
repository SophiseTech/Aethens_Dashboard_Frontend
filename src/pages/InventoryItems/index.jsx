import Title from '@components/layouts/Title';
import AddInventoryItem from '@pages/Inventory/Components/AddInventoryItem';
import InventoryItemsList from '@pages/InventoryItems/Components/InventoryItemsList';
import permissions from '@utils/permissions';
import userStore from '@stores/UserStore';
import { Flex } from 'antd';
import React from 'react';

function InventoryItems() {
  const { user } = userStore();
  const canCreate = permissions.inventoryItems?.create?.includes(user?.role);

  return (
    <Title
      title="Inventory Items"
      button={
        canCreate ? (
          <Flex gap={20}>
            <AddInventoryItem />
          </Flex>
        ) : null
      }
    >
      <InventoryItemsList />
    </Title>
  );
}

export default InventoryItems;
