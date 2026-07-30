import diplomaStudentStore from '@stores/DiplomaStudentStore'
import { Input } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useStore } from 'zustand'
const { Search } = Input

function DiplomaStudentSearch() {

  const { searchQuery, setSearchQuery } = useStore(diplomaStudentStore)
  const nav = useNavigate()

  const onSearch = (value) => {
    if (value === "") {
      setSearchQuery(null)
      return
    }
    nav(`?view=All Students&page=1`, { replace: true });
    setSearchQuery(value)
  }

  return (
    <div className='| w-full lg:w-1/4'>
      <Search
        placeholder="Search by name, email or phone number..."
        onSearch={onSearch}
        defaultValue={searchQuery}
      />
    </div>
  )
}

export default DiplomaStudentSearch
