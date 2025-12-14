import walletStore from '@stores/WalletStore'
import { Input } from 'antd'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from 'zustand'

const { Search } = Input

function WalletSearch() {
  const { searchWallets, searchQuery, setSearchQuery } = useStore(walletStore)
  const nav = useNavigate()

  const onSearch = (value) => {
    if (!value || value.trim() === "") {
      setSearchQuery(null)
      return
    }

    // Move to wallets page & reset pagination
    nav(`?page=1`, { replace: true })

    setSearchQuery(value)

    searchWallets(10, {
      searchQuery: value,
    }, 1)
  }

  return (
    <div className="w-full lg:w-1/4">
      <Search
        placeholder="Search by student name, admission no, phone or email..."
        onSearch={onSearch}
        defaultValue={searchQuery}
        allowClear
      />
    </div>
  )
}

export default WalletSearch
