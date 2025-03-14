import studentStore from '@stores/StudentStore'
import { ROLES } from '@utils/constants'
import { Input } from 'antd'
import React from 'react'
import { useStore } from 'zustand'
const { Search } = Input

function StudentSearch() {

  const { search, searchQuery, setSearchQuery } = useStore(studentStore)

  const onSearch = (value, _e, info) => {
    if(value === ""){
      setSearchQuery(null)
      return
    }
    fetchItems(value)
    // setSearchQuery(value)
  }

  const fetchItems = (query) => {
    search(10, {
      searchQuery: query,
      query: { role: ROLES.STUDENT }
    })
  }


  return (
    <div className='| w-full lg:w-1/4'>
      <Search
        placeholder="Search by name, email and admission number..."
        onSearch={onSearch}
        defaultValue={searchQuery}
      />
    </div>
  )
}

export default StudentSearch