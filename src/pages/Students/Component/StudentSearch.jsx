import studentStore from '@stores/StudentStore'
import { ROLES } from '@utils/constants'
import { Input } from 'antd'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from 'zustand'
const { Search } = Input

function StudentSearch() {

  const { search, searchQuery, setSearchQuery } = useStore(studentStore)
  const nav = useNavigate()

  const onSearch = (value, _e, info) => {
    if (value === "") {
      setSearchQuery(null)
      return
    }
    // fetchItems(value)
    nav(`?view=All Students&page=1`, { replace: true });
    setSearchQuery(value)

  }

  const fetchItems = (query) => {
    search(10, {
      searchQuery: query,
      query: { role: ROLES.STUDENT }
    }, 1)
  }


  return (
    <div className='| w-full lg:w-1/4'>
      <Search
        placeholder="Search by name, email, phone number and admission number..."
        onSearch={onSearch}
        defaultValue={searchQuery}
      />
    </div>
  )
}

export default StudentSearch