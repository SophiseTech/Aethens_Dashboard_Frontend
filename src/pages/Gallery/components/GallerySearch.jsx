import inventoryStore from '@stores/InventoryStore';
import { Input } from 'antd';
import React, { useState } from 'react'
import { useStore } from 'zustand';

const { Search } = Input

function GallerySearch() {

  const { searhcItems, searchQuery } = useStore(inventoryStore)

  const onSearch = (value, _e, info) => {
    fetchItems(value)
    // setSearchQuery(value)
  }

  const fetchItems = (query) => {
    searhcItems(10, {
      searchQuery: query
    })
  }

  return (
    <div className='| w-full lg:w-1/2'>
      <Search
        placeholder="Search by name, category and tags..."
        onSearch={onSearch}
        defaultValue={searchQuery}
      />
    </div>
  )
}

export default GallerySearch